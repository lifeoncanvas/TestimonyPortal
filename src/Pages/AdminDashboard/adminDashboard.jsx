import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import {
  ChevronLeft, Users, FileText, CheckCircle, Clock,
  XCircle, Heart, MessageCircle, Layers, TrendingUp,
  Star, Shield, ArrowRight, BarChart3,
} from "lucide-react";
import api from "../../services/axiosConfig";
import "./styles.css";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [dashboard, setDashboard] = useState(null);
  const [pending, setPending] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const [dashRes, pendRes] = await Promise.all([
        api.get("/api/admin/dashboard"),
        api.get("/api/admin/testimonies/pending?size=5"),
      ]);
      setDashboard(dashRes.data);
      setPending(pendRes.data.content || []);
    } catch (err) {
      console.error("Error fetching admin dashboard:", err);
      if (err.response?.status === 403) {
        alert("You don't have admin access.");
        navigate("/");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleQuickApprove = async (id) => {
    try {
      await api.post(`/api/admin/testimonies/${id}/approve`);
      setPending((prev) => prev.filter((t) => t.id !== id));
      setDashboard((prev) => prev ? {
        ...prev,
        pendingTestimonies: prev.pendingTestimonies - 1,
        approvedTestimonies: prev.approvedTestimonies + 1,
      } : prev);
    } catch (err) {
      alert("Failed to approve: " + (err.response?.data?.message || err.message));
    }
  };

  if (loading) {
    return (
      <div className="admin-page">
        <div className="admin-loading">
          <div className="admin-spinner" />
          <p>Loading Admin Dashboard...</p>
        </div>
      </div>
    );
  }

  const stats = [
    { icon: <Users size={20} />, value: dashboard?.totalUsers || 0, label: "Total Users", gradient: "linear-gradient(135deg, #667eea, #764ba2)" },
    { icon: <FileText size={20} />, value: dashboard?.totalTestimonies || 0, label: "Testimonies", gradient: "linear-gradient(135deg, #f093fb, #f5576c)" },
    { icon: <Clock size={20} />, value: dashboard?.pendingTestimonies || 0, label: "Pending", gradient: "linear-gradient(135deg, #fccb90, #d57eeb)" },
    { icon: <CheckCircle size={20} />, value: dashboard?.approvedTestimonies || 0, label: "Approved", gradient: "linear-gradient(135deg, #4facfe, #00f2fe)" },
    { icon: <XCircle size={20} />, value: dashboard?.rejectedTestimonies || 0, label: "Rejected", gradient: "linear-gradient(135deg, #fa709a, #fee140)" },
    { icon: <Layers size={20} />, value: dashboard?.totalCategories || 0, label: "Categories", gradient: "linear-gradient(135deg, #a18cd1, #fbc2eb)" },
    { icon: <Heart size={20} />, value: dashboard?.totalLikes || 0, label: "Total Likes", gradient: "linear-gradient(135deg, #ff9a9e, #fecfef)" },
    { icon: <MessageCircle size={20} />, value: dashboard?.totalComments || 0, label: "Comments", gradient: "linear-gradient(135deg, #84fab0, #8fd3f4)" },
  ];

  return (
    <div className="admin-page">

      {/* Top Bar */}
      <header className="admin-topbar">
        <button className="admin-back-btn" onClick={() => navigate("/profile")} aria-label="Back">
          <ChevronLeft size={20} />
        </button>
        <div className="admin-topbar-center">
          <Shield size={18} className="admin-shield-icon" />
          <h1>Admin Dashboard</h1>
        </div>
        <div className="admin-topbar-badge">ADMIN</div>
      </header>

      {/* Stats Grid */}
      <section className="admin-stats-grid">
        {stats.map((s, i) => (
          <div key={i} className="admin-stat-card" style={{ "--card-gradient": s.gradient }}>
            <div className="admin-stat-icon">{s.icon}</div>
            <p className="admin-stat-value">{s.value.toLocaleString()}</p>
            <p className="admin-stat-label">{s.label}</p>
          </div>
        ))}
      </section>

      {/* Quick Actions */}
      <section className="admin-actions">
        <h2 className="admin-section-title">
          <BarChart3 size={16} /> Quick Actions
        </h2>
        <div className="admin-actions-grid">
          <button className="admin-action-card" onClick={() => navigate("/admin/moderation")}>
            <div className="admin-action-icon" style={{ background: "linear-gradient(135deg, #fccb90, #d57eeb)" }}>
              <Clock size={20} />
            </div>
            <div>
              <h3>Moderation Queue</h3>
              <p>{dashboard?.pendingTestimonies || 0} testimonies awaiting review</p>
            </div>
            <ArrowRight size={16} className="admin-action-arrow" />
          </button>

          <button className="admin-action-card" onClick={() => navigate("/admin/categories")}>
            <div className="admin-action-icon" style={{ background: "linear-gradient(135deg, #a18cd1, #fbc2eb)" }}>
              <Layers size={20} />
            </div>
            <div>
              <h3>Manage Categories</h3>
              <p>{dashboard?.totalCategories || 0} categories configured</p>
            </div>
            <ArrowRight size={16} className="admin-action-arrow" />
          </button>
        </div>
      </section>

      {/* Recent Pending */}
      <section className="admin-recent">
        <div className="admin-section-header">
          <h2 className="admin-section-title">
            <TrendingUp size={16} /> Recent Pending Testimonies
          </h2>
          {pending.length > 0 && (
            <button className="admin-see-all" onClick={() => navigate("/admin/moderation")}>
              View all <ArrowRight size={14} />
            </button>
          )}
        </div>

        {pending.length === 0 ? (
          <div className="admin-empty">
            <Star size={28} />
            <p>No pending testimonies! All caught up. 🎉</p>
          </div>
        ) : (
          <div className="admin-pending-list">
            {pending.map((t) => (
              <div key={t.id} className="admin-pending-card">
                <div className="admin-pending-accent" />
                <div className="admin-pending-body">
                  <div className="admin-pending-top">
                    <span className="admin-pending-cat">{t.category?.name || "General"}</span>
                    <span className="admin-pending-date">
                      {t.createdAt ? new Date(t.createdAt).toLocaleDateString() : ""}
                    </span>
                  </div>
                  <h3 className="admin-pending-title">{t.title}</h3>
                  <p className="admin-pending-author">By {t.user?.name || "Anonymous"} · {t.country || ""}</p>
                  <p className="admin-pending-excerpt">
                    {t.description ? t.description.slice(0, 120) + "..." : ""}
                  </p>
                  <div className="admin-pending-actions">
                    <button className="admin-approve-btn" onClick={() => handleQuickApprove(t.id)}>
                      <CheckCircle size={14} /> Approve
                    </button>
                    <button
                      className="admin-review-btn"
                      onClick={() => navigate("/admin/moderation")}
                    >
                      Review →
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
