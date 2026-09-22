import axios from "axios";

const apiBaseUrl = (
  process.env.REACT_APP_API_URL ||
  (typeof window !== "undefined" && (window.location.hostname === "testimonyportal.com" || window.location.hostname === "www.testimonyportal.com" || window.location.port === "8083") ? "" : "https://testimonyportal.com")
).replace(/\/$/, "");

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