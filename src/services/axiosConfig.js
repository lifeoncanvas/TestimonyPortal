import axios from "axios";

const getApiBaseUrl = () => {
  if (process.env.REACT_APP_API_URL) {
    return process.env.REACT_APP_API_URL;
  }
  if (typeof window !== "undefined" && window.location && window.location.origin) {
    return window.location.origin;
  }
  return "https://testimonyportal.com";
};

const apiBaseUrl = getApiBaseUrl().replace(/\/$/, "");

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