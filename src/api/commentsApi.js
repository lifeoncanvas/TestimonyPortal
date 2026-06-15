import api from "../services/axiosConfig";

// ─── COMMENTS ─────────────────────────────────────────────────────────────────
// POST /api/comments/{id}/reply
export const replyToComment = (id, data) =>
  api.post(`/api/comments/${id}/reply`, data);

// DELETE /api/comments/{id}
export const deleteComment = (id) =>
  api.delete(`/api/comments/${id}`);
