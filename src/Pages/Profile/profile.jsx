// Profile.jsx
// Route: /profile

import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import {
  ChevronLeft, Bell, Settings, Camera, Heart, Bookmark,
  Eye, Share2, TrendingUp, CheckCircle, ChevronRight,
  LogOut, Edit3, Award, FileText,
} from "lucide-react";
import BottomNav from "../../Sections/BottomNav/BottomNav";
import api from "../../services/axiosConfig";
import "./styles.css";

const TAG_STYLES = {
  "Healing Streams":          { bg: "#dcccf4", color: "#5a3d8a" },
  "Partnership":              { bg: "#f6d7be", color: "#8a5a2a" },
  "Healing to the Nations":   { bg: "#d4e8d4", color: "#2a6b3a" },
  "Magazines":                { bg: "#e8d5b0", color: "#6b4a1a" },
  "Prayer Clouds":            { bg: "#e0f0f8", color: "#1a5a7a" },
  "Crusades":                 { bg: "#ffe4d4", color: "#8a3a1a" },
  "Pray with Me":             { bg: "#f3d8e4", color: "#8a3a5a" },
  "Heralds":                  { bg: "#fef3c7", color: "#92610a" },
};

const getTagStyle = (cat) => TAG_STYLES[cat] || { bg: "#e8d5b0", color: "#6b4a1a" };

const TABS = ["Saved", "Analytics", "Notifications"];

