import React from "react";
import { ShieldCheck, ShieldX, AlertTriangle, Loader2 } from "lucide-react";
import "./Analysis.css";

const AnalysisResult = ({ result }) => {
  if (!result) return null;

  const vtData = result.virustotal;
  const stats = vtData?.data?.attributes?.stats;
  const results = vtData?.data?.attributes?.results;

  return (
    <div className="analysis-container">
      <h2 className="section-title">Malware Analysis</h2>
      <button onClick={() => window.location.reload()} className="reupload-button">Re-Upload App</button>
      {result.hashes && (
        <div className="card">
          <h4>File Hashes</h4>
          <p><strong>MD5:</strong> {result.hashes.md5}</p>
          <p><strong>SHA1:</strong> {result.hashes.sha1}</p>
        </div>
      )}
      <h2 className="section-title">VirusTotal Analysis</h2>
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
      )}
    </div>
  );
};

export default AnalysisResult;