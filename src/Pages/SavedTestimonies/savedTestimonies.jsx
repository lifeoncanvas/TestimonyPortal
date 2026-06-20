import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { Bookmark, Heart } from "lucide-react";
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

export default function SavedTestimonies() {
  const navigate = useNavigate();
  const [saved, setSaved] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSaved();
  }, []);

  const fetchSaved = async () => {
    try {
      setLoading(true);
      const res = await api.get("/api/users/me/saved");
      const mapped = (res.data.content || []).map((t) => {
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
      setSaved(mapped);
    } catch (err) {
      console.error("Error fetching saved testimonies:", err);
    } finally {
      setLoading(false);
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

  return (
    <div className="saved-testimonies-page">
      <header className="saved-header">
        <h1>Saved Stories</h1>
        <span>{saved.length} stories</span>
      </header>

      <div className="saved-list">
        {loading ? (
          <div className="saved-empty">
            <h3>Loading...</h3>
          </div>
        ) : saved.length === 0 ? (
          <div className="saved-empty" style={{ textAlign: "center", padding: "40px 20px" }}>
            <Bookmark size={40} opacity={0.3} style={{ marginBottom: "16px" }} />
            <p>No saved testimonies yet.</p>
            <span style={{ fontSize: "12px", color: "var(--muted)" }}>Click the bookmark icon on any testimony to save it.</span>
          </div>
        ) : (
          saved.map((s) => (
            <div
              key={s.id}
              className="saved-item"
              onClick={() => navigate(`/testimony/${s.id}`)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === "Enter" && navigate(`/testimony/${s.id}`)}
            >
              <div className="saved-item-thumb" />
              <div className="saved-item-body">
                <span className="saved-tag" style={{ background: s.tagBg, color: s.tagColor }}>{s.tag}</span>
                <h3>{s.title}</h3>
                <div className="saved-item-meta">
                  <span>{s.author}</span>
                  <span><Heart size={11} /> {s.likes.toLocaleString()}</span>
                </div>
              </div>
              <button
                className="saved-item-unsave"
                aria-label="Remove from saved"
                onClick={(e) => handleUnsave(e, s.id)}
              >
                <Bookmark size={16} fill="#c9a96e" color="#c9a96e" />
              </button>
            </div>
          ))
        )}
      </div>

      <BottomNav />
    </div>
  );
}

