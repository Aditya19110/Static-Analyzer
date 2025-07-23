import React, { useState, useEffect } from "react";
import FileUpload from "../components/FileUpload";
import AnalysisResult from "../components/AnalysisResult";
import "./App.css";

const Home = () => {
  const [analysisResult, setAnalysisResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const resetAnalysis = () => {
    setAnalysisResult(null);
    setLoading(false);
  };

  return (
    <div className="App">
      <header className="app-header">
        <div className="header-content">
          <img 
            src="/logo192.png" 
            alt="Silent Scan Logo" 
            className="logo" 
            style={{
              opacity: mounted ? 1 : 0,
              transform: mounted ? 'translateY(0)' : 'translateY(-20px)',
              transition: 'all 0.8s ease-out'
            }}
          />
          <div style={{
            opacity: mounted ? 1 : 0,
            transform: mounted ? 'translateX(0)' : 'translateX(-30px)',
            transition: 'all 0.8s ease-out 0.2s'
          }}>
            <h1>Silent Scan</h1>
            <p className="tagline">
              🔍 Analyze .exe files securely using advanced static analysis
            </p>
          </div>
        </div>
      </header>

      <main className="app-main">
        {/* Only show upload if there's no result */}
        {!analysisResult && (
          <div style={{
            opacity: mounted ? 1 : 0,
            transform: mounted ? 'translateY(0)' : 'translateY(30px)',
            transition: 'all 0.8s ease-out 0.4s'
          }}>
            <FileUpload
              setAnalysisResult={setAnalysisResult}
              setLoading={setLoading}
            />
          </div>
        )}

        {loading && (
          <div className="loading">
            ⚡ Analyzing file, please wait...
            <div style={{ 
              marginTop: '1rem', 
              fontSize: '0.9rem', 
              opacity: '0.8',
              animation: 'pulse 2s ease-in-out infinite' 
            }}>
              Running static analysis and VirusTotal scan
            </div>
          </div>
        )}

        {/* Show detailed result */}
        {analysisResult && !loading && (
          <div style={{
            animation: 'fadeInUp 0.8s ease-out'
          }}>
            <AnalysisResult result={analysisResult} onReset={resetAnalysis} />
          </div>
        )}
      </main>

      <footer className="app-footer">
        <p style={{ margin: '0', fontWeight: '600' }}>
          🛡️ SilentScan - 2025
        </p>
        <p className="footer-note">
          Stay protected. Analyze before you trust. 
          <span style={{ marginLeft: '0.5rem', opacity: '0.6' }}>
            • No file execution • Privacy focused • Open source
          </span>
        </p>
      </footer>
    </div>
  );
};

export default Home;
