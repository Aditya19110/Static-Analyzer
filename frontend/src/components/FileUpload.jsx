import React, { useState } from "react";
import axios from "axios";
import { Loader2 } from "lucide-react";
import "./Analysis.css";

const FileUpload = ({ setResult }) => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setError("");
  };

  const handleUpload = async () => {
    if (!file) {
      setError("Please select a file.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    setUploading(true);
    setError("");

    try {
      const response = await axios.post("https://static-analyzer-zh53.onrender.com", formData);
      if (response?.data) {
        setResult(response.data);
      } else {
        setError("No result returned from server.");
      }
    } catch (err) {
      console.error("Upload failed:", err);
      setError("Error uploading or analyzing file.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="upload-wrapper">
      <input
        type="file"
        onChange={handleFileChange}
        accept=".exe"
        className="upload-input"
      />
      <button
        onClick={handleUpload}
        className="upload-button"
        disabled={uploading}
      >
        {uploading ? (
          <Loader2 className="spinner" />
        ) : (
          "Upload & Analyze"
        )}
      </button>
      {error && <p className="error-message">{error}</p>}
    </div>
  );
};

export default FileUpload;