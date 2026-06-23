import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import {
  ChevronLeft, CheckCircle, XCircle, Clock, Eye,
  ChevronDown, ChevronUp, Star, TrendingUp, Shield, Trash2,
} from "lucide-react";
import api from "../../services/axiosConfig";
import "./styles.css";

const STATUS_TABS = [
  { id: "PENDING", label: "Pending", icon: <Clock size={14} /> },
  { id: "", label: "All", icon: <Eye size={14} /> },
  { id: "APPROVED", label: "Approved", icon: <CheckCircle size={14} /> },
  { id: "REJECTED", label: "Rejected", icon: <XCircle size={14} /> },
];

export default function AdminModeration() {
  const navigate = useNavigate();
  const [testimonies, setTestimonies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("PENDING");
  const [expandedId, setExpandedId] = useState(null);
  const [rejectModal, setRejectModal] = useState(null);
  const [rejectReason, setRejectReason] = useState("");
  const [toast, setToast] = useState(null);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    fetchTestimonies();
  }, [statusFilter, page]);

  const fetchTestimonies = async () => {
    try {
      setLoading(true);
      const params = { page, size: 10 };
      if (statusFilter) params.status = statusFilter;
      const res = await api.get("/api/admin/testimonies", { params });
      setTestimonies(res.data.content || []);
      setTotalPages(res.data.totalPages || 0);
    } catch (err) {
      console.error("Error fetching testimonies:", err);
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleApprove = async (id) => {
    try {
      await api.post(`/api/admin/testimonies/${id}/approve`);
      setTestimonies((prev) => prev.map((t) =>
        t.id === id ? { ...t, status: "APPROVED" } : t
      ));
      showToast("Testimony approved successfully!");
    } catch (err) {
      showToast("Failed to approve: " + (err.response?.data?.message || err.message), "error");
    }
  };

  const handleReject = async () => {
    if (!rejectModal) return;
    try {
      await api.post(`/api/admin/testimonies/${rejectModal}/reject`, {
        reason: rejectReason || "Does not meet guidelines",
      });
      setTestimonies((prev) => prev.map((t) =>
        t.id === rejectModal ? { ...t, status: "REJECTED" } : t
      ));
      showToast("Testimony rejected.");
      setRejectModal(null);
      setRejectReason("");
    } catch (err) {
      showToast("Failed to reject: " + (err.response?.data?.message || err.message), "error");
    }
  };

  const handleToggleFeatured = async (id) => {
    try {
      await api.post(`/api/admin/testimonies/${id}/feature`);
      setTestimonies((prev) => prev.map((t) =>
        t.id === id ? { ...t, isFeatured: !t.isFeatured } : t
      ));
      showToast("Featured status toggled!");
    } catch (err) {
      showToast("Failed: " + (err.response?.data?.message || err.message), "error");
    }
  };

  const handleToggleTrending = async (id) => {
    try {
      await api.post(`/api/admin/testimonies/${id}/trending`);
      setTestimonies((prev) => prev.map((t) =>
        t.id === id ? { ...t, isTrending: !t.isTrending } : t
      ));
      showToast("Trending status toggled!");
    } catch (err) {
      showToast("Failed: " + (err.response?.data?.message || err.message), "error");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this testimony permanently? This action cannot be undone.")) return;
    try {
      await api.delete(`/api/testimonies/${id}`);
      setTestimonies((prev) => prev.filter((t) => t.id !== id));
      showToast("Testimony deleted successfully!");
    } catch (err) {
      showToast("Failed to delete: " + (err.response?.data?.message || err.message), "error");
    }
  };

  return (
    <div className="mod-page">

      {/* Top Bar */}
      <header className="mod-topbar">
        <button className="mod-back-btn" onClick={() => navigate("/admin")} aria-label="Back">
          <ChevronLeft size={20} />
        </button>
        <div className="mod-topbar-center">
          <Shield size={16} className="mod-shield" />
          <h1>Moderation</h1>
        </div>
      </header>

      {/* Filter Tabs */}
      <div className="mod-tabs">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.id}
            className={`mod-tab${statusFilter === tab.id ? " active" : ""}`}
            onClick={() => { setStatusFilter(tab.id); setPage(0); }}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* Testimony List */}
      <div className="mod-list">
        {loading ? (
          <div className="mod-empty">
            <div className="admin-spinner" />
            <p>Loading...</p>
          </div>
        ) : testimonies.length === 0 ? (
          <div className="mod-empty">
            <CheckCircle size={32} />
            <p>No testimonies to show.</p>
          </div>
        ) : (
          testimonies.map((t) => {
            const isExpanded = expandedId === t.id;
            const statusLower = (t.status || "").toLowerCase();
            return (
              <div key={t.id} className={`mod-card ${statusLower}`}>
                <div className="mod-card-accent" />
                <div className="mod-card-body">

                  {/* Header */}
                  <div className="mod-card-header">
                    <div className="mod-card-header-left">
                      <span className="mod-card-cat">{t.category?.name || "General"}</span>
                      <span className={`mod-card-status ${statusLower}`}>
                        {statusLower === "approved" && <><CheckCircle size={10} /> Approved</>}
                        {statusLower === "pending" && <><Clock size={10} /> Pending</>}
                        {statusLower === "rejected" && <><XCircle size={10} /> Rejected</>}
                      </span>
                    </div>
                    <span className="mod-card-date">
                      {t.createdAt ? new Date(t.createdAt).toLocaleDateString() : ""}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="mod-card-title">{t.title}</h3>
                  <p className="mod-card-author">
                    By {t.user?.name || "Anonymous"} · {t.country || ""}
                  </p>

                  {/* Expandable description */}
                  <div className={`mod-card-desc ${isExpanded ? "expanded" : ""}`}>
                    <p>{t.description || ""}</p>
                  </div>
                  <button
                    className="mod-expand-btn"
                    onClick={() => setExpandedId(isExpanded ? null : t.id)}
                  >
                    {isExpanded ? <><ChevronUp size={13} /> Show less</> : <><ChevronDown size={13} /> Read full testimony</>}
                  </button>

                  {/* Badges */}
                  <div className="mod-card-badges">
                    {t.isFeatured && <span className="mod-badge featured"><Star size={10} /> Featured</span>}
                    {t.isTrending && <span className="mod-badge trending"><TrendingUp size={10} /> Trending</span>}
                    <span className="mod-badge views"><Eye size={10} /> {t.viewCount || 0}</span>
                  </div>

                  {/* Actions */}
                  <div className="mod-card-actions">
                    {statusLower !== "approved" && (
                      <button className="mod-btn approve" onClick={() => handleApprove(t.id)}>
                        <CheckCircle size={13} /> Approve
                      </button>
                    )}
                    {statusLower !== "rejected" && (
                      <button className="mod-btn reject" onClick={() => { setRejectModal(t.id); setRejectReason(""); }}>
                        <XCircle size={13} /> Reject
                      </button>
                    )}
                    <button
                      className={`mod-btn toggle ${t.isFeatured ? "active" : ""}`}
                      onClick={() => handleToggleFeatured(t.id)}
                    >
                      <Star size={13} /> {t.isFeatured ? "Unfeature" : "Feature"}
                    </button>
                    <button
                      className={`mod-btn toggle ${t.isTrending ? "active" : ""}`}
                      onClick={() => handleToggleTrending(t.id)}
                    >
                      <TrendingUp size={13} /> {t.isTrending ? "Untrend" : "Trend"}
                    </button>
                    <button className="mod-btn delete" onClick={() => handleDelete(t.id)}>
                      <Trash2 size={13} /> Delete
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mod-pagination">
          <button disabled={page === 0} onClick={() => setPage((p) => p - 1)}>← Prev</button>
          <span>Page {page + 1} of {totalPages}</span>
          <button disabled={page >= totalPages - 1} onClick={() => setPage((p) => p + 1)}>Next →</button>
        </div>
      )}

      {/* Reject Modal */}
      {rejectModal !== null && (
        <div className="mod-modal-overlay" onClick={() => setRejectModal(null)}>
          <div className="mod-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Reject Testimony</h3>
            <p>Provide a reason for rejection:</p>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="e.g. Does not meet content guidelines..."
              rows={3}
            />
            <div className="mod-modal-actions">
              <button className="mod-modal-cancel" onClick={() => setRejectModal(null)}>Cancel</button>
              <button className="mod-modal-reject" onClick={handleReject}>
                <XCircle size={14} /> Reject
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className={`mod-toast ${toast.type}`}>
          {toast.type === "success" ? <CheckCircle size={16} /> : <XCircle size={16} />}
          {toast.message}
        </div>
      )}
    </div>
  );
}
