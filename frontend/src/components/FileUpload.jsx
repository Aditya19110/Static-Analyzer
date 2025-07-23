import React, { useState } from "react";
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
      alert("Only .exe files are allowed.");
    }
  };

  const handleChange = (e) => {
    const selected = e.target.files[0];
    if (selected && selected.name.endsWith(".exe")) {
      setFile(selected);
    } else {
      alert("Only .exe files are allowed.");
    }
  };

  const handleUpload = async () => {
    if (!file) {
      alert("Please select a .exe file first!");
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
      alert("Error uploading or analyzing file: " + (err.message || "Unknown error"));
      setLoading(false);
      setProgress(0);
    }
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
      <label className="upload-label">
        <input
          type="file"
          accept=".exe"
          onChange={handleChange}
          className="file-input"
        />
        <p>📂 Drag & Drop your <strong>.exe</strong> file here or <span className="browse-link">click to browse</span>.</p>
      </label>

      {file && <p className="file-selected">✅ Selected File: {file.name}</p>}
      <button onClick={handleUpload}>Analyze File</button>

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