// Profile.jsx
// "Testimonies" tab removed — now lives at /my-testimonies (MyTestimonies.jsx)
// Tabs remaining: Saved · Analytics · Notifications

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ChevronLeft, Bell, Settings, Camera, Heart, Bookmark,
  Eye, Share2, TrendingUp, CheckCircle, Clock, ChevronRight,
  LogOut, Edit3, Award, FileText,
} from "lucide-react";
import BottomNav from "../../Sections/BottomNav/BottomNav";
import "./styles.css";

// ─── Mock data ────────────────────────────────────────────────────────────────

const USER = {
  initials: "MI",
  name: "Michael Ihejirika",
  handle: "@michael.i",
  church: "Living Faith Church",
  location: "Port Harcourt, Nigeria",
  bio: "Sharing what God has done, so faith rises in others. Delivered. Restored. Grateful.",
  joinDate: "Member since March 2024",
  followers: 1240,
  following: 83,
  testimonyCount: 4,   // kept in sync with MyTestimonies mock
  avatar: null,
};

const ANALYTICS = [
  { icon: <Eye size={18} />,       value: "24.6K", label: "Total Views", color: "#dcccf4", text: "#5a3d8a" },
  { icon: <Heart size={18} />,     value: "3.2K",  label: "Total Likes", color: "#f3d8e4", text: "#8a3a5a" },
  { icon: <Share2 size={18} />,    value: "892",   label: "Shares",      color: "#d4e8d4", text: "#2a6b3a" },
  { icon: <TrendingUp size={18} />, value: "12",   label: "Trending",    color: "#f6d7be", text: "#8a5a2a" },
];

// Reused for analytics breakdown — keep consistent with MyTestimonies mock
const MY_TESTIMONIES_PREVIEW = [
  {
    id: "s005",
    tag: "Faith",      tagBg: "#e8d5b0", tagColor: "#6b4a1a",
    title: "I was free from addiction before I even finished praying",
    status: "approved", views: "4.2K", likes: 892,
  },
  {
    id: "s006",
    tag: "Healing",    tagBg: "#dcccf4", tagColor: "#5a3d8a",
    title: "The doctor called it a spontaneous remission. I call it God.",
    status: "approved", views: "1.8K", likes: 341,
  },
  {
    id: "s008",
    tag: "Salvation",  tagBg: "#d4e8d4", tagColor: "#2a6b3a",
    title: "My father gave his life to Christ on his hospital bed.",
    status: "approved", views: "6.1K", likes: 1420,
  },
];

const SAVED = [
  {
    id: "t001",
    tag: "Healing",     tagBg: "#dcccf4", tagColor: "#5a3d8a",
    title: "Doctors Said It Was Impossible — But God Had the Final Word",
    author: "Sister Mary Okonkwo", likes: 2847,
  },
  {
    id: "t004",
    tag: "Restoration", tagBg: "#d4e8d4", tagColor: "#2a6b3a",
    title: "After 11 years, my family is whole again",
    author: "Grace O.", likes: 4512,
  },
  {
    id: "t002",
    tag: "Provision",   tagBg: "#f6d7be", tagColor: "#8a5a2a",
    title: "Debt cleared overnight after prayer",
    author: "Emmanuel K.", likes: 1830,
  },
];

const NOTIFICATIONS = [
  {
    id: "n1", icon: "❤️", bg: "#f3d8e4",
    text: "Brother Taiwo and 84 others liked your testimony.",
    time: "2h ago", unread: true,
  },
  {
    id: "n2", icon: "💬", bg: "#dcccf4",
    text: "Pastor Joshua A. commented: \"Shared this in Sunday service. The whole congregation was on their feet.\"",
    time: "3h ago", unread: true,
  },
  {
    id: "n3", icon: "🙏", bg: "#d4e8d4",
    text: "341 people joined in prayer for your testimony this week.",
    time: "1d ago", unread: false,
  },
  {
    id: "n4", icon: "✨", bg: "#f6d7be",
    text: "Your story is trending in the Healing category.",
    time: "2d ago", unread: false,
  },
  {
    id: "n5", icon: "🏆", bg: "#e8d5b0",
    text: "Your testimony reached 4,000 views — a new milestone!",
    time: "3d ago", unread: false,
  },
];

const TABS = ["Saved", "Analytics", "Notifications"];

