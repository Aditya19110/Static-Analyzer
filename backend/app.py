from flask import Flask, request, jsonify
from flask_cors import CORS
from werkzeug.utils import secure_filename
import os
import hashlib
import requests
from dotenv import load_dotenv
import pefile

load_dotenv()
app = Flask(__name__)
CORS(app, origins=["https://static-analyzer.vercel.app"])

UPLOAD_FOLDER = "uploads"
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

ALLOWED_EXTENSIONS = {'.exe'}
VIRUSTOTAL_API_KEY = os.getenv("VIRUSTOTAL_API_KEY")
VT_API_URL = "https://www.virustotal.com/api/v3"

def allowed_file(filename):
    return os.path.splitext(filename)[1].lower() in ALLOWED_EXTENSIONS

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
    pe = pefile.PE(file_path)
    info = {
        "entry_point": hex(pe.OPTIONAL_HEADER.AddressOfEntryPoint),
        "image_base": hex(pe.OPTIONAL_HEADER.ImageBase),
        "compile_time": pe.FILE_HEADER.TimeDateStamp
    }
    return info

def get_sections_info(file_path):
    pe = pefile.PE(file_path)
    sections = []
    for section in pe.sections:
        sections.append({
            "name": section.Name.decode(errors="ignore").strip("\x00"),
            "virtual_size": hex(section.Misc_VirtualSize),
            "raw_size": hex(section.SizeOfRawData),
            "entropy": section.get_entropy()
        })
    return sections

def get_imports(file_path):
    pe = pefile.PE(file_path)
    imports = []
    if hasattr(pe, 'DIRECTORY_ENTRY_IMPORT'):
        for entry in pe.DIRECTORY_ENTRY_IMPORT:
            dll = entry.dll.decode()
            funcs = [imp.name.decode() if imp.name else "None" for imp in entry.imports]
            imports.append({"dll": dll, "functions": funcs})
    return imports

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

    try:
        result = calculate_hashes(filepath)
        pe_info = get_pe_info(filepath)
        sections = get_sections_info(filepath)
        imports = get_imports(filepath)
        language = guess_language(filepath)

        return jsonify({
            "filename": file.filename,
            "hashes": result,
            "pe_info": pe_info,
            "sections": sections,
            "imports": imports,
            "language_guess": language
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

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
    app.run(debug=True)