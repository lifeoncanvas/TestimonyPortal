import api from "../services/axiosConfig";

// ─── NOTIFICATIONS ────────────────────────────────────────────────────────────
// GET /api/notifications
export const getNotifications = () =>
  api.get("/api/notifications");

// PUT /api/notifications/{id}/read
export const markRead = (id) =>
  api.put(`/api/notifications/${id}/read`);
