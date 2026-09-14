import axios from "axios";

const apiBaseUrl = (process.env.REACT_APP_API_URL || "https://148.66.154.48:8083").replace(/\/$/, "");

const api = axios.create({
  baseURL: apiBaseUrl,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization =
      `Bearer ${token}`;
  }

  return config;
});

export default api;