from flask import Flask, request, jsonify
from flask_cors import CORS
from werkzeug.utils import secure_filename
import os
import hashlib
import requests
from dotenv import load_dotenv
import pefile
import re
import boto3
import uuid

load_dotenv()
app = Flask(__name__)

CORS(app, resources={r"/*": {"origins": [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "https://static-analyzer.vercel.app",
    "https://static-analyzer-zh53.onrender.com"
]}})

# Change to /tmp for AWS Lambda compatibility
UPLOAD_FOLDER = "/tmp"
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

ALLOWED_EXTENSIONS = {'.exe'}
VIRUSTOTAL_API_KEY = os.getenv("VIRUSTOTAL_API_KEY")
VT_API_URL = "https://www.virustotal.com/api/v3"

def allowed_file(filename):
    return os.path.splitext(filename)[1].lower() in ALLOWED_EXTENSIONS

def is_valid_pe_file(file_path):
    """Verify if the file is a valid PE executable"""
    try:
        with open(file_path, 'rb') as f:
            dos_header = f.read(2)
            if dos_header != b'MZ':
                return False, "File does not have a valid PE/DOS header (MZ signature missing)"
        
        pe = pefile.PE(file_path, fast_load=True)
        pe.close()
        return True, "Valid PE file"
    except pefile.PEFormatError as e:
        return False, f"Invalid PE file format: {str(e)}"
    except Exception as e:
        return False, f"Error validating file: {str(e)}"

def calculate_hashes(file_path):
    md5 = hashlib.md5()
    sha1 = hashlib.sha1()
    sha256 = hashlib.sha256()
    with open(file_path, "rb") as f:
        for chunk in iter(lambda: f.read(4096), b""):
            md5.update(chunk)
            sha1.update(chunk)
            sha256.update(chunk)
    return {
        "md5": md5.hexdigest(),
        "sha1": sha1.hexdigest(),
        "sha256": sha256.hexdigest()
    }

def get_pe_info(file_path):
    try:
        pe = pefile.PE(file_path)
        info = {
            "entry_point": hex(pe.OPTIONAL_HEADER.AddressOfEntryPoint),
            "image_base": hex(pe.OPTIONAL_HEADER.ImageBase),
            "compile_time": pe.FILE_HEADER.TimeDateStamp
        }
        pe.close()
        return info
    except pefile.PEFormatError as e:
        raise ValueError(f"Invalid PE file format: {str(e)}")
    except Exception as e:
        raise ValueError(f"Error parsing PE file: {str(e)}")

def get_sections_info(file_path):
    try:
        pe = pefile.PE(file_path)
        sections = []
        for section in pe.sections:
            sections.append({
                "name": section.Name.decode(errors="ignore").strip("\x00"),
                "virtual_size": hex(section.Misc_VirtualSize),
                "raw_size": hex(section.SizeOfRawData),
                "entropy": section.get_entropy()
            })
        pe.close()
        return sections
    except Exception as e:
        raise ValueError(f"Error extracting sections: {str(e)}")

def get_imports(file_path):
    try:
        pe = pefile.PE(file_path)
        imports = []
        if hasattr(pe, 'DIRECTORY_ENTRY_IMPORT'):
            for entry in pe.DIRECTORY_ENTRY_IMPORT:
                dll = entry.dll.decode()
                funcs = [imp.name.decode() if imp.name else "None" for imp in entry.imports]
                imports.append({"dll": dll, "functions": funcs})
        pe.close()
        return imports
    except Exception as e:
        raise ValueError(f"Error extracting imports: {str(e)}")

def extract_strings(file_path, min_length=4):
    strings = []
    with open(file_path, "rb") as f:
        data = f.read()
        pattern = rb'[\x20-\x7E]{' + bytes(str(min_length), 'utf-8') + rb',}'
        found = re.findall(pattern, data)
        strings = [s.decode(errors="ignore") for s in found]
    return strings[:1000]

def guess_language(file_path):
    try:
        pe = pefile.PE(file_path)
        imports = [entry.dll.decode().lower() for entry in getattr(pe, 'DIRECTORY_ENTRY_IMPORT', [])]

        dotnet_present = any(dll in imports for dll in ['mscoree.dll', 'clr.dll'])
        vb_runtime = any("vbrun" in dll for dll in imports)
        python_runtime = any("python" in dll for dll in imports)
        qt_or_cpp = any(dll in imports for dll in ['qt5core.dll', 'msvcp140.dll', 'vcruntime140.dll'])

        if dotnet_present:
            return "Likely .NET (C#, VB.NET, etc.)"
        elif vb_runtime:
            return "Likely Visual Basic"
        elif python_runtime:
            return "Likely Python (compiled with PyInstaller or similar)"
        elif qt_or_cpp:
            return "Likely C++ (QT or MSVC-based)"
        else:
            return "Likely Native C/C++"
    except Exception as e:
        return "Unknown"

