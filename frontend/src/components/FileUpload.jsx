import React, { useState } from "react";

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

      const formData = new FormData();
      formData.append("file", file);

      // 🔗 1. Upload to backend to get hashes
      const uploadRes = await fetch("https://static-analyzer-ps4i.onrender.com/upload", {
        method: "POST",
        body: formData,
      });
      const result = await uploadRes.json();

      // 🔗 2. Upload to VirusTotal via backend
      const vtRes = await fetch("https://static-analyzer-ps4i.onrender.com/api/virustotal/upload", {
        method: "POST",
        body: formData,
      });
      const vtUpload = await vtRes.json();

      const analysisId = vtUpload.data.id;

      // 3. Polling function for analysis result
      const pollResult = async () => {
        const analysisRes = await fetch(
          `https://static-analyzer-ps4i.onrender.com/api/virustotal/analysis/${analysisId}`
        );
        const analysisData = await analysisRes.json();

        if (analysisData.data?.attributes?.status !== "completed") {
          setTimeout(pollResult, 3000); // Poll every 3 seconds
        } else {
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
      alert(
        "Error uploading or analyzing file: " +
          (err.response?.data?.error || err.message)
      );
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