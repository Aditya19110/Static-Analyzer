import React, { useState } from "react";
import Home from "./pages/Home";


import Layout from "./components/Layout";

const App = () => {
  const [analysisResult, setAnalysisResult] = useState(null);
  const [loading, setLoading] = useState(false);

  return (
    <Layout>
      <Home
        analysisResult={analysisResult}
        setAnalysisResult={setAnalysisResult}
        loading={loading}
        setLoading={setLoading}
      />
    </Layout>
  );
};

export default App;
