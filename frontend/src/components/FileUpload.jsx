import React, { useState } from "react";
import { Upload, FileIcon, AlertCircle, CheckCircle2 } from "lucide-react";
import "./Analysis.css";

const FileUpload = ({ setAnalysisResult, setLoading }) => {
  const [file, setFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (["dragenter", "dragover"].includes(e.type)) {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && droppedFile.name.endsWith(".exe")) {
      setFile(droppedFile);
    } else {
      alert("⚠️ Only .exe files are allowed for security analysis.");
    }
  };

  const handleChange = (e) => {
    const selected = e.target.files[0];
    if (selected && selected.name.endsWith(".exe")) {
      setFile(selected);
    } else {
      alert("⚠️ Only .exe files are allowed for security analysis.");
    }
  };

  const handleUpload = async () => {
    if (!file) {
      alert("📁 Please select a .exe file first!");
      return;
    }

    try {
      setLoading(true);
      setProgress(10);

      const formData = new FormData();
      formData.append("file", file);

      // 1️⃣ Static Analysis
      const uploadRes = await fetch("https://static-analyzer-zh53.onrender.com/upload", {
        method: "POST",
        body: formData,
      });
      const result = await uploadRes.json();

      if (uploadRes.status !== 200 || result.error) {
        throw new Error(result.error || "Static analysis failed");
      }

      setProgress(40);

      // 2️⃣ VirusTotal Upload
      const vtRes = await fetch("https://static-analyzer-zh53.onrender.com/api/virustotal/upload", {
        method: "POST",
        body: formData,
      });
      const vtUpload = await vtRes.json();

      if (vtRes.status !== 200 || vtUpload.error) {
        throw new Error(vtUpload.error || "VirusTotal upload failed");
      }

      const analysisId = vtUpload.data.id;
      setProgress(60);

      // 3️⃣ Polling VirusTotal Result
      const pollResult = async () => {
        const analysisRes = await fetch(
          `https://static-analyzer-zh53.onrender.com/api/virustotal/analysis/${analysisId}`
        );
        const analysisData = await analysisRes.json();

        if (analysisData.data?.attributes?.status !== "completed") {
          setTimeout(pollResult, 3000);
        } else {
          setProgress(100);
          setAnalysisResult({
            ...result,
            virustotal: analysisData,
          });
          setLoading(false);
        }
      };

      pollResult();
    } catch (err) {
      console.error("Upload failed:", err);
      alert("❌ Error uploading or analyzing file: " + (err.message || "Unknown error"));
      setLoading(false);
      setProgress(0);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div
      className={`file-upload-container ${dragActive ? "drag-active" : ""}`}
      onDragEnter={handleDrag}
      onDragOver={handleDrag}
      onDragLeave={handleDrag}
      onDrop={handleDrop}
    >
      <div className="upload-box">
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
          <Upload size={48} style={{ color: '#00e676', opacity: 0.8 }} />
        </div>
        
        <label className="upload-label">
          <input
            type="file"
            accept=".exe"
            onChange={handleChange}
            className="file-input"
          />
          <p style={{ fontSize: '1.3rem', fontWeight: '500', marginBottom: '0.5rem' }}>
            � <strong>Secure Malware Analysis</strong>
          </p>
          <p>
            Drag & Drop your <strong>.exe</strong> file here or{" "}
            <span className="browse-link">click to browse</span>
          </p>
          <p style={{ fontSize: '0.9rem', color: '#94a3b8', marginTop: '0.5rem' }}>
            File will be analyzed safely without execution
          </p>
        </label>

        {file && (
          <div className="file-selected">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <CheckCircle2 size={20} style={{ color: '#00e676' }} />
              <FileIcon size={20} style={{ color: '#00e676' }} />
            </div>
            <p style={{ margin: '0', fontWeight: '600', fontSize: '1.1rem' }}>
              {file.name}
            </p>
            <p style={{ margin: '0.3rem 0 0 0', fontSize: '0.9rem', opacity: '0.8' }}>
              Size: {formatFileSize(file.size)}
            </p>
          </div>
        )}

        <button onClick={handleUpload} disabled={!file || progress > 0}>
          {progress > 0 ? (
            <>
              <AlertCircle className="icon" style={{ animation: 'spin 1s linear infinite' }} />
              Analyzing... {progress}%
            </>
          ) : (
            <>
              <Upload className="icon" />
              Start Analysis
            </>
          )}
        </button>

        {progress > 0 && (
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${progress}%` }}></div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FileUpload;