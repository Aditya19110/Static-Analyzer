import React from "react";
import { ShieldCheck, ShieldX, AlertTriangle, Loader2, Download } from "lucide-react";
import "./Analysis.css";

const AnalysisResult = ({ result }) => {
  if (!result) return <p className="loading-msg">No analysis result yet.</p>;

  const vtData = result.virustotal;
  const stats = vtData?.data?.attributes?.stats;
  const results = vtData?.data?.attributes?.results;

  const handleDownloadReport = () => {
    const blob = new Blob([JSON.stringify(result, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${result.filename || "analysis-report"}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <main className="analysis-wrapper">
      <div className="analysis-container">
        <h2 className="section-title">Malware Analysis</h2>
        <div className="button-row">
          <button onClick={() => window.location.reload()} className="reupload-button">
            Re-Upload App
          </button>
          <button onClick={handleDownloadReport} className="download-button">
            <Download className="icon" /> Download Report
          </button>
        </div>

        {result.hashes && (
          <div className="card">
            <h4>File Hashes</h4>
            <p><strong>MD5:</strong> {result.hashes.md5}</p>
            <p><strong>SHA1:</strong> {result.hashes.sha1}</p>
            <p><strong>SHA256:</strong> {result.hashes.sha256}</p>
          </div>
        )}

        {result.pe_info && (
          <div className="card">
            <h4>PE Header Info</h4>
            <p><strong>Entry Point:</strong> {result.pe_info.entry_point}</p>
            <p><strong>Image Base:</strong> {result.pe_info.image_base}</p>
            <p><strong>Compile Time:</strong> {result.pe_info.compile_time}</p>
          </div>
        )}

        {result.sections && (
          <div className="card">
            <h4>Section Info</h4>
            <div className="results-table-wrapper">
              <table className="results-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Virtual Size</th>
                    <th>Raw Size</th>
                    <th>Entropy</th>
                  </tr>
                </thead>
                <tbody>
                  {result.sections.map((sec, i) => (
                    <tr key={i}>
                      <td>{sec.name}</td>
                      <td>{sec.virtual_size}</td>
                      <td>{sec.raw_size}</td>
                      <td>{sec.entropy ? sec.entropy.toFixed(2) : "N/A"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {result.imports && (
          <div className="card">
            <h4>Imported DLLs & Functions</h4>
            {result.imports.map((imp, i) => (
              <div key={i}>
                <strong>{imp.dll}</strong>
                <ul>
                  {imp.functions.map((fn, j) => (
                    <li key={j}>{fn}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}

        {result.language_guess && (
          <div className="card">
            <h4>Likely Programming Language</h4>
            <p>{result.language_guess}</p>
          </div>
        )}

        {result.strings && (
          <div className="card">
            <h4>Extracted Strings</h4>
            <div className="string-box">
              <pre>{result.strings.join("\n")}</pre>
            </div>
          </div>
        )}

        <h2 className="section-title">VirusTotal Analysis</h2>

        {!vtData && (
          <div className="card">
            <p>VirusTotal scan not available.</p>
          </div>
        )}

        {stats && (
          <div className="card">
            <h4>VirusTotal Summary</h4>
            <ul className="stats-list">
              <li><ShieldX className="icon red" /> <strong>Malicious:</strong> {stats.malicious}</li>
              <li><AlertTriangle className="icon yellow" /> <strong>Suspicious:</strong> {stats.suspicious}</li>
              <li><ShieldCheck className="icon green" /> <strong>Harmless:</strong> {stats.harmless}</li>
              <li><Loader2 className="icon gray" /> <strong>Undetected:</strong> {stats.undetected}</li>
            </ul>
          </div>
        )}

        {results && (
          <div className="card">
            <h4>Detailed Scan Results</h4>
            <div className="results-table-wrapper">
              <table className="results-table">
                <thead>
                  <tr>
                    <th>Engine</th>
                    <th>Category</th>
                    <th>Result</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(results).map(([engine, details]) => (
                    <tr key={engine}>
                      <td>{engine}</td>
                      <td>{details.category}</td>
                      <td className={
                        details.result === null
                          ? "clean"
                          : details.result === "malicious"
                          ? "malicious"
                          : "suspicious"
                      }>
                        {details.result || "Clean"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </main>
  );
};

export default AnalysisResult;