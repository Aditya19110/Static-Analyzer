import React, { useState } from "react";
import FileUpload from "./components/FileUpload";
import "./App.css";

const App = () => {
  const [analysisResult, setAnalysisResult] = useState(null);
  const [loading, setLoading] = useState(false);

  return (
    <div className="App">
      <header className="app-header">
        <div className="header-content">
        <img src="/logo192.png" alt="Analyzer Logo" className="logo" />
          <div>
            <h1>Silent Scan</h1>
            <p className="tagline">Analyze .exe files securely using static analyzer</p>
          </div>
        </div>
      </header>

      <main className="app-main">
        <FileUpload setAnalysisResult={setAnalysisResult} setLoading={setLoading} />

        {loading && <p className="loading">Analyzing file, please wait...</p>}

        {analysisResult && (
          <div className="result">
            <h3>Analysis Result:</h3>
            <pre>{JSON.stringify(analysisResult, null, 2)}</pre>
          </div>
        )}
      </main>

      <footer className="app-footer">
        <p>SilentScan - 2025</p>
        <p className="footer-note">Stay protected. Analyze before you trust.</p>
      </footer>
    </div>
  );
};

export default App;