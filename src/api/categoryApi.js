import api from "../services/axiosConfig";

// ─── CATEGORIES ───────────────────────────────────────────────────────────────
// GET /api/categories
export const getCategories = () =>
  api.get("/api/categories");

// POST /api/categories  (admin)
export const createCategory = (data) =>
  api.post("/api/categories", data);

// PUT /api/categories/{id}  (admin)
export const updateCategory = (id, data) =>
  api.put(`/api/categories/${id}`, data);

// DELETE /api/categories/{id}  (admin)
export const deleteCategory = (id) =>
  api.delete(`/api/categories/${id}`);
