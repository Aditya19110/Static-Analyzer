import axios from "axios";

export const uploadFile = async (file) => {
  const formData = new FormData();
  formData.append("file", file);

  try {
    const response = await axios.post("http://localhost:5000/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data"
      }
    });
    return response.data;
  } catch (error) {
    console.error("API upload error:", error);
    throw error;
  }
};