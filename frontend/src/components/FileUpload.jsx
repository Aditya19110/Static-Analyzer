import React, { useState } from "react";
import { Upload, AlertCircle, CheckCircle2 } from "lucide-react";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

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
      alert("Only .exe files are allowed for security analysis.");
    }
  };

  const handleChange = (e) => {
    const selected = e.target.files[0];
    if (selected && selected.name.endsWith(".exe")) {
      setFile(selected);
    } else {
      alert("Only .exe files are allowed for security analysis.");
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

      const uploadRes = await fetch(`${API_URL}/upload`, {
        method: "POST",
        body: formData,
      });
      const result = await uploadRes.json();

      if (uploadRes.status !== 200 || result.error) {
        const errorMsg = result.details
          ? `${result.error}\n\n${result.details}\n\n${result.hint || ''}`
          : result.error || "Static analysis failed";
        throw new Error(errorMsg);
      }

      setProgress(40);

      const vtRes = await fetch(`${API_URL}/api/virustotal/upload`, {
        method: "POST",
        body: formData,
      });
      const vtUpload = await vtRes.json();

      if (vtRes.status !== 200 || vtUpload.error) {
        throw new Error(vtUpload.error || "VirusTotal upload failed");
      }

      const analysisId = vtUpload.data.id;
      setProgress(60);

      const pollResult = async () => {
        const analysisRes = await fetch(
          `${API_URL}/api/virustotal/analysis/${analysisId}`
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

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div
      className={`relative border-2 border-dashed rounded-xl p-4 md:p-8 transition-all duration-300 ${dragActive
          ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 scale-105"
          : "border-slate-300 dark:border-slate-600 hover:border-indigo-400 dark:hover:border-indigo-500"
        }`}
      onDragEnter={handleDrag}
      onDragOver={handleDrag}
      onDragLeave={handleDrag}
      onDrop={handleDrop}
    >
      <div className="flex flex-col items-center justify-center text-center space-y-4">
        <div className="bg-indigo-100 dark:bg-indigo-900/30 p-4 rounded-full">
          <Upload className="w-12 h-12 text-indigo-600 dark:text-indigo-400" />
        </div>

        <label className="cursor-pointer group">
          <input
            type="file"
            accept=".exe"
            onChange={handleChange}
            className="hidden"
          />
          <div className="space-y-2">
            <p className="text-xl font-semibold text-slate-800 dark:text-slate-200">
              Drag & Drop or <span className="text-indigo-600 dark:text-indigo-400 group-hover:underline">Browse</span>
            </p>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Only .exe files allowed. Files are analyzed securely.
            </p>
          </div>
        </label>

        {file && (
          <div className="flex items-center space-x-3 bg-green-50 dark:bg-green-900/20 px-4 py-2 rounded-lg border border-green-200 dark:border-green-800 mt-4">
            <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
            <div className="text-left">
              <p className="text-sm font-medium text-slate-700 dark:text-slate-200">{file.name}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">{formatFileSize(file.size)}</p>
            </div>
          </div>
        )}

        <div className="w-full max-w-xs mt-6">
          <button
            onClick={handleUpload}
            disabled={!file || progress > 0}
            className={`w-full py-3 px-6 rounded-lg font-semibold text-white shadow-lg transition-all duration-300 ${!file || progress > 0
                ? "bg-slate-400 cursor-not-allowed"
                : "bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 hover:scale-[1.02] active:scale-[0.98]"
              }`}
          >
            {progress > 0 ? (
              <span className="flex items-center justify-center gap-2">
                <AlertCircle className="w-5 h-5 animate-spin" />
                Analyzing... {progress}%
              </span>
            ) : (
              "Start Security Scan"
            )}
          </button>
        </div>

        {progress > 0 && (
          <div className="w-full max-w-xs bg-slate-200 dark:bg-slate-700 rounded-full h-2.5 mt-4 overflow-hidden">
            <div
              className="bg-indigo-600 h-2.5 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FileUpload;