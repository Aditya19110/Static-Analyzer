import React from "react";
import { ShieldCheck, ShieldX, AlertTriangle, Loader2, Download, Hash, Info, Code, FileText, Shield, RefreshCw } from "lucide-react";
import GlassCard from "./GlassCard";

const AnalysisResult = ({ result, onReset }) => {
  if (!result) return null;

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
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
          <ShieldCheck className="w-8 h-8 text-indigo-500" />
          Analysis Report
        </h2>
        <div className="flex gap-3">
          <button
            onClick={onReset}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
          >
            <RefreshCw className="w-4 h-4" /> New Scan
          </button>
          <button
            onClick={handleDownloadReport}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-colors shadow-lg"
          >
            <Download className="w-4 h-4" /> Download JSON
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Hashes Section */}
        {result.hashes && (
          <GlassCard>
            <h4 className="flex items-center gap-2 text-lg font-semibold mb-4 text-slate-800 dark:text-slate-100">
              <Hash className="w-5 h-5 text-indigo-500" /> File Hashes
            </h4>
            <div className="space-y-3 text-sm">
              <div className="space-y-1">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">MD5</span>
                <p className="font-mono bg-slate-100 dark:bg-slate-800/50 p-2 rounded text-slate-700 dark:text-slate-300 break-all border border-slate-200 dark:border-slate-700">
                  {result.hashes.md5}
                </p>
              </div>
              <div className="space-y-1">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">SHA1</span>
                <p className="font-mono bg-slate-100 dark:bg-slate-800/50 p-2 rounded text-slate-700 dark:text-slate-300 break-all border border-slate-200 dark:border-slate-700">
                  {result.hashes.sha1}
                </p>
              </div>
              <div className="space-y-1">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">SHA256</span>
                <p className="font-mono bg-slate-100 dark:bg-slate-800/50 p-2 rounded text-slate-700 dark:text-slate-300 break-all border border-slate-200 dark:border-slate-700">
                  {result.hashes.sha256}
                </p>
              </div>
            </div>
          </GlassCard>
        )}

        {/* PE Info Section */}
        {result.pe_info && (
          <GlassCard>
            <h4 className="flex items-center gap-2 text-lg font-semibold mb-4 text-slate-800 dark:text-slate-100">
              <Info className="w-5 h-5 text-blue-500" /> PE Header Info
            </h4>
            <div className="space-y-4">
              <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-700 pb-2">
                <span className="text-slate-500 dark:text-slate-400">Entry Point</span>
                <code className="font-mono text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20 px-2 py-1 rounded">
                  {result.pe_info.entry_point}
                </code>
              </div>
              <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-700 pb-2">
                <span className="text-slate-500 dark:text-slate-400">Image Base</span>
                <code className="font-mono text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20 px-2 py-1 rounded">
                  {result.pe_info.image_base}
                </code>
              </div>
              <div className="flex justify-between items-center pt-1">
                <span className="text-slate-500 dark:text-slate-400">Compile Time</span>
                <span className="text-amber-600 dark:text-amber-400 font-medium">
                  {new Date(result.pe_info.compile_time * 1000).toLocaleString()}
                </span>
              </div>
              {result.language_guess && (
                <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                  <span className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Detected Language</span>
                  <div className="bg-gradient-to-r from-blue-500/10 to-indigo-500/10 border border-blue-200 dark:border-blue-800 rounded-lg p-3 text-center">
                    <span className="text-blue-700 dark:text-blue-300 font-semibold">
                      {result.language_guess}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </GlassCard>
        )}
      </div>

      {/* Security Summary */}
      {stats && (
        <GlassCard className="border-l-4 border-l-indigo-500">
          <h4 className="flex items-center gap-2 text-lg font-semibold mb-6 text-slate-800 dark:text-slate-100">
            <Shield className="w-5 h-5 text-indigo-500" /> Security Scan Summary
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-xl border border-red-100 dark:border-red-900/30 text-center">
              <ShieldX className="w-8 h-8 text-red-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-red-700 dark:text-red-400">{stats.malicious}</div>
              <div className="text-xs text-red-600 dark:text-red-300 font-medium uppercase">Malicious</div>
            </div>
            <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-xl border border-orange-100 dark:border-orange-900/30 text-center">
              <AlertTriangle className="w-8 h-8 text-orange-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-orange-700 dark:text-orange-400">{stats.suspicious}</div>
              <div className="text-xs text-orange-600 dark:text-orange-300 font-medium uppercase">Suspicious</div>
            </div>
            <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-xl border border-green-100 dark:border-green-900/30 text-center">
              <ShieldCheck className="w-8 h-8 text-green-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-green-700 dark:text-green-400">{stats.harmless}</div>
              <div className="text-xs text-green-600 dark:text-green-300 font-medium uppercase">Harmless</div>
            </div>
            <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-700 text-center">
              <Loader2 className="w-8 h-8 text-slate-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-slate-700 dark:text-slate-400">{stats.undetected}</div>
              <div className="text-xs text-slate-500 dark:text-slate-400 font-medium uppercase">Undetected</div>
            </div>
          </div>
        </GlassCard>
      )}

      {/* Detailed Engine Results */}
      {results && (
        <GlassCard>
          <h4 className="flex items-center gap-2 text-lg font-semibold mb-4 text-slate-800 dark:text-slate-100">
            <Shield className="w-5 h-5 text-indigo-500" /> Detailed Engine Results
          </h4>
          <div className="overflow-x-auto max-h-96 custom-scrollbar">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-100 dark:bg-slate-800 text-xs uppercase text-slate-500 dark:text-slate-400 font-bold sticky top-0 z-10">
                <tr>
                  <th className="px-4 py-3">Security Engine</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Result</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                {Object.entries(results).map(([engine, details]) => (
                  <tr key={engine} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-4 py-3 font-semibold text-slate-700 dark:text-slate-300">{engine}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${details.category === 'malicious' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                        details.category === 'suspicious' ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' :
                          'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                        }`}>
                        {details.category}
                      </span>
                    </td>
                    <td className={`px-4 py-3 font-medium ${details.result === null ? "text-slate-400 italic" :
                      details.result === "malicious" ? "text-red-600 dark:text-red-400" :
                        "text-slate-600 dark:text-slate-300"
                      }`}>
                      {details.result || "Clean"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </GlassCard>
      )}

      {/* Sections Analysis */}
      {result.sections && (
        <GlassCard>
          <h4 className="flex items-center gap-2 text-lg font-semibold mb-4 text-slate-800 dark:text-slate-100">
            <FileText className="w-5 h-5 text-purple-500" /> Section Analysis
          </h4>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-100 dark:bg-slate-800 text-xs uppercase text-slate-500 dark:text-slate-400 font-bold">
                <tr>
                  <th className="px-4 py-3 rounded-tl-lg">Section Name</th>
                  <th className="px-4 py-3">Virtual Size</th>
                  <th className="px-4 py-3">Raw Size</th>
                  <th className="px-4 py-3 rounded-tr-lg">Entropy</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                {result.sections.map((sec, i) => (
                  <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-4 py-3 font-mono text-indigo-600 dark:text-indigo-400">{sec.name}</td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{sec.virtual_size?.toLocaleString()}</td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{sec.raw_size?.toLocaleString()}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded text-xs font-bold ${sec.entropy > 7 ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                        sec.entropy > 6 ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' :
                          'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                        }`}>
                        {sec.entropy ? sec.entropy.toFixed(2) : "N/A"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </GlassCard>
      )}

      {/* Imports */}
      {result.imports && result.imports.length > 0 && (
        <GlassCard>
          <h4 className="flex items-center gap-2 text-lg font-semibold mb-4 text-slate-800 dark:text-slate-100">
            <Code className="w-5 h-5 text-green-500" /> Imported Libraries
          </h4>
          <div className="max-h-96 overflow-y-auto pr-2 space-y-4 custom-scrollbar">
            {result.imports.map((imp, i) => (
              <div key={i} className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-lg border border-slate-100 dark:border-slate-800">
                <div className="font-bold text-green-600 dark:text-green-400 mb-2 font-mono text-sm">{imp.dll}</div>
                <ul className="pl-4 border-l-2 border-slate-300 dark:border-slate-700 space-y-1">
                  {imp.functions.map((fn, j) => (
                    <li key={j} className="text-xs font-mono text-slate-600 dark:text-slate-400 truncate hover:text-slate-900 dark:hover:text-slate-200">
                      {fn}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </GlassCard>
      )}

      {/* Strings (Limited view) */}
      {result.strings && result.strings.length > 0 && (
        <GlassCard>
          <h4 className="flex items-center gap-2 text-lg font-semibold mb-4 text-slate-800 dark:text-slate-100">
            <FileText className="w-5 h-5 text-slate-500" /> Extracted Strings Sample
          </h4>
          <div className="bg-slate-900 text-slate-300 p-4 rounded-lg font-mono text-xs h-64 overflow-y-auto">
            <pre>
              {result.strings.slice(0, 100).join("\n")}
              {result.strings.length > 100 && `\n\n...and ${result.strings.length - 100} more strings`}
            </pre>
          </div>
        </GlassCard>
      )}
    </div>
  );
};

export default AnalysisResult;