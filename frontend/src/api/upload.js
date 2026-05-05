import axios from "axios";

// Fallback to localhost if environment variable is not set
const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

export const uploadFile = async (file) => {
  try {
    // Step 1: Get S3 Pre-signed URL
    const getUrlResponse = await axios.post(`${API_URL}/api/get-upload-url`, {
      filename: file.name
    });
    
    const { upload_url, file_key } = getUrlResponse.data;

    // Step 2: Upload directly to S3
    await axios.put(upload_url, file, {
      headers: {
        "Content-Type": "application/octet-stream"
      }
    });

    // Step 3: Tell backend to analyze the uploaded file
    const analyzeResponse = await axios.post(`${API_URL}/api/analyze-s3`, {
      file_key: file_key,
      filename: file.name
    });

    return analyzeResponse.data;
  } catch (error) {
    console.error("API upload error:", error);
    throw error;
  }
};