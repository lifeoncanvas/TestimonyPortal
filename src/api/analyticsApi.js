import api from "../services/axiosConfig";

// ─── ANALYTICS ────────────────────────────────────────────────────────────────
// GET /api/users/me/analytics
// Response: { totalViews, totalLikes, totalShares, totalTestimonies }
export const getUserAnalytics = () =>
  api.get("/api/users/me/analytics");
