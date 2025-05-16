import os
import requests
from flask import Blueprint, request, jsonify
from werkzeug.utils import secure_filename
from dotenv import load_dotenv

load_dotenv()

virustotal_bp = Blueprint("virustotal", __name__)

VIRUSTOTAL_API_KEY = os.getenv("VIRUSTOTAL_API_KEY")
VT_API_URL = "https://www.virustotal.com/api/v3"

@virustotal_bp.route("/api/virustotal/upload", methods=["POST"])
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
        return jsonify({
            "error": "VirusTotal upload failed",
            "details": response.text
        }), response.status_code

    return jsonify(response.json())


@virustotal_bp.route("/api/virustotal/analysis/<analysis_id>", methods=["GET"])
def get_analysis_result(analysis_id):
    headers = {
        "x-apikey": VIRUSTOTAL_API_KEY
    }

    response = requests.get(f"{VT_API_URL}/analyses/{analysis_id}", headers=headers)

    if response.status_code != 200:
        return jsonify({
            "error": "Failed to retrieve analysis results",
            "details": response.text
        }), response.status_code

    return jsonify(response.json())