// ─── Profile page ──────────────────────────────────────────────────────────────
export default function Profile() {
  const navigate = useNavigate();
  const [activeTab,      setActiveTab]      = useState("Saved");
  const [editMode,       setEditMode]       = useState(false);
  const [bio,            setBio]            = useState(USER.bio);
  const [notifications,  setNotifications]  = useState(NOTIFICATIONS);

  const unreadCount = notifications.filter((n) => n.unread).length;

  function markAllRead() {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
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
          <button className="profile-icon-btn" aria-label="Settings" onClick={() => navigate("/admin")}>
            <Settings size={18} />
          </button>
        </div>
      </header>

      {/* ── PROFILE CARD ── */}
      <section className="profile-card">
        <div className="profile-avatar-wrap">
          <div className="profile-avatar">
            {USER.avatar
              ? <img src={USER.avatar} alt={USER.name} />
              : <span>{USER.initials}</span>
            }
          </div>
          <button className="profile-camera-btn" aria-label="Change photo" onClick={() => document.getElementById("avatar-upload")?.click()}>
            <Camera size={13} />
            <input id="avatar-upload" type="file" accept="image/*" style={{ display: "none" }} onChange={() => {}} />
          </button>
        </div>

        <div className="profile-identity">
          {editMode ? (
            <input
              className="profile-name-input"
              defaultValue={USER.name}
              autoFocus
            />
          ) : (
            <h1 className="profile-name">{USER.name}</h1>
          )}
          <p className="profile-handle">{USER.handle}</p>
          <p className="profile-sub">{USER.church} · {USER.location}</p>
        </div>

        {editMode ? (
          <textarea
            className="profile-bio-input"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={3}
          />
        ) : (
          <p className="profile-bio">{bio}</p>
        )}

        {/* social counts */}
        <div className="profile-social">
          <div className="profile-social-item">
            <span className="profile-social-count">{USER.followers.toLocaleString()}</span>
            <span className="profile-social-label">Followers</span>
          </div>
          <div className="profile-social-divider" />
          <div className="profile-social-item">
            <span className="profile-social-count">{USER.following}</span>
            <span className="profile-social-label">Following</span>
          </div>
          <div className="profile-social-divider" />
          <div className="profile-social-item">
            <span className="profile-social-count">{USER.testimonyCount}</span>
            <span className="profile-social-label">Testimonies</span>
          </div>
        </div>

        {/* actions */}
        <div className="profile-actions">
          <button
            className={`profile-edit-btn${editMode ? " profile-save-btn" : ""}`}
            onClick={() => setEditMode((e) => !e)}
          >
            {editMode
              ? <><CheckCircle size={15} /> Save Profile</>
              : <><Edit3 size={15} /> Edit Profile</>}
          </button>
          <button
            className="profile-share-btn"
            aria-label="Share profile"
            onClick={() => {
              const url = `${window.location.origin}/profile`;
              if (navigator.share) navigator.share({ title: USER.name, url }).catch(() => {});
              else navigator.clipboard?.writeText(url);
            }}
          >
            <Share2 size={16} />
          </button>
        </div>

        <p className="profile-join">{USER.joinDate}</p>
      </section>

      {/* ── MY TESTIMONIES NAV ROW ─────────────────────────────────────────── */}
      {/* Taps through to the dedicated MyTestimonies page */}
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
            <p className="profile-nav-row-sub">{USER.testimonyCount} stories · tap to manage</p>
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
              <span className="tab-count">{SAVED.length} stories</span>
            </div>

            {SAVED.map((s) => (
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
                  onClick={(e) => e.stopPropagation()}
                >
                  <Bookmark size={16} fill="#c9a96e" color="#c9a96e" />
                </button>
              </div>
            ))}
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
              {ANALYTICS.map((a, i) => (
                <div key={i} className="analytics-card" style={{ background: a.color }}>
                  <span className="analytics-icon" style={{ color: a.text }}>{a.icon}</span>
                  <p className="analytics-value" style={{ color: a.text }}>{a.value}</p>
                  <p className="analytics-label">{a.label}</p>
                </div>
              ))}
            </div>

            {/* Story breakdown — summary only; full list is on MyTestimonies page */}
            <div className="analytics-section-head">
              <h3 className="analytics-sub-title">Story Breakdown</h3>
              <button
                className="analytics-see-all"
                onClick={() => navigate("/my-testimonies")}
              >
                See all →
              </button>
            </div>

            {MY_TESTIMONIES_PREVIEW.map((t) => (
              <div key={t.id} className="analytics-row">
                <div className="analytics-row-left">
                  <span className="story-tag" style={{ background: t.tagBg, color: t.tagColor, fontSize: "9px" }}>
                    {t.tag}
                  </span>
                  <p className="analytics-row-title">{t.title}</p>
                </div>
                <div className="analytics-row-stats">
                  <span><Eye size={11} /> {t.views}</span>
                  <span><Heart size={11} /> {t.likes}</span>
                </div>
              </div>
            ))}

            <div className="achievement-card">
              <Award size={22} color="#c9a96e" />
              <div>
                <p className="achievement-title">Top Voice — Faith Category</p>
                <p className="achievement-sub">Your testimonies reached 4,000+ views this month</p>
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

            {notifications.map((n) => (
              <div key={n.id} className={`notif-item${n.unread ? " notif-unread" : ""}`}>
                <div className="notif-icon" style={{ background: n.bg }}>{n.icon}</div>
                <div className="notif-body">
                  <p className="notif-text">{n.text}</p>
                  <span className="notif-time">{n.time}</span>
                </div>
                {n.unread && <span className="notif-pip" />}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── SETTINGS FOOTER ── */}
      <div className="profile-footer">
        <button className="profile-footer-btn" onClick={() => navigate("/admin")}>
          <Settings size={15} /> Account Settings
          <ChevronRight size={14} className="ml-auto" />
        </button>
        <button
          className="profile-footer-btn profile-logout"
          onClick={() => {
            localStorage.removeItem("token");
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