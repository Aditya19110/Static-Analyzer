Silent Scan - Static Malware Analyzer

Silent Scan is a static malware analysis web application that allows users to upload
`.exe` files and receive a detailed analysis report without executing the file. It
computes file hashes and performs static inspection securely.
Project Structure
SilentScan/
├── frontend/ ├── backend/ └── README.md
# React.js frontend for user interface
# Flask backend for static analysis
Requirements
Backend (Python)
- Python 3.8+
- Flask
- Flask-CORS
Install all dependencies with:
pip install -r requirements.txt
Frontend (React)
Silent Scan - Static Malware Analyzer
- Node.js (v16 or above)
- npm
Getting Started
1. Clone the Repository
git clone https://github.com/Aditya19110/Static-Analyzer.git
cd Static-Analyzer
2. Start the Frontend
cd frontend
npm install
npm start
Runs the React app at:
http://localhost:3000
3. Start the Backend
cd backend
pip install -r requirements.txt
python app.py
Runs the Flask server at:
http://localhost:5000
Silent Scan - Static Malware Analyzer
Logo & Branding
Add your custom logo inside the public/ folder as logo.png for frontend.
Features
- Upload `.exe` files securely
- Static analysis using Python libraries
- Hash generation (MD5, SHA1)
- Clean, responsive UI with React
- No execution – safe static inspection
Note
Only `.exe` files are accepted for analysis.
License
MIT License. Free to use, modify, and distribute.
Made with
❤
by Aditya Kulkarni