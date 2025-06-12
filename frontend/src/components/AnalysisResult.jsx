import React from "react";
import { ShieldCheck, ShieldX, AlertTriangle, Loader2, RotateCcw } from "lucide-react";
import "./Analysis.css";

const AnalysisResult = ({ result }) => {
  if (!result) return <div className="analysis-placeholder">Upload a file to analyze.</div>;

  const vtData = result.virustotal;
  const stats = vtData?.data?.attributes?.stats;
  const results = vtData?.data?.attributes?.results;

  return (
    <div className="analysis-wrapper">
      <div className="header">
        <h1>Silent Scan Results</h1>
        <button className="reupload-btn" onClick={() => window.location.reload()}>
          <RotateCcw size={18} /> Re-Upload
        </button>
      </div>

      {result.hashes && (
        <section className="card">
          <h2>File Hashes</h2>
          <p><strong>MD5:</strong> {result.hashes.md5}</p>
          <p><strong>SHA1:</strong> {result.hashes.sha1}</p>
          <p><strong>SHA256:</strong> {result.hashes.sha256}</p>
        </section>
      )}

      {result.pe_info && (
        <section className="card">
          <h2>PE Header</h2>
          <p><strong>Entry Point:</strong> {result.pe_info.entry_point}</p>
          <p><strong>Image Base:</strong> {result.pe_info.image_base}</p>
          <p><strong>Compile Time:</strong> {result.pe_info.compile_time}</p>
        </section>
      )}

      {result.sections && (
        <section className="card">
          <h2>Section Info</h2>
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
              {result.sections.map((sec, i) => (
                <tr key={i}>
                  <td>{sec.name}</td>
                  <td>{sec.virtual_size}</td>
                  <td>{sec.raw_size}</td>
                  <td>{sec.entropy?.toFixed(2) || "N/A"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}

      {result.imports && (
        <section className="card">
          <h2>Imported DLLs & Functions</h2>
          {result.imports.map((imp, i) => (
            <div key={i} className="dll-block">
              <strong>{imp.dll}</strong>
              <ul>
                {imp.functions.map((fn, j) => <li key={j}>{fn}</li>)}
              </ul>
            </div>
          ))}
        </section>
      )}

      <section className="card">
        <h2>VirusTotal Summary</h2>
        {stats ? (
          <ul className="summary-icons">
            <li><ShieldX className="red" /> Malicious: {stats.malicious}</li>
            <li><AlertTriangle className="yellow" /> Suspicious: {stats.suspicious}</li>
            <li><ShieldCheck className="green" /> Harmless: {stats.harmless}</li>
            <li><Loader2 className="gray" /> Undetected: {stats.undetected}</li>
          </ul>
        ) : (
          <p>Not available</p>
        )}
      </section>

      {results && (
        <section className="card">
          <h2>Detailed Engine Scan</h2>
          <table className="styled-table">
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
                  <td className={details.result ? "malicious" : "clean"}>
                    {details.result || "Clean"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}
    </div>
  );
};

export default AnalysisResult;