@app.route("/upload", methods=["POST"])
def upload_file():
    if 'file' not in request.files:
        return jsonify({"error": "No file uploaded"}), 400

    file = request.files['file']
    if file.filename == '':
        return jsonify({"error": "Empty file name"}), 400

    if not allowed_file(file.filename):
        return jsonify({"error": "Only .exe files are allowed"}), 400

    filepath = os.path.join(app.config['UPLOAD_FOLDER'], secure_filename(file.filename))
    file.save(filepath)

    is_valid, validation_message = is_valid_pe_file(filepath)
    if not is_valid:
        os.remove(filepath)
        return jsonify({
            "error": "Invalid executable file",
            "details": validation_message,
            "hint": "Please upload a valid Windows executable (.exe) file. The file must have a proper PE format with MZ header."
        }), 400

    try:
        result = calculate_hashes(filepath)
        pe_info = get_pe_info(filepath)
        sections = get_sections_info(filepath)
        imports = get_imports(filepath)
        strings = extract_strings(filepath)
        language = guess_language(filepath)

        return jsonify({
            "filename": file.filename,
            "hashes": result,
            "pe_info": pe_info,
            "sections": sections,
            "imports": imports,
            "language_guess": language,
            "extracted_strings": strings
        })
    except Exception as e:
        if os.path.exists(filepath):
            os.remove(filepath)
        return jsonify({"error": f"Error analyzing file: {str(e)}"}), 500

@app.route("/api/get-upload-url", methods=["POST"])
def get_upload_url():
    data = request.json
    filename = data.get('filename')
    
    if not filename or not allowed_file(filename):
        return jsonify({"error": "Invalid filename or extension. Only .exe allowed."}), 400

    bucket_name = os.environ.get('UPLOAD_BUCKET_NAME')
    if not bucket_name:
        return jsonify({"error": "S3 bucket not configured on the server."}), 500

    file_key = f"{uuid.uuid4()}-{secure_filename(filename)}"
    s3_client = boto3.client('s3')
    
    try:
        presigned_url = s3_client.generate_presigned_url(
            'put_object',
            Params={
                'Bucket': bucket_name,
                'Key': file_key,
                'ContentType': 'application/octet-stream'
            },
            ExpiresIn=3600
        )
        return jsonify({
            "upload_url": presigned_url,
            "file_key": file_key
        })
    except Exception as e:
        return jsonify({"error": f"Could not generate upload URL: {str(e)}"}), 500

@app.route("/api/analyze-s3", methods=["POST"])
def analyze_s3():
    data = request.json
    file_key = data.get('file_key')
    filename = data.get('filename') or file_key
    
    if not file_key:
        return jsonify({"error": "No file_key provided"}), 400

    bucket_name = os.environ.get('UPLOAD_BUCKET_NAME')
    s3_client = boto3.client('s3')
    filepath = os.path.join(app.config['UPLOAD_FOLDER'], secure_filename(file_key))

    try:
        # Download from S3 to Lambda /tmp
        s3_client.download_file(bucket_name, file_key, filepath)
        
        # Delete from S3 right away to save storage costs
        s3_client.delete_object(Bucket=bucket_name, Key=file_key)
        
        is_valid, validation_message = is_valid_pe_file(filepath)
        if not is_valid:
            os.remove(filepath)
            return jsonify({
                "error": "Invalid executable file",
                "details": validation_message,
                "hint": "Please upload a valid Windows executable (.exe) file. The file must have a proper PE format with MZ header."
            }), 400

        result = calculate_hashes(filepath)
        pe_info = get_pe_info(filepath)
        sections = get_sections_info(filepath)
        imports = get_imports(filepath)
        strings = extract_strings(filepath)
        language = guess_language(filepath)

        os.remove(filepath)

        return jsonify({
            "filename": filename,
            "hashes": result,
            "pe_info": pe_info,
            "sections": sections,
            "imports": imports,
            "language_guess": language,
            "extracted_strings": strings
        })
    except Exception as e:
        if os.path.exists(filepath):
            os.remove(filepath)
        return jsonify({"error": f"Error analyzing S3 file: {str(e)}"}), 500

@app.route("/api/virustotal/upload", methods=["POST"])
def upload_to_virustotal():
    if 'file' not in request.files:
        return jsonify({"error": "No file uploaded"}), 400

    file = request.files['file']
    filename = secure_filename(file.filename)
    files = {"file": (filename, file.stream)}

    headers = {
        "x-apikey": VIRUSTOTAL_API_KEY
    }

    response = requests.post(f"{VT_API_URL}/files", headers=headers, files=files)
    if response.status_code != 200:
        return jsonify({"error": "VirusTotal upload failed", "details": response.text}), 500

    return jsonify(response.json())

@app.route("/api/virustotal/analysis/<analysis_id>", methods=["GET"])
def get_analysis_result(analysis_id):
    headers = {
        "x-apikey": VIRUSTOTAL_API_KEY
    }

    response = requests.get(f"{VT_API_URL}/analyses/{analysis_id}", headers=headers)
    if response.status_code != 200:
        return jsonify({"error": "Analysis fetch failed", "details": response.text}), 500

    return jsonify(response.json())

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=True)