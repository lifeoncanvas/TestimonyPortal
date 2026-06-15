import api from "../services/axiosConfig";

// ─── ADMIN PANEL ──────────────────────────────────────────────────────────────
// GET /api/admin/testimonies/pending
export const getPendingTestimonies = () =>
  api.get("/api/admin/testimonies/pending");

// PUT /api/admin/testimonies/{id}/approve
export const approveTestimony = (id) =>
  api.put(`/api/admin/testimonies/${id}/approve`);

// PUT /api/admin/testimonies/{id}/reject
export const rejectTestimony = (id) =>
  api.put(`/api/admin/testimonies/${id}/reject`);

// GET /api/admin/dashboard
export const getAdminDashboard = () =>
  api.get("/api/admin/dashboard");
