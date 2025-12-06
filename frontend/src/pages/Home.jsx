import React, { useState, useEffect } from "react";
import FileUpload from "../components/FileUpload";
import AnalysisResult from "../components/AnalysisResult";
import GlassCard from "../components/GlassCard";

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
    <div className={`transition-all duration-700 ease-out ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-extrabold text-slate-800 dark:text-white mb-4 tracking-tight">
          Secure <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400">Static Analysis</span>
        </h1>
        <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
          Analyze .exe files securely without execution using advanced static analysis and VirusTotal integration.
        </p>
      </div>

      <div className="max-w-4xl mx-auto">
        {!analysisResult && !loading && (
          <GlassCard className="transition-all hover:shadow-2xl">
            <FileUpload
              setAnalysisResult={setAnalysisResult}
              setLoading={setLoading}
            />
          </GlassCard>
        )}

        {loading && (
          <GlassCard>
            <div className="flex flex-col items-center justify-center p-12">
              <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4"></div>
              <h3 className="text-xl font-semibold text-slate-700 dark:text-slate-200">Analyzing file...</h3>
              <p className="text-slate-500 dark:text-slate-400 mt-2 animate-pulse">Running static analysis and virus scans</p>
            </div>
          </GlassCard>
        )}

        {analysisResult && !loading && (
          <AnalysisResult result={analysisResult} onReset={resetAnalysis} />
        )}
      </div>
    </div>
  );
};

export default Home;