export default function Profile() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("Saved");
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(true);

  // Profile data state
  const [user, setUser] = useState({
    id: null,
    name: "",
    email: "",
    avatarUrl: "",
    church: "",
    zone: "",
    country: "",
    role: "",
    createdAt: "",
  });

  // Edited form state
  const [form, setForm] = useState({
    name: "",
    church: "",
    zone: "",
    country: "",
    avatarUrl: "",
  });

  // Saved testimonies
  const [saved, setSaved] = useState([]);
  
  // Analytics
  const [analytics, setAnalytics] = useState({
    totalViews: 0,
    totalLikes: 0,
    totalShares: 0,
    totalTestimonies: 0,
  });

  // Notifications
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    try {
      setLoading(true);
      // Fetch user profile
      const userRes = await api.get("/api/users/me");
      setUser(userRes.data);
      setForm({
        name: userRes.data.name || "",
        church: userRes.data.church || "",
        zone: userRes.data.zone || "",
        country: userRes.data.country || "",
        avatarUrl: userRes.data.avatarUrl || "",
      });

      // Fetch analytics
      try {
        const analyticsRes = await api.get("/api/users/me/analytics");
        setAnalytics(analyticsRes.data);
      } catch (err) {
        console.error("Error loading analytics:", err);
      }

      // Fetch saved testimonies
      try {
        const savedRes = await api.get("/api/users/me/saved");
        const mappedSaved = (savedRes.data.content || []).map((t) => {
          const style = getTagStyle(t.categoryName || "Healing Streams");
          return {
            id: t.id,
            title: t.title,
            tag: t.categoryName || "Healing Streams",
            tagBg: style.bg,
            tagColor: style.color,
            author: t.user?.name || "Anonymous",
            likes: t.likeCount || 0,
          };
        });
        setSaved(mappedSaved);
      } catch (err) {
        console.error("Error loading saved testimonies:", err);
      }

      // Fetch notifications
      try {
        const notifRes = await api.get("/api/notifications");
        setNotifications(notifRes.data || []);
      } catch (err) {
        console.error("Error loading notifications:", err);
      }

    } catch (err) {
      console.error("Error fetching profile details:", err);
      // If error (e.g. unauthenticated), redirect to login
      navigate("/login");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    try {
      const res = await api.put("/api/users/me", form);
      setUser(res.data);
      setEditMode(false);
    } catch (err) {
      alert("Failed to update profile: " + (err.response?.data?.message || err.message));
    }
  };

  const handleUnsave = async (e, testimonyId) => {
    e.stopPropagation();
    try {
      await api.delete(`/api/testimonies/${testimonyId}/save`);
      setSaved((prev) => prev.filter((s) => s.id !== testimonyId));
    } catch (err) {
      alert("Failed to unsave: " + (err.response?.data?.message || err.message));
    }
  };

  const markAllRead = async () => {
    try {
      const unread = notifications.filter((n) => !n.isRead);
      await Promise.all(unread.map((n) => api.post(`/api/notifications/${n.id}/read`)));
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (err) {
      console.error("Error marking read:", err);
    }
  };

  const initials = user.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "U";

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const joinDate = user.createdAt
    ? `Member since ${new Date(user.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long' })}`
    : "Member";

  const analyticsCards = [
    { icon: <Eye size={18} />,       value: analytics.totalViews, label: "Total Views", color: "#dcccf4", text: "#5a3d8a" },
    { icon: <Heart size={18} />,     value: analytics.totalLikes,  label: "Total Likes", color: "#f3d8e4", text: "#8a3a5a" },
    { icon: <Share2 size={18} />,    value: analytics.totalShares,   label: "Shares",      color: "#d4e8d4", text: "#2a6b3a" },
    { icon: <TrendingUp size={18} />, value: analytics.totalTestimonies,   label: "Stories",    color: "#f6d7be", text: "#8a5a2a" },
  ];

  if (loading) {
    return (
      <div className="profile-page" style={{ justifyContent: "center", alignItems: "center", display: "flex", height: "100vh" }}>
        <h3>Loading Account Info...</h3>
      </div>
    );
  }

  return (
    <div className="profile-page">

      {/* ── TOP BAR ── */}
      <header className="profile-topbar">
        <button className="profile-icon-btn" onClick={() => navigate(-1)} aria-label="Back">
          <ChevronLeft size={20} />
        </button>
        <span className="profile-topbar-title">My Account</span>
        <div className="profile-topbar-right">
          <button
            className="profile-icon-btn notif-btn"
            aria-label="Notifications"
            onClick={() => setActiveTab("Notifications")}
          >
            <Bell size={18} />
            {unreadCount > 0 && <span className="notif-dot">{unreadCount}</span>}
          </button>
          {user.role === "ADMIN" && (
            <button className="profile-icon-btn" aria-label="Settings" onClick={() => navigate("/admin")}>
              <Settings size={18} />
            </button>
          )}
        </div>
      </header>

      {/* ── PROFILE CARD ── */}
      <section className="profile-card">
        <div className="profile-avatar-wrap">
          <div className="profile-avatar">
            {user.avatarUrl
              ? <img src={user.avatarUrl} alt={user.name} />
              : <span>{initials}</span>
            }
          </div>
          <button className="profile-camera-btn" aria-label="Change photo" onClick={() => document.getElementById("avatar-upload")?.click()}>
            <Camera size={13} />
            <input id="avatar-upload" type="file" accept="image/*" style={{ display: "none" }} onChange={() => {}} />
          </button>
        </div>

        <div className="profile-identity">
          {editMode ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "8px", width: "100%", padding: "10px" }}>
              <input
                className="profile-name-input"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Full Name"
              />
              <input
                className="profile-name-input"
                value={form.church}
                onChange={(e) => setForm({ ...form, church: e.target.value })}
                placeholder="Church"
              />
              <input
                className="profile-name-input"
                value={form.zone}
                onChange={(e) => setForm({ ...form, zone: e.target.value })}
                placeholder="Zone"
              />
              <input
                className="profile-name-input"
                value={form.country}
                onChange={(e) => setForm({ ...form, country: e.target.value })}
                placeholder="Country"
              />
            </div>
          ) : (
            <>
              <h1 className="profile-name">{user.name}</h1>
              <p className="profile-handle">{user.email}</p>
              <p className="profile-sub">{user.church} · {user.zone} · {user.country}</p>
            </>
          )}
        </div>

        {/* social counts */}
        <div className="profile-social" style={{ marginTop: "15px" }}>
          <div className="profile-social-item">
            <span className="profile-social-count">{analytics.totalViews}</span>
            <span className="profile-social-label">Views</span>
          </div>
          <div className="profile-social-divider" />
          <div className="profile-social-item">
            <span className="profile-social-count">{analytics.totalLikes}</span>
            <span className="profile-social-label">Likes</span>
          </div>
          <div className="profile-social-divider" />
          <div className="profile-social-item">
            <span className="profile-social-count">{analytics.totalTestimonies}</span>
            <span className="profile-social-label">Testimonies</span>
          </div>
        </div>

        {/* actions */}
        <div className="profile-actions" style={{ marginTop: "15px" }}>
          {editMode ? (
            <button className="profile-edit-btn profile-save-btn" onClick={handleSaveProfile}>
              <CheckCircle size={15} /> Save Profile
            </button>
          ) : (
            <button className="profile-edit-btn" onClick={() => setEditMode(true)}>
              <Edit3 size={15} /> Edit Profile
            </button>
          )}
          <button
            className="profile-share-btn"
            aria-label="Share profile"
            onClick={() => {
              const url = `${window.location.origin}/profile`;
              if (navigator.share) navigator.share({ title: user.name, url }).catch(() => {});
              else navigator.clipboard?.writeText(url);
            }}
          >
            <Share2 size={16} />
          </button>
        </div>

        <p className="profile-join" style={{ marginTop: "10px" }}>{joinDate}</p>
      </section>

      {/* ── MY TESTIMONIES NAV ROW ─────────────────────────────────────────── */}
      <button
        className="profile-nav-row"
        onClick={() => navigate("/my-testimonies")}
        aria-label="Go to My Testimonies"
      >
        <div className="profile-nav-row-left">
          <div className="profile-nav-row-icon">
            <FileText size={16} />
          </div>
          <div>
            <p className="profile-nav-row-title">My Testimonies</p>
            <p className="profile-nav-row-sub">{analytics.totalTestimonies} stories · tap to manage</p>
          </div>
        </div>
        <ChevronRight size={16} className="profile-nav-row-chevron" />
      </button>

      {/* ── TABS ── */}
      <div className="profile-tabs">
        {TABS.map((tab) => (
          <button
            key={tab}
            className={`profile-tab${activeTab === tab ? " active" : ""}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
            {tab === "Notifications" && unreadCount > 0 && (
              <span className="tab-badge">{unreadCount}</span>
            )}
          </button>
        ))}
      </div>

      {/* ── TAB CONTENT ── */}
      <div className="profile-content">

        {/* SAVED */}
        {activeTab === "Saved" && (
          <div className="tab-saved">
            <div className="tab-section-header">
              <h2>Liked & Saved</h2>
              <span className="tab-count">{saved.length} stories</span>
            </div>

            {saved.length === 0 ? (
              <p style={{ textAlign: "center", padding: "20px", color: "var(--muted)", fontSize: "13px" }}>No saved stories yet.</p>
            ) : (
              saved.map((s) => (
                <div
                  key={s.id}
                  className="saved-card"
                  onClick={() => navigate(`/testimony/${s.id}`)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === "Enter" && navigate(`/testimony/${s.id}`)}
                >
                  <div className="saved-thumb" />
                  <div className="saved-body">
                    <span className="story-tag" style={{ background: s.tagBg, color: s.tagColor }}>
                      {s.tag}
                    </span>
                    <h3 className="saved-title">{s.title}</h3>
                    <div className="saved-meta">
                      <span>{s.author}</span>
                      <span><Heart size={11} /> {s.likes.toLocaleString()}</span>
                    </div>
                  </div>
                  <button
                    className="saved-remove"
                    aria-label="Remove from saved"
                    onClick={(e) => handleUnsave(e, s.id)}
                  >
                    <Bookmark size={16} fill="#c9a96e" color="#c9a96e" />
                  </button>
                </div>
              ))
            )}
          </div>
        )}

        {/* ANALYTICS */}
        {activeTab === "Analytics" && (
          <div className="tab-analytics">
            <div className="tab-section-header">
              <h2>Your Impact</h2>
              <span className="tab-count">All time</span>
            </div>

            <div className="analytics-grid">
              {analyticsCards.map((a, i) => (
                <div key={i} className="analytics-card" style={{ background: a.color }}>
                  <span className="analytics-icon" style={{ color: a.text }}>{a.icon}</span>
                  <p className="analytics-value" style={{ color: a.text }}>{a.value}</p>
                  <p className="analytics-label">{a.label}</p>
                </div>
              ))}
            </div>

            <div className="achievement-card" style={{ marginTop: "20px" }}>
              <Award size={22} color="#c9a96e" />
              <div>
                <p className="achievement-title">Faith & Testimony Impact</p>
                <p className="achievement-sub">Thank you for sharing your testimonies to build faith globally!</p>
              </div>
            </div>
          </div>
        )}

        {/* NOTIFICATIONS */}
        {activeTab === "Notifications" && (
          <div className="tab-notifications">
            <div className="tab-section-header">
              <h2>Notifications</h2>
              {unreadCount > 0 && (
                <button className="mark-read-btn" onClick={markAllRead}>
                  Mark all read
                </button>
              )}
            </div>

            {notifications.length === 0 ? (
              <p style={{ textAlign: "center", padding: "20px", color: "var(--muted)", fontSize: "13px" }}>No new notifications.</p>
            ) : (
              notifications.map((n) => (
                <div key={n.id} className={`notif-item${!n.isRead ? " notif-unread" : ""}`}>
                  <div className="notif-icon" style={{ background: "#f3d8e4" }}>🔔</div>
                  <div className="notif-body">
                    <p className="notif-text">{n.message}</p>
                    <span className="notif-time">{new Date(n.createdAt).toLocaleDateString()}</span>
                  </div>
                  {!n.isRead && <span className="notif-pip" />}
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* ── SETTINGS FOOTER ── */}
      <div className="profile-footer">
        <button
          className="profile-footer-btn profile-logout"
          onClick={() => {
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            navigate("/login");
          }}
        >
          <LogOut size={15} /> Sign Out
        </button>
      </div>

      <BottomNav />
    </div>
  );
}