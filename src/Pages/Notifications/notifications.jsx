import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { ChevronLeft, Bell, X } from "lucide-react";
import BottomNav from "../../Sections/BottomNav/BottomNav";
import api from "../../services/axiosConfig";
import "./styles.css";

const FILTERS = ["All", "Prayers", "Approvals", "Engagements"];

function formatTime(dateString) {
  if (!dateString) return "Just now";
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
}

function getAvatarAndStyles(type) {
  const t = type ? type.toUpperCase() : "LIKE";
  if (t === "PRAYER") {
    return { avatar: "🙏", bg: "#ede5f8", color: "#6b3fbf", name: "Prayer Wall", action: "View" };
  } else if (t === "APPROVED" || t === "REJECTED") {
    return { avatar: "✓", bg: "#f5ead8", color: "#7a5218", name: "System", action: "View" };
  } else if (t === "COMMENT") {
    return { avatar: "💬", bg: "#dff0df", color: "#276b32", name: "Commenter", action: "Reply" };
  } else {
    return { avatar: "❤️", bg: "#fae3ed", color: "#a03060", name: "Engagement", action: "View" };
  }
}

export default function Notifications() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [activeFilter, setActiveFilter] = useState("All");
  const [showClear, setShowClear] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await api.get("/api/notifications");
      const mapped = (res.data || []).map((n) => {
        const visual = getAvatarAndStyles(n.type);
        return {
          id: n.id,
          type: n.type?.toLowerCase() || "like",
          icon: visual.avatar,
          avatar: visual.avatar,
          avatarBg: visual.bg,
          avatarColor: visual.color,
          name: visual.name,
          message: n.message,
          time: formatTime(n.createdAt),
          read: n.isRead,
          action: visual.action,
          referenceId: n.referenceId,
        };
      });
      setNotifications(mapped);
    } catch (err) {
      console.error("Error fetching notifications:", err);
    } finally {
      setLoading(false);
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  async function markAsRead(id) {
    try {
      await api.post(`/api/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
    } catch (err) {
      console.error("Error marking notification read:", err);
    }
  }

  async function markAllAsRead() {
    try {
      // Parallel requests to mark all read
      const unread = notifications.filter((n) => !n.read);
      await Promise.all(unread.map((n) => api.post(`/api/notifications/${n.id}/read`)));
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setShowClear(false);
    } catch (err) {
      console.error("Error marking all read:", err);
    }
  }

  function deleteNotification(id) {
    // Local delete since there is no backend delete endpoint
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }

  const filtered = notifications.filter((n) => {
    if (activeFilter === "All") return true;
    if (activeFilter === "Prayers") return n.type === "prayer";
    if (activeFilter === "Approvals") return ["approved", "rejected"].includes(n.type);
    if (activeFilter === "Engagements") return ["like", "comment", "trending", "milestone"].includes(n.type);
    return true;
  });

  const handleActionClick = (n) => {
    if (n.referenceId) {
      navigate(`/testimony/${n.referenceId}`);
    } else {
      navigate("/");
    }
  };

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
        {loading ? (
          <div className="notif-empty">
            <h3>Loading...</h3>
          </div>
        ) : filtered.length === 0 ? (
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
                  handleActionClick(n);
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