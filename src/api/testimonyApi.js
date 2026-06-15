import api from "../services/axiosConfig";

// ─── HOMEPAGE ─────────────────────────────────────────────────────────────────
// GET /api/testimonies/trending
export const getTrending = () =>
  api.get("/api/testimonies/trending");

// GET /api/testimonies/featured
export const getFeatured = () =>
  api.get("/api/testimonies/featured");

// GET /api/testimonies/today
export const getTestimonyOfDay = () =>
  api.get("/api/testimonies/today");

// GET /api/testimonies?page=0&size=10
export const getRecent = (page = 0, size = 10) =>
  api.get(`/api/testimonies?page=${page}&size=${size}`);

// ─── BROWSE PAGE ──────────────────────────────────────────────────────────────
// GET /api/testimonies
export const getAllTestimonies = () =>
  api.get("/api/testimonies");

// GET /api/testimonies/search?keyword=
export const searchTestimonies = (keyword) =>
  api.get(`/api/testimonies/search?keyword=${keyword}`);

// GET /api/testimonies?categoryId=1
export const filterByCategory = (categoryId) =>
  api.get(`/api/testimonies?categoryId=${categoryId}`);

// GET /api/testimonies?country=India
export const filterByCountry = (country) =>
  api.get(`/api/testimonies?country=${country}`);

// GET /api/testimonies?page=0&size=20
export const getPaginatedTestimonies = (page = 0, size = 20) =>
  api.get(`/api/testimonies?page=${page}&size=${size}`);

// ─── SINGLE TESTIMONY PAGE ────────────────────────────────────────────────────
// GET /api/testimonies/{id}
export const getTestimony = (id) =>
  api.get(`/api/testimonies/${id}`);

// GET /api/testimonies/{id}/comments
export const getComments = (id) =>
  api.get(`/api/testimonies/${id}/comments`);

// POST /api/testimonies/{id}/comments
export const addComment = (id, data) =>
  api.post(`/api/testimonies/${id}/comments`, data);

// POST /api/testimonies/{id}/like
export const likeTestimony = (id) =>
  api.post(`/api/testimonies/${id}/like`);

// DELETE /api/testimonies/{id}/like
export const unlikeTestimony = (id) =>
  api.delete(`/api/testimonies/${id}/like`);

// POST /api/testimonies/{id}/same-miracle
export const sameMiracle = (id) =>
  api.post(`/api/testimonies/${id}/same-miracle`);

// POST /api/testimonies/{id}/pray
export const prayForTestimony = (id) =>
  api.post(`/api/testimonies/${id}/pray`);

// POST /api/testimonies/{id}/save
export const saveTestimony = (id) =>
  api.post(`/api/testimonies/${id}/save`);

// DELETE /api/testimonies/{id}/save
export const unsaveTestimony = (id) =>
  api.delete(`/api/testimonies/${id}/save`);

// Related testimonies — reuses category filter
// GET /api/testimonies?categoryId=x
export const getRelatedTestimonies = (categoryId) =>
  api.get(`/api/testimonies?categoryId=${categoryId}`);

// ─── UPLOAD TESTIMONY ─────────────────────────────────────────────────────────
// POST /api/testimonies
// Body: { title, description, categoryId, country, church, zone }
// Response: { id }
export const createTestimony = (data) =>
  api.post("/api/testimonies", data);

// POST /api/testimonies/{id}/media
// FormData: file=video.mp4
export const uploadMedia = (id, formData) =>
  api.post(`/api/testimonies/${id}/media`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

// ─── MY TESTIMONIES DASHBOARD ─────────────────────────────────────────────────
// GET /api/users/me/testimonies
export const getMyTestimonies = () =>
  api.get("/api/users/me/testimonies");

// GET /api/users/me/testimonies?status=PENDING
// GET /api/users/me/testimonies?status=APPROVED
export const getMyTestimoniesByStatus = (status) =>
  api.get(`/api/users/me/testimonies?status=${status}`);

// DELETE /api/testimonies/{id}
export const deleteTestimony = (id) =>
  api.delete(`/api/testimonies/${id}`);

// PUT /api/testimonies/{id}
export const updateTestimony = (id, data) =>
  api.put(`/api/testimonies/${id}`, data);

// ─── SAVED TESTIMONIES ────────────────────────────────────────────────────────
// GET /api/users/me/saved
export const getSavedTestimonies = () =>
  api.get("/api/users/me/saved");
