import React, { useState } from "react";
import Home from "./pages/Home";
import "./App.css";

const App = () => {
  const [analysisResult, setAnalysisResult] = useState(null);
  const [loading, setLoading] = useState(false);

  return (
    <Home 
      analysisResult={analysisResult} 
      setAnalysisResult={setAnalysisResult} 
      loading={loading} 
      setLoading={setLoading} 
    />
  );
};

export default App;
