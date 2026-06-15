import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, Bell, Heart, MessageCircle, CheckCircle, Flame, Eye, X } from "lucide-react";
import BottomNav from "../../Sections/BottomNav/BottomNav";
import "./styles.css";

const NOTIFICATIONS_DATA = [
  {
    id: "n1",
    type: "prayer",
    icon: "🙏",
    avatar: "BT",
    avatarBg: "#ede5f8",
    avatarColor: "#6b3fbf",
    name: "Brother Taiwo",
    message: "Prayed for your testimony about addiction.",
    time: "2m ago",
    read: false,
    action: "View",
  },
  {
    id: "n2",
    type: "like",
    icon: "❤️",
    avatar: "SM",
    avatarBg: "#fae3ed",
    avatarColor: "#a03060",
    name: "Sister Mary & 47 others",
    message: "Liked your healing testimony.",
    time: "18m ago",
    read: false,
    action: "View",
  },
  {
    id: "n3",
    type: "comment",
    icon: "💬",
    avatar: "PJ",
    avatarBg: "#dff0df",
    avatarColor: "#276b32",
    name: "Pastor Joshua",
    message: "Commented: 'Shared this in our Sunday service.'",
    time: "45m ago",
    read: true,
    action: "Reply",
  },
  {
    id: "n4",
    type: "approved",
    icon: "✓",
    avatar: "MM",
    avatarBg: "#f5ead8",
    avatarColor: "#7a5218",
    name: "My Miracle Story Team",
    message: "Your prayer request has been approved and posted.",
    time: "2h ago",
    read: true,
    action: "View",
  },
  {
    id: "n5",
    type: "trending",
    icon: "🔥",
    avatar: "MS",
    avatarBg: "#faecd8",
    avatarColor: "#9a5a1a",
    name: "My Miracle Story",
    message: "Your testimony is trending in the Healing category.",
    time: "5h ago",
    read: true,
    action: "View",
  },
  {
    id: "n6",
    type: "milestone",
    icon: "🏆",
    avatar: "MMS",
    avatarBg: "#daeef8",
    avatarColor: "#185a80",
    name: "My Miracle Story",
    message: "Your story reached 4,000 views — a new milestone!",
    time: "1d ago",
    read: true,
    action: "View",
  },
];

const FILTERS = ["All", "Prayers", "Approvals", "Engagements"];

export default function Notifications() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState(NOTIFICATIONS_DATA);
  const [activeFilter, setActiveFilter] = useState("All");
  const [showClear, setShowClear] = useState(false);

  const unreadCount = notifications.filter((n) => !n.read).length;

  function markAsRead(id) {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  }

  function markAllAsRead() {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setShowClear(false);
  }

  function deleteNotification(id) {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }

  const filtered = notifications.filter((n) => {
    if (activeFilter === "All") return true;
    if (activeFilter === "Prayers") return n.type === "prayer";
    if (activeFilter === "Approvals") return n.type === "approved";
    if (activeFilter === "Engagements") return ["like", "comment", "trending", "milestone"].includes(n.type);
    return true;
  });

  return (
    <div className="notif-page">

      {/* HEADER */}
      <header className="notif-header">
        <button className="notif-back" onClick={() => navigate(-1)} aria-label="Back">
          <ChevronLeft size={20} />
        </button>
        <div className="notif-header-center">
          <Bell size={18} />
          <h1>Notifications</h1>
        </div>
        <div className="notif-header-right">
          {unreadCount > 0 && (
            <button className="notif-clear-btn" onClick={() => setShowClear(!showClear)}>
              Mark all
            </button>
          )}
        </div>
      </header>

      {/* Clear prompt */}
      {showClear && (
        <div className="notif-clear-prompt">
          <p>Mark all notifications as read?</p>
          <div className="notif-clear-actions">
            <button onClick={() => setShowClear(false)}>Cancel</button>
            <button onClick={markAllAsRead} className="notif-confirm">Confirm</button>
          </div>
        </div>
      )}

      {/* FILTERS */}
      <div className="notif-filters">
        {FILTERS.map((f) => (
          <button
            key={f}
            className={`notif-filter-btn${activeFilter === f ? " active" : ""}`}
            onClick={() => setActiveFilter(f)}
          >
            {f}
            {f === "All" && unreadCount > 0 && <span className="notif-badge">{unreadCount}</span>}
          </button>
        ))}
      </div>

      {/* STATS */}
      {notifications.length > 0 && (
        <div className="notif-stats">
          <span>{filtered.length} notification{filtered.length !== 1 ? "s" : ""}</span>
          {unreadCount > 0 && <span className="notif-unread-text">{unreadCount} unread</span>}
        </div>
      )}

      {/* NOTIFICATIONS LIST */}
      <section className="notif-list">
        {filtered.length === 0 ? (
          <div className="notif-empty">
            <Bell size={40} opacity={0.3} />
            <p>No notifications yet.</p>
            <span>When someone prays for your story, you'll see it here.</span>
          </div>
        ) : (
          filtered.map((n) => (
            <div
              key={n.id}
              className={`notif-item${!n.read ? " unread" : ""}`}
              onClick={() => markAsRead(n.id)}
            >
              <div className="notif-item-avatar" style={{ background: n.avatarBg, color: n.avatarColor }}>
                {n.avatar}
              </div>

              <div className="notif-item-body">
                <div className="notif-item-header">
                  <p className="notif-item-name">{n.name}</p>
                  {!n.read && <span className="notif-pip" />}
                </div>
                <p className="notif-item-message">{n.message}</p>
                <span className="notif-item-time">{n.time}</span>
              </div>

              <div className="notif-item-actions">
                <button className="notif-action-btn" onClick={(e) => {
                  e.stopPropagation();
                  markAsRead(n.id);
                }}>
                  {n.action}
                </button>
                <button
                  className="notif-delete-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteNotification(n.id);
                  }}
                  aria-label="Delete"
                >
                  <X size={16} />
                </button>
              </div>
            </div>
          ))
        )}
      </section>

      <BottomNav />
    </div>
  );
}