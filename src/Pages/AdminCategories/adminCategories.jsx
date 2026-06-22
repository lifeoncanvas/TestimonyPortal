import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import {
  ChevronLeft, Plus, Edit3, Trash2, Shield,
  Layers, CheckCircle, XCircle, X,
} from "lucide-react";
import api from "../../services/axiosConfig";
import "./styles.css";

export default function AdminCategories() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ name: "", description: "", iconUrl: "" });
  const [toast, setToast] = useState(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await api.get("/api/categories");
      setCategories(res.data || []);
    } catch (err) {
      console.error("Error fetching categories:", err);
    } finally {
      setLoading(false);
    }
  };

  const showToastMsg = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const resetForm = () => {
    setForm({ name: "", description: "", iconUrl: "" });
    setEditId(null);
    setShowForm(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) {
      showToastMsg("Category name is required", "error");
      return;
    }

    try {
      if (editId) {
        const res = await api.put(`/api/categories/${editId}`, form);
        setCategories((prev) => prev.map((c) => c.id === editId ? res.data : c));
        showToastMsg("Category updated!");
      } else {
        const res = await api.post("/api/categories", form);
        setCategories((prev) => [...prev, res.data]);
        showToastMsg("Category created!");
      }
      resetForm();
    } catch (err) {
      showToastMsg("Failed: " + (err.response?.data?.message || err.message), "error");
    }
  };

  const handleEdit = (cat) => {
    setForm({ name: cat.name, description: cat.description || "", iconUrl: cat.iconUrl || "" });
    setEditId(cat.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this category? This may affect associated testimonies.")) return;
    try {
      await api.delete(`/api/categories/${id}`);
      setCategories((prev) => prev.filter((c) => c.id !== id));
      showToastMsg("Category deleted!");
    } catch (err) {
      showToastMsg("Failed to delete: " + (err.response?.data?.message || err.message), "error");
    }
  };

  return (
    <div className="cat-page">

      {/* Top Bar */}
      <header className="cat-topbar">
        <button className="cat-back-btn" onClick={() => navigate("/admin")} aria-label="Back">
          <ChevronLeft size={20} />
        </button>
        <div className="cat-topbar-center">
          <Shield size={16} className="cat-shield" />
          <h1>Categories</h1>
        </div>
        <button className="cat-add-btn" onClick={() => { resetForm(); setShowForm(true); }}>
          <Plus size={16} /> Add
        </button>
      </header>

      {/* Category List */}
      <div className="cat-list">
        {loading ? (
          <div className="cat-empty">
            <div className="admin-spinner" />
            <p>Loading categories...</p>
          </div>
        ) : categories.length === 0 ? (
          <div className="cat-empty">
            <Layers size={32} />
            <p>No categories yet. Create one!</p>
          </div>
        ) : (
          categories.map((cat, i) => (
            <div
              key={cat.id}
              className="cat-card"
              style={{ animationDelay: `${i * 0.05}s` }}
            >
              <div className="cat-card-icon">
                {cat.iconUrl || "📂"}
              </div>
              <div className="cat-card-info">
                <h3>{cat.name}</h3>
                <p>{cat.description || "No description"}</p>
              </div>
              <div className="cat-card-actions">
                <button className="cat-action-btn edit" onClick={() => handleEdit(cat)} aria-label="Edit">
                  <Edit3 size={14} />
                </button>
                <button className="cat-action-btn delete" onClick={() => handleDelete(cat.id)} aria-label="Delete">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create/Edit Form Modal */}
      {showForm && (
        <div className="cat-modal-overlay" onClick={() => resetForm()}>
          <div className="cat-modal" onClick={(e) => e.stopPropagation()}>
            <div className="cat-modal-header">
              <h3>{editId ? "Edit Category" : "New Category"}</h3>
              <button className="cat-modal-close" onClick={() => resetForm()} aria-label="Close">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="cat-form-field">
                <label>Category Name *</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Healing Streams"
                />
              </div>
              <div className="cat-form-field">
                <label>Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Short description of this category"
                  rows={3}
                />
              </div>
              <div className="cat-form-field">
                <label>Icon (emoji or URL)</label>
                <input
                  type="text"
                  value={form.iconUrl}
                  onChange={(e) => setForm({ ...form, iconUrl: e.target.value })}
                  placeholder="e.g. 💧 or https://..."
                />
                {form.iconUrl && (
                  <div className="cat-icon-preview">
                    Preview: <span>{form.iconUrl}</span>
                  </div>
                )}
              </div>
              <div className="cat-form-actions">
                <button type="button" className="cat-form-cancel" onClick={() => resetForm()}>
                  Cancel
                </button>
                <button type="submit" className="cat-form-save">
                  <CheckCircle size={14} /> {editId ? "Update" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className={`cat-toast ${toast.type}`}>
          {toast.type === "success" ? <CheckCircle size={16} /> : <XCircle size={16} />}
          {toast.message}
        </div>
      )}
    </div>
  );
}
