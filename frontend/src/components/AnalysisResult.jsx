import React from "react";
import { ShieldCheck, ShieldX, AlertTriangle, Loader2 } from "lucide-react";
import "./Analysis.css";

const AnalysisResult = ({ result }) => {
  if (!result) return null;

  const vtData = result.virustotal;
  const stats = vtData?.data?.attributes?.last_analysis_stats;
  const vendors = vtData?.data?.attributes?.last_analysis_results;

  return (
    <div className="result-wrapper">
      <div className="card">
        <h2 className="section-title">Section Info</h2>
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Virtual Size</th>
              <th>Raw Size</th>
              <th>Entropy</th>
            </tr>
          </thead>
          <tbody>
            {result.sections.map((sec, idx) => (
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

      <div className="card">
        <h2 className="section-title">Imported DLLs & Functions</h2>
        {result.imports.map((item, idx) => (
          <div key={idx}>
            <strong>{item.dll}</strong>
            <ul>
              {item.functions.map((fn, i) => <li key={i}>{fn}</li>)}
            </ul>
          </div>
        ))}
      </div>

      <div className="card">
        <h2 className="section-title">VirusTotal Analysis</h2>
        <div className="summary">
          <p><ShieldX color="red" /> Malicious: {stats?.malicious}</p>
          <p><AlertTriangle color="orange" /> Suspicious: {stats?.suspicious}</p>
          <p><ShieldCheck color="green" /> Harmless: {stats?.harmless}</p>
          <p><Loader2 color="gray" /> Undetected: {stats?.undetected}</p>
        </div>
      </div>

      <div className="card">
        <h2 className="section-title">Vendor Results</h2>
        <table>
          <thead>
            <tr>
              <th>Vendor</th>
              <th>Category</th>
              <th>Result</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(vendors).map(([vendor, data], idx) => (
              <tr key={idx}>
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