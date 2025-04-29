import React, { useState } from "react";
import FileUpload from "./components/FileUpload";
import "./App.css";

const App = () => {
  const [analysisResult, setAnalysisResult] = useState(null);
  const [loading, setLoading] = useState(false);

  return (
    <div className="App">
      <h1>Static Malware Analyzer</h1>
      <FileUpload setAnalysisResult={setAnalysisResult} setLoading={setLoading} />
      
      {loading && <p>Analyzing file, please wait...</p>}
      
      {analysisResult && (
        <div className="result">
          <h3>Analysis Result:</h3>
          <pre>{JSON.stringify(analysisResult, null, 2)}</pre>
        </div>
      )}
    </div>
  );
};

export default App;