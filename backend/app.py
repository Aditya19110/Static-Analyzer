from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import hashlib

app = Flask(__name__)
CORS(app)

UPLOAD_FOLDER = "uploads"
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

ALLOWED_EXTENSIONS = {'.exe'}

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

    filepath = os.path.join(app.config['UPLOAD_FOLDER'], file.filename)
    file.save(filepath)

    result = calculate_hashes(filepath)

    return jsonify({
        "filename": file.filename,
        "hashes": result
    })

if __name__ == "__main__":
    app.run(debug=True)