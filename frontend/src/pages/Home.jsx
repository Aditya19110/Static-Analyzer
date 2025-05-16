import React, { useState } from "react";
import FileUpload from "../components/FileUpload";
import AnalysisResult from "../components/AnalysisResult"; // ✅ Import this
import "./App.css";

const Home = () => {
  const [analysisResult, setAnalysisResult] = useState(null);
  const [loading, setLoading] = useState(false);

  return (
    <div className="App">
      <header className="app-header">
        <div className="header-content">
          <img src="/logo192.png" alt="Analyzer Logo" className="logo" />
          <div>
            <h1>Silent Scan</h1>
            <p className="tagline">
              Analyze .exe files securely using static analyzer
            </p>
          </div>
        </div>
      </header>

      <main className="app-main">
        {/* Only show upload if there's no result */}
        {!analysisResult && (
          <FileUpload
            setAnalysisResult={setAnalysisResult}
            setLoading={setLoading}
          />
        )}

        {loading && <p className="loading">Analyzing file, please wait...</p>}

        {/* Show detailed result like VirusTotal */}
        {analysisResult && !loading && (
          <AnalysisResult result={analysisResult} />
        )}
      </main>

      <footer className="app-footer">
        <p>SilentScan - 2025</p>
        <p className="footer-note">Stay protected. Analyze before you trust.</p>
      </footer>
    </div>
  );
};

export default Home;
