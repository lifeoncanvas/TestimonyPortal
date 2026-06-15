import api from "../services/axiosConfig";

// ─── AUTH ─────────────────────────────────────────────────────────────────────
// POST /api/auth/login
export const login = (credentials) =>
  api.post("/api/auth/login", credentials);

// POST /api/auth/register
export const register = (data) =>
  api.post("/api/auth/register", data);

// Logout — clear JWT from storage (no server call required)
export const logout = () =>
  localStorage.removeItem("token");

// ─── USER PROFILE ─────────────────────────────────────────────────────────────
// GET /api/users/me
export const getMe = () =>
  api.get("/api/users/me");

// PUT /api/users/me
export const updateProfile = (data) =>
  api.put("/api/users/me", data);
