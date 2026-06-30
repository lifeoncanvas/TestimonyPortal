/**
 * TestimonyDetails.jsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Route:   /testimony/:id
 * Purpose: Full detail view of a single testimony.
 */

// ─── 1. IMPORTS ──────────────────────────────────────────────────────────────
import React, { useState, useRef, useEffect } from "react";
import { useNavigate, useParams } from "react-router";
import {
  ChevronLeft, Play, Pause, Bookmark,
  Heart, MessageCircle, Share2, Sparkles, Flame, Send, Trash2
} from "lucide-react";
import BottomNav from "../../Sections/BottomNav/BottomNav";
import api from "../../services/axiosConfig";
import "./styles.css";

const THUMB_COLORS = {
  0: "linear-gradient(135deg,#1a3a6b,#365fa3)",
  1: "linear-gradient(135deg,#2a4a1f,#4a8032)",
  2: "linear-gradient(135deg,#4a1a2a,#8a3050)",
};

export default function TestimonyDetail() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [loading, setLoading] = useState(true);
  const [testimony, setTestimony] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  
  // Audio player state
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const intervalRef = useRef(null);
  const audioRef = useRef(null);

  // Engagement state
  const [blessed, setBlessed] = useState(false);
  const [blessCount, setBlessCount] = useState(0);
  const [miracled, setMiracled] = useState(false);
  const [miracleCount, setMiracleCount] = useState(0);
  const [prayerJoined, setPrayerJoined] = useState(false);
  const [saved, setSaved] = useState(false);

  // Read-more state
  const [expanded, setExpanded] = useState(false);

  // Comment state
  const [commentText, setCommentText] = useState("");
  const [localComments, setLocalComments] = useState([]);
  const commentInputRef = useRef(null);

  // Related testimonies
  const [related, setRelated] = useState([]);

  // Toast state
  const [toast, setToast] = useState({ show: false, msg: "" });
  const toastTimer = useRef(null);

  useEffect(() => {
    try {
      const token = localStorage.getItem("token");
      if (token) {
        const u = JSON.parse(localStorage.getItem("user"));
        setCurrentUser(u);
      }
    } catch (err) {
      console.error(err);
    }
    fetchTestimonyDetails();
  }, [id]);

  const fetchTestimonyDetails = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/api/testimonies/${id}`);
      setTestimony(res.data);
      
      setBlessed(res.data.isLikedByMe || false);
      setBlessCount(res.data.likeCount || 0);
      setSaved(res.data.isSavedByMe || false);
      setMiracleCount(res.data.sameMiracleCount || 0);
      
      // Load comments
      fetchComments();

      // Load related
      if (res.data.category?.id) {
        fetchRelated(res.data.category.id);
      }
    } catch (err) {
      console.error("Error loading testimony details:", err);
      showToast("Error loading testimony.");
    } finally {
      setLoading(false);
    }
  };

  const fetchComments = async () => {
    try {
      const res = await api.get(`/api/testimonies/${id}/comments`);
      setLocalComments(res.data || []);
    } catch (err) {
      console.error("Error fetching comments:", err);
    }
  };

  const fetchRelated = async (categoryId) => {
    try {
      const res = await api.get(`/api/testimonies`, {
        params: { categoryId, size: 3 }
      });
      // Filter out current testimony
      const filtered = (res.data.content || []).filter(item => String(item.id) !== String(id));
      setRelated(filtered);
    } catch (err) {
      console.error("Error fetching related stories:", err);
    }
  };

  function showToast(msg) {
    clearTimeout(toastTimer.current);
    setToast({ show: true, msg });
    toastTimer.current = setTimeout(
      () => setToast({ show: false, msg: "" }),
      2200
    );
  }

  // Audio simulation or real play
  const hasAudio = testimony?.media?.some(m => m.mediaType === "AUDIO");
  const audioFile = testimony?.media?.find(m => m.mediaType === "AUDIO");
  const hasVideo = testimony?.media?.some(m => m.mediaType === "VIDEO");
  const videoFile = testimony?.media?.find(m => m.mediaType === "VIDEO");
  const hasImage = testimony?.media?.some(m => m.mediaType === "IMAGE");
  const imageFile = testimony?.media?.find(m => m.mediaType === "IMAGE");

  const getMediaUrl = (m) => {
    if (!m?.fileUrl) return "";
    if (m.fileUrl.startsWith("http")) return m.fileUrl;
    return (api.defaults.baseURL || "") + m.fileUrl;
  };

  useEffect(() => {
    if (playing) {
      intervalRef.current = setInterval(() => {
        setProgress((p) => {
          if (p >= 100) {
            clearInterval(intervalRef.current);
            setPlaying(false);
            return 100;
          }
          return p + 1;
        });
      }, 1000);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [playing]);

  function formatTime(pct) {
    const total = 180; // 3 mins default
    const secs  = Math.floor((total * pct) / 100);
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  }

  const handleBless = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      showToast("Please sign in to bless this story.");
      return;
    }
    try {
      if (blessed) {
        await api.delete(`/api/testimonies/${id}/like`);
        setBlessed(false);
        setBlessCount((c) => c - 1);
      } else {
        await api.post(`/api/testimonies/${id}/like`);
        setBlessed(true);
        setBlessCount((c) => c + 1);
        showToast("Blessed this testimony ♥");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveToggle = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      showToast("Please sign in to save stories.");
      return;
    }
    try {
      if (saved) {
        await api.delete(`/api/testimonies/${id}/save`);
        setSaved(false);
        showToast("Removed from saved stories");
      } else {
        await api.post(`/api/testimonies/${id}/save`);
        setSaved(true);
        showToast("Story saved!");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleMiracle = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      showToast("Please sign in to react.");
      return;
    }
    try {
      if (miracled) {
        setMiracled(false);
        setMiracleCount((c) => c - 1);
      } else {
        await api.post(`/api/testimonies/${id}/same-miracle`);
        setMiracled(true);
        setMiracleCount((c) => c + 1);
        showToast("Standing in faith for the same miracle ✨");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handlePrayer = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      showToast("Please sign in to join prayers.");
      return;
    }
    try {
      await api.post(`/api/testimonies/${id}/pray`);
      setPrayerJoined(true);
      showToast("🙏 You have joined in prayer for this person");
    } catch (err) {
      console.error(err);
    }
  };

  const handleSend = async () => {
    if (!commentText.trim()) return;
    const token = localStorage.getItem("token");
    if (!token) {
      showToast("Please sign in to comment.");
      return;
    }
    try {
      const res = await api.post(`/api/testimonies/${id}/comments`, {
        content: commentText.trim()
      });
      setLocalComments((prev) => [res.data, ...prev]);
      setCommentText("");
      showToast("Comment posted");
    } catch (err) {
      console.error(err);
    }
  };

  function focusComment() {
    commentInputRef.current?.focus();
    commentInputRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  const handleDeleteTestimony = async () => {
    if (!window.confirm("Are you sure you want to delete this testimony?")) return;
    try {
      await api.delete(`/api/testimonies/${id}`);
      showToast("Testimony deleted.");
      setTimeout(() => navigate("/browse"), 1500);
    } catch (err) {
      showToast("Failed to delete testimony: " + (err.response?.data?.message || err.message));
    }
  };

  if (loading) {
    return (
      <div className="td-page" style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
        <h3>Loading details...</h3>
      </div>
    );
  }

  if (!testimony) {
    return (
      <div className="td-page" style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
        <h3>Testimony not found.</h3>
      </div>
    );
  }

  // Split description by paragraphs
  const paragraphs = testimony.description ? testimony.description.split("\n\n") : [];
  const visibleBody = expanded ? paragraphs : paragraphs.slice(0, 2);

  const initials = testimony.user?.name
    ? testimony.user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "T";

  return (
    <div className="td-page">
      <div className="td-hero">
        <div className="td-hero-glow" />
        <span className="td-hero-cross" aria-hidden="true">✝</span>
        
        <div style={{ display: "flex", justifyContent: "space-between", position: "absolute", top: "20px", left: "20px", right: "20px", zIndex: 10 }}>
          <button className="icon-btn-ghost" onClick={() => navigate(-1)} aria-label="Go back">
            <ChevronLeft size={24} />
          </button>
          
          <div style={{ display: "flex", gap: "10px" }}>
            {(currentUser?.role === "ADMIN" || currentUser?.id === testimony.user?.id) && (
              <button 
                className="icon-btn-ghost" 
                onClick={handleDeleteTestimony} 
                aria-label="Delete testimony"
                style={{ background: "rgba(231, 76, 60, 0.2)", color: "#ff6b6b" }}
              >
                <Trash2 size={20} />
              </button>
            )}
            <button className="icon-btn-ghost" onClick={() => {
              if (navigator.share) {
                navigator.share({
                  title: testimony.title,
                  url: window.location.href,
                }).catch(console.error);
              } else {
                navigator.clipboard.writeText(window.location.href);
                showToast("Link copied to clipboard!");
              }
            }} aria-label="Share testimony">
              <Share2 size={20} />
            </button>
          </div>
        </div>

        <div className="td-hero-content">
          <span className="td-hero-category">{testimony.category?.name}</span>
          <h1 className="td-hero-title">{testimony.title}</h1>
          <button onClick={handleSaveToggle} aria-label="Save" style={{ background: "rgba(0,0,0,0.4)", border: "none", color: "#fff", padding: "10px", borderRadius: "50%", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Bookmark size={20} fill={saved ? "#c9a96e" : "none"} color={saved ? "#c9a96e" : "#fff"} />
          </button>
        </div>

        {hasVideo ? (
          <div className="td-player-center">
            <video 
              controls 
              src={getMediaUrl(videoFile)}
              className="td-media-video"
              style={{ width: "100%", maxHeight: "350px", objectFit: "cover", borderRadius: "12px", background: "#000" }}
            />
          </div>
        ) : hasAudio ? (
          <div className="td-player-center">
            <span className="td-media-label">Audio Testimony</span>
            <button
              className="td-play-btn"
              onClick={() => setPlaying((p) => !p)}
              aria-label={playing ? "Pause" : "Play"}
            >
              {playing ? <Pause size={26} /> : <Play size={26} style={{ marginLeft: 3 }} />}
            </button>
            <div className="td-progress-wrap">
              <div className="td-progress-track">
                <div className="td-progress-fill" style={{ width: `${progress}%` }} />
              </div>
              <div className="td-progress-times">
                <span>{formatTime(progress)}</span>
                <span>3:00</span>
              </div>
            </div>
            {audioFile && <audio ref={audioRef} src={getMediaUrl(audioFile)} style={{ display: "none" }} />}
          </div>
        ) : hasImage ? (
          <div className="td-player-center" style={{ width: "100%", height: "100%" }}>
            <img 
              src={getMediaUrl(imageFile)} 
              alt="Testimony" 
              style={{ width: "100%", height: "100%", objectFit: "cover", opacity: 0.8 }} 
            />
          </div>
        ) : null}
      </div>

      <div className="td-body">
        <div className="td-meta-row">
          <span className="td-badge">{testimony.category?.name || "Miracle"}</span>
          <span className="td-date">{new Date(testimony.createdAt).toLocaleDateString()}</span>
        </div>

        <h1 className="td-title">{testimony.title}</h1>

        <div className="td-author">
          <div className="td-avatar">{initials}</div>
          <div className="td-author-info">
            <p className="td-author-name">{testimony.user?.name || "Anonymous"}</p>
            <p className="td-author-sub">
              {testimony.church || "CE Church"} • {testimony.zone || ""} • {testimony.country}
            </p>
          </div>
          <button
            className="td-follow-btn"
            onClick={() => showToast(`Following ${testimony.user?.name || "Testifier"}`)}
          >
            Follow
          </button>
        </div>

        <div className="td-divider" />

        <div className="td-text">
          {visibleBody.map((para, i) => (
            <React.Fragment key={i}>
              <p>{para}</p>
            </React.Fragment>
          ))}

          {!expanded && paragraphs.length > 2 && (
            <div className="td-fade-out" />
          )}
        </div>

        {paragraphs.length > 2 && (
          <button
            className="td-read-more"
            onClick={() => setExpanded((e) => !e)}
          >
            {expanded ? "Show less ↑" : "Read full testimony ↓"}
          </button>
        )}

        <div className="td-divider" />

        <div className="td-engage">
          <button
            className={`td-eng-btn${blessed ? " td-blessed" : ""}`}
            onClick={handleBless}
            aria-label="Bless"
          >
            <Heart size={20} fill={blessed ? "#c0392b" : "none"} />
            <span className="td-eng-count">{blessCount}</span>
            <span className="td-eng-label">Bless</span>
          </button>

          <button className="td-eng-btn" onClick={focusComment} aria-label="Comment">
            <MessageCircle size={20} />
            <span className="td-eng-count">{localComments.length}</span>
            <span className="td-eng-label">Comment</span>
          </button>

          <button
            className="td-eng-btn"
            onClick={() => {
              const url = window.location.href;
              navigator.clipboard?.writeText(url);
              showToast("Link copied to clipboard!");
            }}
            aria-label="Share"
          >
            <Share2 size={20} />
            <span className="td-eng-count">Share</span>
            <span className="td-eng-label">Spread</span>
          </button>

          <button
            className={`td-eng-btn${miracled ? " td-miracled" : ""}`}
            onClick={handleMiracle}
            aria-label="Same Miracle"
          >
            <Sparkles size={20} />
            <span className="td-eng-count">{miracleCount}</span>
            <span className="td-eng-label">Same Miracle</span>
          </button>
        </div>

        <button
          className={`td-prayer-btn${prayerJoined ? " td-prayer-joined" : ""}`}
          onClick={handlePrayer}
          disabled={prayerJoined}
        >
          <Flame size={18} />
          {prayerJoined ? "Praying for this Person ✓" : "Join in Prayer for this Person"}
        </button>

        <div className="td-divider" />

        <h2 className="td-section-title">{localComments.length} Comments</h2>

        <div className="td-comment-input-row">
          <div className="td-c-avatar" style={{ background: "#e8d5b0" }}>C</div>
          <input
            ref={commentInputRef}
            type="text"
            placeholder="Add a comment..."
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
          />
          <button
            className="td-send-btn"
            onClick={handleSend}
            aria-label="Send comment"
          >
            <Send size={14} />
          </button>
        </div>        {localComments.map((c) => {
          const commentInitials = c.user?.name
            ? c.user.name.split(" ").map(n => n[0]).join("").toUpperCase()
            : "C";
          return (
            <div className="td-comment" key={c.id}>
              <div className="td-comment-header">
                <div className="td-c-avatar" style={{ background: "#ece4da", color: "#0f2447" }}>
                  {commentInitials}
                </div>
                <span className="td-c-name">{c.user?.name || "Anonymous"}</span>
                <span className="td-c-time">{new Date(c.createdAt).toLocaleDateString()}</span>
              </div>
              <p className="td-c-text">{c.content}</p>
            </div>
          );
        })}

        <div className="td-divider" />

        {related.length > 0 && (
          <div className="td-related-section">
            <h2 className="td-section-title">Related Testimonies</h2>
            <div className="td-related-scroll">
              {related.map((item, idx) => (
                <div
                  className="td-related-card"
                  key={item.id}
                  onClick={() => navigate(`/testimony/${item.id}`)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === "Enter" && navigate(`/testimony/${item.id}`)}
                >
                  {/* Gradient thumbnail — shows play icon for audio testimonies */}
                  <div
                    className="td-r-thumb"
                    style={{ background: THUMB_COLORS[idx % 3] }}
                  >
                    {item.media?.some(m => m.mediaType === "AUDIO") && (
                      <Play size={20} color="rgba(255,255,255,0.7)" />
                    )}
                  </div>
                  <p className="td-r-title">{item.title}</p>
                  <p className="td-r-author">{item.user?.name} • {item.country}</p>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>{/* end .td-body */}


      {/*
        ════════════════════════════════════════════════════════
        TOAST NOTIFICATION
        ════════════════════════════════════════════════════════
        Small pill that slides up from the bottom when an action is taken.
        Controlled by showToast() — auto-hides after 2.2s.
        aria-live="polite" announces the message to screen readers.
      */}
      <div
        className={`td-toast${toast.show ? " td-toast-show" : ""}`}
        role="status"
        aria-live="polite"
      >
        {toast.msg}
      </div>

      {/* Fixed bottom navigation bar — shared across all pages */}
      <BottomNav />

    </div>
  );
}
