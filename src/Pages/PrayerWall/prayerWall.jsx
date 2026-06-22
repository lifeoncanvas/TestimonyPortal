import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { ChevronLeft, ShieldAlert } from "lucide-react";
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

export default function PrayerWall() {
  const navigate = useNavigate();
  const [testimonies, setTestimonies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [prayedIds, setPrayedIds] = useState(new Set());
  const [encouragementText, setEncouragementText] = useState({});
  const [submittingComment, setSubmittingComment] = useState({});

  useEffect(() => {
    fetchTestimonies();
    // Load local list of testimonies prayed for in this session
    const savedPrayers = localStorage.getItem("prayed_testimonies");
    if (savedPrayers) {
      try {
        setPrayedIds(new Set(JSON.parse(savedPrayers)));
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  const fetchTestimonies = async () => {
    try {
      setLoading(true);
      // Fetch testimonies that are approved (or all, and filter)
      const res = await api.get("/api/testimonies");
      setTestimonies(res.data.content || []);
    } catch (err) {
      console.error("Error fetching testimonies for prayer wall:", err);
    } finally {
      setLoading(false);
    }
  };

  const handlePray = async (e, id) => {
    e.stopPropagation();
    if (prayedIds.has(id)) return; // Already prayed

    try {
      await api.post(`/api/testimonies/${id}/pray`);
      const newPrayed = new Set(prayedIds).add(id);
      setPrayedIds(newPrayed);
      localStorage.setItem("prayed_testimonies", JSON.stringify(Array.from(newPrayed)));

      // Increment prayCount locally in UI
      setTestimonies((prev) =>
        prev.map((t) => (t.id === id ? { ...t, prayCount: (t.prayCount || 0) + 1 } : t))
      );
    } catch (err) {
      console.error("Error praying for testimony:", err);
      // If unauthorized, redirect to login
      if (err.response?.status === 401) {
        navigate("/login");
      }
    }
  };

  const handleCommentChange = (testimonyId, value) => {
    setEncouragementText((prev) => ({ ...prev, [testimonyId]: value }));
  };

  const submitEncouragement = async (e, testimonyId) => {
    e.preventDefault();
    const text = encouragementText[testimonyId]?.trim();
    if (!text) return;

    setSubmittingComment((prev) => ({ ...prev, [testimonyId]: true }));
    try {
      await api.post(`/api/testimonies/${testimonyId}/comments`, { content: text });
      setEncouragementText((prev) => ({ ...prev, [testimonyId]: "" }));
      alert("Encouraging prayer posted successfully!");
    } catch (err) {
      console.error("Error posting encouragement:", err);
      if (err.response?.status === 401) {
        navigate("/login");
      } else {
        alert("Failed to submit comment: " + (err.response?.data?.message || err.message));
      }
    } finally {
      setSubmittingComment((prev) => ({ ...prev, [testimonyId]: false }));
    }
  };

  return (
    <div className="prayer-wall-page">
      {/* ── TOP BAR ── */}
      <header className="pw-topbar">
        <button className="pw-icon-btn" onClick={() => navigate(-1)} aria-label="Back">
          <ChevronLeft size={20} />
        </button>
        <span className="pw-topbar-title">Prayer Wall</span>
        <div style={{ width: 20 }} /> {/* Spacer */}
      </header>

      {/* ── HERO BANNER ── */}
      <section className="pw-hero">
        <div className="pw-hero-overlay" />
        <div className="pw-hero-content">
          <span className="pw-hero-eyebrow">✦ SPUR ON FAITH</span>
          <h1>Spiritual Support & Intercession</h1>
          <p>
            "Pray one for another, that ye may be healed. The effectual fervent prayer of a righteous man availeth much."
          </p>
        </div>
      </section>

      {/* ── STATS SECTION ── */}
      <section className="pw-stats">
        <div className="pw-stat-card">
          <div className="pw-stat-icon">🙏</div>
          <div className="pw-stat-details">
            <h3>{prayedIds.size}</h3>
            <p>Intercessions Sent</p>
          </div>
        </div>
        <div className="pw-stat-card">
          <div className="pw-stat-icon">🔥</div>
          <div className="pw-stat-details">
            <h3>{testimonies.reduce((sum, t) => sum + (t.prayCount || 0), 0)}</h3>
            <p>Global Prayers</p>
          </div>
        </div>
      </section>

      {/* ── TESTIMONIES FEED ── */}
      <main className="pw-feed">
        <h2>Lift Up in Prayer</h2>
        <p className="pw-feed-sub">Tap "Pray" to immediately stand in agreement with the testifier.</p>

        {loading ? (
          <div className="pw-loading">
            <h3>Loading Prayer Requests...</h3>
          </div>
        ) : testimonies.length === 0 ? (
          <div className="pw-empty">
            <ShieldAlert size={40} color="var(--muted)" />
            <p>No prayer requests listed yet.</p>
          </div>
        ) : (
          <div className="pw-grid">
            {testimonies.map((t) => {
              const style = getTagStyle(t.category?.name);
              const alreadyPrayed = prayedIds.has(t.id);

              return (
                <article key={t.id} className="pw-card" onClick={() => navigate(`/testimony/${t.id}`)}>
                  <div className="pw-card-header">
                    <span className="pw-tag" style={{ background: style.bg, color: style.color }}>
                      {t.category?.name || "Miracle"}
                    </span>
                    <span className="pw-location">{t.country || "Global"}</span>
                  </div>

                  <h3 className="pw-card-title">"{t.title}"</h3>
                  <p className="pw-card-desc">
                    {t.description?.length > 160 ? t.description.slice(0, 160) + "..." : t.description}
                  </p>

                  <div className="pw-card-author">
                    <strong>{t.user?.name || "Anonymous"}</strong>
                    {t.church && <span> · {t.church}</span>}
                  </div>

                  {/* Actions Row */}
                  <div className="pw-card-actions">
                    <button
                      className={`pw-pray-btn${alreadyPrayed ? " prayed" : ""}`}
                      onClick={(e) => handlePray(e, t.id)}
                      disabled={alreadyPrayed}
                    >
                      <span className={`pw-pray-icon${alreadyPrayed ? " spin-pulse" : ""}`}>🙏</span>
                      {alreadyPrayed ? "Sent in Agreement" : "Pray for Testifier"}
                      <span className="pw-count-badge">{(t.prayCount || 0)}</span>
                    </button>
                  </div>

                  {/* Encouragement / Prayer Input */}
                  <div className="pw-comment-box" onClick={(e) => e.stopPropagation()}>
                    <form onSubmit={(e) => submitEncouragement(e, t.id)} className="pw-comment-form">
                      <input
                        type="text"
                        placeholder="Write a short prayer of encouragement..."
                        value={encouragementText[t.id] || ""}
                        onChange={(e) => handleCommentChange(t.id, e.target.value)}
                        disabled={submittingComment[t.id]}
                      />
                      <button type="submit" disabled={submittingComment[t.id] || !encouragementText[t.id]?.trim()}>
                        Post
                      </button>
                    </form>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  );
}
