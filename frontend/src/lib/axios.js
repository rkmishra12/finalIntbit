import axios from "axios";

const apiBaseUrl = (import.meta.env.VITE_API_URL || "http://localhost:3000/api").replace(/\/$/, "");

const axiosInstance = axios.create({
  baseURL: apiBaseUrl,
  withCredentials: true, // by adding this field browser will send the cookies to server automatically, on every single req
});

export default axiosInstance;
