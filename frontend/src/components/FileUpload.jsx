import React, { useState } from "react";
import { uploadFile } from "../api/upload";

const FileUpload = ({ setAnalysisResult, setLoading }) => {
  const [file, setFile] = useState(null);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file) {
      alert("Please select a .exe file first!");
      return;
    }

    try {
      setLoading(true);
      const result = await uploadFile(file);
      setAnalysisResult(result);
    } catch (err) {
      console.error("Upload failed:", err);
      alert("Error uploading file.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="file-upload">
      <input type="file" accept=".exe" onChange={handleFileChange} />
      <button onClick={handleUpload}>Analyze File</button>
    </div>
  );
};

export default FileUpload;