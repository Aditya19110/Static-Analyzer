from flask import Flask, request, jsonify
from flask_cors import CORS
from werkzeug.utils import secure_filename
import os
import hashlib
import requests
from dotenv import load_dotenv

# Load .env file
load_dotenv()

app = Flask(__name__)
CORS(app)

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

    with open(file_path, "rb") as f:
        for chunk in iter(lambda: f.read(4096), b""):
            md5.update(chunk)
            sha1.update(chunk)

    return {
        "md5": md5.hexdigest(),
        "sha1": sha1.hexdigest()
    }

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

    result = calculate_hashes(filepath)

    return jsonify({
        "filename": file.filename,
        "hashes": result
    })

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
