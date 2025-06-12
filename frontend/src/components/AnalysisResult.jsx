import React from "react";
import "./Analysis.css";

const AnalysisResult = ({ result }) => {
  if (!result) return null;

  const vtStats = result?.virustotal?.data?.attributes?.last_analysis_stats;
  const analysisResults = result?.virustotal?.data?.attributes?.last_analysis_results;
  const sections = result?.sections || [];
  const imports = result?.imports || [];

  return (
    <div className="analysis-wrapper">
      <h2 className="main-title">Analysis Report</h2>

      {/* Section Info */}
      <div className="card">
        <h3 className="card-title">Section Info</h3>
        <table className="styled-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Virtual Size</th>
              <th>Raw Size</th>
              <th>Entropy</th>
            </tr>
          </thead>
          <tbody>
            {sections.map((sec, idx) => (
              <tr key={idx}>
                <td>{sec.name}</td>
                <td>{sec.virtual_size}</td>
                <td>{sec.raw_size}</td>
                <td>{sec.entropy}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Imports */}
      <div className="card">
        <h3 className="card-title">Imported DLLs & Functions</h3>
        {imports.length > 0 ? (
          imports.map((dll, i) => (
            <div key={i} className="import-block">
              <strong>{dll.dll}</strong>
              <ul>
                {dll.functions.map((func, j) => <li key={j}>{func}</li>)}
              </ul>
            </div>
          ))
        ) : (
          <p className="empty-msg">No import data found.</p>
        )}
      </div>

      {/* VirusTotal Summary */}
      <div className="card">
        <h3 className="card-title">VirusTotal Summary</h3>
        <ul className="summary-list">
          <li><span className="dot red" /> Malicious: {vtStats?.malicious}</li>
          <li><span className="dot yellow" /> Suspicious: {vtStats?.suspicious}</li>
          <li><span className="dot green" /> Harmless: {vtStats?.harmless}</li>
          <li><span className="dot gray" /> Undetected: {vtStats?.undetected}</li>
        </ul>
      </div>

      {/* Per Vendor Analysis */}
      <div className="card">
        <h3 className="card-title">Vendor-wise Detection</h3>
        <table className="styled-table">
          <thead>
            <tr>
              <th>Vendor</th>
              <th>Status</th>
              <th>Result</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(analysisResults).map(([vendor, data], i) => (
              <tr key={i} className={`status-${data.category}`}>
                <td>{vendor}</td>
                <td>{data.category}</td>
                <td>{data.result || "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AnalysisResult;