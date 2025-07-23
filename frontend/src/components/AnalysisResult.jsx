import React from "react";
import { ShieldCheck, ShieldX, AlertTriangle, Loader2, Download, Hash, Info, Code, FileText, Shield } from "lucide-react";
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
        <h2 className="section-title">🔍 Malware Analysis Report</h2>
        <div className="button-row">
          <button onClick={() => window.location.reload()} className="reupload-button">
            <FileText className="icon" /> New Analysis
          </button>
          <button onClick={handleDownloadReport} className="download-button">
            <Download className="icon" /> Download Report
          </button>
        </div>

        {result.hashes && (
          <div className="card">
            <h4><Hash className="icon" /> File Hashes</h4>
            <div style={{ display: 'grid', gap: '0.8rem' }}>
              <p><strong>MD5:</strong> <code style={{ background: 'rgba(0,230,118,0.1)', padding: '0.2rem 0.5rem', borderRadius: '4px', fontFamily: 'JetBrains Mono, monospace' }}>{result.hashes.md5}</code></p>
              <p><strong>SHA1:</strong> <code style={{ background: 'rgba(0,230,118,0.1)', padding: '0.2rem 0.5rem', borderRadius: '4px', fontFamily: 'JetBrains Mono, monospace' }}>{result.hashes.sha1}</code></p>
              <p><strong>SHA256:</strong> <code style={{ background: 'rgba(0,230,118,0.1)', padding: '0.2rem 0.5rem', borderRadius: '4px', fontFamily: 'JetBrains Mono, monospace' }}>{result.hashes.sha256}</code></p>
            </div>
          </div>
        )}

        {result.pe_info && (
          <div className="card">
            <h4><Info className="icon" /> PE Header Information</h4>
            <div style={{ display: 'grid', gap: '0.8rem' }}>
              <p><strong>Entry Point:</strong> <code style={{ background: 'rgba(59,130,246,0.1)', padding: '0.2rem 0.5rem', borderRadius: '4px', fontFamily: 'JetBrains Mono, monospace' }}>{result.pe_info.entry_point}</code></p>
              <p><strong>Image Base:</strong> <code style={{ background: 'rgba(59,130,246,0.1)', padding: '0.2rem 0.5rem', borderRadius: '4px', fontFamily: 'JetBrains Mono, monospace' }}>{result.pe_info.image_base}</code></p>
              <p><strong>Compile Time:</strong> <span style={{ color: '#fbbf24' }}>{new Date(result.pe_info.compile_time * 1000).toLocaleString()}</span></p>
            </div>
          </div>
        )}

        {result.sections && (
          <div className="card">
            <h4><FileText className="icon" /> Section Analysis</h4>
            <div className="results-table-wrapper">
              <table className="results-table">
                <thead>
                  <tr>
                    <th>Section Name</th>
                    <th>Virtual Size</th>
                    <th>Raw Size</th>
                    <th>Entropy</th>
                  </tr>
                </thead>
                <tbody>
                  {result.sections.map((sec, i) => (
                    <tr key={i}>
                      <td><code>{sec.name}</code></td>
                      <td>{sec.virtual_size?.toLocaleString()}</td>
                      <td>{sec.raw_size?.toLocaleString()}</td>
                      <td>
                        <span style={{ 
                          color: sec.entropy > 7 ? '#ef4444' : sec.entropy > 6 ? '#f59e0b' : '#10b981',
                          fontWeight: '600'
                        }}>
                          {sec.entropy ? sec.entropy.toFixed(2) : "N/A"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {result.imports && (
          <div className="card">
            <h4><Code className="icon" /> Imported Libraries & Functions</h4>
            <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
              {result.imports.map((imp, i) => (
                <div key={i} style={{ marginBottom: '1.5rem', padding: '1rem', background: 'rgba(20,20,35,0.6)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)' }}>
                  <strong style={{ color: '#00e676', fontSize: '1.1rem' }}>{imp.dll}</strong>
                  <ul style={{ marginTop: '0.5rem', paddingLeft: '1.2rem', color: '#cbd5e1' }}>
                    {imp.functions.map((fn, j) => (
                      <li key={j} style={{ marginBottom: '0.3rem', fontFamily: 'JetBrains Mono, monospace', fontSize: '0.9rem' }}>{fn}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        )}

        {result.language_guess && (
          <div className="card">
            <h4><Code className="icon" /> Programming Language Detection</h4>
            <p style={{ fontSize: '1.2rem', color: '#22d3ee', fontWeight: '600' }}>{result.language_guess}</p>
          </div>
        )}
        {result.strings && (
          <div className="card">
            <h4><FileText className="icon" /> Extracted Strings</h4>
            <div className="string-box">
              <pre>{result.strings.join("\n")}</pre>
            </div>
          </div>
        )}

        <h2 className="section-title">🛡️ VirusTotal Analysis</h2>

        {!vtData && (
          <div className="card">
            <p style={{ textAlign: 'center', color: '#94a3b8', fontStyle: 'italic' }}>VirusTotal scan not available.</p>
          </div>
        )}

        {stats && (
          <div className="card">
            <h4><Shield className="icon" /> Security Scan Summary</h4>
            <ul className="stats-list">
              <li>
                <ShieldX className="icon red" /> 
                <strong>Malicious:</strong> 
                <span style={{ marginLeft: '0.5rem', fontSize: '1.2rem', fontWeight: '700' }}>{stats.malicious}</span>
              </li>
              <li>
                <AlertTriangle className="icon yellow" /> 
                <strong>Suspicious:</strong> 
                <span style={{ marginLeft: '0.5rem', fontSize: '1.2rem', fontWeight: '700' }}>{stats.suspicious}</span>
              </li>
              <li>
                <ShieldCheck className="icon green" /> 
                <strong>Harmless:</strong> 
                <span style={{ marginLeft: '0.5rem', fontSize: '1.2rem', fontWeight: '700' }}>{stats.harmless}</span>
              </li>
              <li>
                <Loader2 className="icon gray" /> 
                <strong>Undetected:</strong> 
                <span style={{ marginLeft: '0.5rem', fontSize: '1.2rem', fontWeight: '700' }}>{stats.undetected}</span>
              </li>
            </ul>
          </div>
        )}

        {results && (
          <div className="card">
            <h4><Shield className="icon" /> Detailed Engine Results</h4>
            <div className="results-table-wrapper">
              <table className="results-table">
                <thead>
                  <tr>
                    <th>Security Engine</th>
                    <th>Category</th>
                    <th>Detection Result</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(results).map(([engine, details]) => (
                    <tr key={engine}>
                      <td style={{ fontWeight: '600' }}>{engine}</td>
                      <td>
                        <span style={{
                          padding: '0.3rem 0.6rem',
                          borderRadius: '6px',
                          fontSize: '0.8rem',
                          fontWeight: '600',
                          background: details.category === 'malicious' ? 'rgba(239,68,68,0.2)' : 
                                     details.category === 'suspicious' ? 'rgba(245,158,11,0.2)' : 
                                     'rgba(16,185,129,0.2)',
                          color: details.category === 'malicious' ? '#ef4444' : 
                                details.category === 'suspicious' ? '#f59e0b' : 
                                '#10b981'
                        }}>
                          {details.category}
                        </span>
                      </td>
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