import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router";
import {
  ChevronLeft, CheckCircle, XCircle, Clock, Eye,
  ChevronDown, ChevronUp, Star, TrendingUp, Shield, Trash2,
  Play, Pause, X, User, MapPin, FileText, MessageSquare,
  Send, Volume2, Video, Image as ImageIcon,
} from "lucide-react";
import api from "../../services/axiosConfig";
import "./styles.css";

const STATUS_TABS = [
  { id: "PENDING", label: "Pending", icon: <Clock size={14} /> },
  { id: "", label: "All", icon: <Eye size={14} /> },
  { id: "APPROVED", label: "Approved", icon: <CheckCircle size={14} /> },
  { id: "REJECTED", label: "Rejected", icon: <XCircle size={14} /> },
  { id: "GRC", label: "GRC (Private)", icon: <Shield size={14} /> },
];

// ── Detail Review Panel ─────────────────────────────────────────────────────
function DetailPanel({ testimony, onClose, onAction, apiBase }) {
  const [activeMedia, setActiveMedia] = useState(0);
  const [playing, setPlaying] = useState(false);
  const videoRef = useRef(null);
  const audioRef = useRef(null);
  const [adminNote, setAdminNote] = useState("");
  const [comments, setComments] = useState([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const [submittingComment, setSubmittingComment] = useState(false);

  const t = testimony;
  const media = t.media || [];
  const videos = media.filter(m => m.mediaType === "VIDEO");
  const audios = media.filter(m => m.mediaType === "AUDIO");
  const images = media.filter(m => m.mediaType === "IMAGE");

  useEffect(() => {
    fetchComments();
  }, [t.id]);

  const fetchComments = async () => {
    setLoadingComments(true);
    try {
      const res = await api.get(`/api/testimonies/${t.id}/comments`);
      setComments(res.data || []);
    } catch (err) {
      console.error("Error fetching comments:", err);
    } finally {
      setLoadingComments(false);
    }
  };

  const handleSendComment = async () => {
    if (!adminNote.trim()) return;
    setSubmittingComment(true);
    try {
      const res = await api.post(`/api/testimonies/${t.id}/comments`, {
        content: adminNote.trim(),
      });
      setComments(prev => [res.data, ...prev]);
      setAdminNote("");
    } catch (err) {
      console.error("Error posting comment:", err);
    } finally {
      setSubmittingComment(false);
    }
  };

  const togglePlay = () => {
    const current = media[activeMedia];
    if (!current) return;
    if (current.mediaType === "VIDEO" && videoRef.current) {
      if (playing) videoRef.current.pause();
      else videoRef.current.play();
      setPlaying(!playing);
    } else if (current.mediaType === "AUDIO" && audioRef.current) {
      if (playing) audioRef.current.pause();
      else audioRef.current.play();
      setPlaying(!playing);
    }
  };

  const getMediaUrl = (m) => {
    if (!m?.fileUrl) return "";
    if (m.fileUrl.startsWith("http")) return m.fileUrl;
    return (apiBase || "") + m.fileUrl;
  };

  const statusLower = (t.status || "").toLowerCase();

  // Detail rows helper
  const DetailRow = ({ label, value }) => {
    if (!value) return null;
    return (
      <div className="mod-detail-row">
        <span className="mod-detail-label">{label}</span>
        <span className="mod-detail-value">{value}</span>
      </div>
    );
  };

  return (
    <div className="mod-detail-overlay" onClick={onClose}>
      <div className="mod-detail-panel" onClick={(e) => e.stopPropagation()}>
        {/* Panel Header */}
        <div className="mod-detail-header">
          <div className="mod-detail-header-left">
            <span className={`mod-card-status ${statusLower}`} style={{ fontSize: "11px" }}>
              {statusLower === "approved" && <><CheckCircle size={11} /> Approved</>}
              {statusLower === "pending" && <><Clock size={11} /> Pending Review</>}
              {statusLower === "rejected" && <><XCircle size={11} /> Rejected</>}
            </span>
            {t.isGrc && <span className="mod-detail-grc"><Shield size={11} /> GRC</span>}
          </div>
          <button className="mod-detail-close" onClick={onClose}><X size={20} /></button>
        </div>

        {/* Scrollable Content */}
        <div className="mod-detail-scroll">

          {/* ── Media Section ── */}
          {media.length > 0 && (
            <div className="mod-media-section">
              <h4 className="mod-section-label"><Video size={14} /> Media Attachments ({media.length})</h4>

              {/* Main viewer */}
              <div className="mod-media-viewer">
                {media[activeMedia]?.mediaType === "VIDEO" && (
                  <video
                    ref={videoRef}
                    src={getMediaUrl(media[activeMedia])}
                    controls
                    className="mod-media-video"
                    onPlay={() => setPlaying(true)}
                    onPause={() => setPlaying(false)}
                    onEnded={() => setPlaying(false)}
                  />
                )}
                {media[activeMedia]?.mediaType === "AUDIO" && (
                  <div className="mod-media-audio-wrap">
                    <div className="mod-audio-visual">
                      <Volume2 size={40} />
                      <span>Audio Testimony</span>
                    </div>
                    <audio
                      ref={audioRef}
                      src={getMediaUrl(media[activeMedia])}
                      controls
                      className="mod-media-audio"
                      onPlay={() => setPlaying(true)}
                      onPause={() => setPlaying(false)}
                      onEnded={() => setPlaying(false)}
                    />
                  </div>
                )}
                {media[activeMedia]?.mediaType === "IMAGE" && (
                  <img
                    src={getMediaUrl(media[activeMedia])}
                    alt="Testimony media"
                    className="mod-media-image"
                  />
                )}
              </div>

              {/* Thumbnails */}
              {media.length > 1 && (
                <div className="mod-media-thumbs">
                  {media.map((m, i) => (
                    <button
                      key={i}
                      className={`mod-media-thumb${i === activeMedia ? " active" : ""}`}
                      onClick={() => { setActiveMedia(i); setPlaying(false); }}
                    >
                      {m.mediaType === "VIDEO" && <Video size={14} />}
                      {m.mediaType === "AUDIO" && <Volume2 size={14} />}
                      {m.mediaType === "IMAGE" && <ImageIcon size={14} />}
                      <span>{m.mediaType}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── Title & Category ── */}
          <div className="mod-detail-title-section">
            <span className="mod-card-cat">{t.category?.name || "General"}</span>
            <h2 className="mod-detail-title">{t.title}</h2>
            <p className="mod-detail-meta">
              Submitted by <strong>{t.user?.name || "Anonymous"}</strong> on{" "}
              {t.createdAt ? new Date(t.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }) : "—"}
            </p>
          </div>

          {/* ── Testifier Information ── */}
          <div className="mod-detail-section">
            <h4 className="mod-section-label"><User size={14} /> Testifier Information</h4>
            <div className="mod-detail-grid">
              <DetailRow label="Full Name" value={t.fullName} />
              <DetailRow label="Phone" value={t.telephoneNumber} />
              <DetailRow label="Age" value={t.age} />
              <DetailRow label="Gender" value={t.gender} />
            </div>
          </div>

          {/* ── Location ── */}
          <div className="mod-detail-section">
            <h4 className="mod-section-label"><MapPin size={14} /> Location Details</h4>
            <div className="mod-detail-grid">
              <DetailRow label="Country" value={t.country} />
              <DetailRow label="State" value={t.state} />
              <DetailRow label="City" value={t.city} />
              <DetailRow label="Healing Centre" value={t.healingCentreLocation} />
              <DetailRow label="Attendees at Venue" value={t.attendeesAtVenue} />
            </div>
          </div>

          {/* ── Testimony Details ── */}
          <div className="mod-detail-section">
            <h4 className="mod-section-label"><FileText size={14} /> Testimony Details</h4>

            {t.conditionProblem && (
              <div className="mod-detail-block">
                <span className="mod-block-label">Condition / Problem</span>
                <p className="mod-block-text">{t.conditionProblem}</p>
              </div>
            )}

            {t.conditionDuration && (
              <div className="mod-detail-block">
                <span className="mod-block-label">Duration of Condition</span>
                <p className="mod-block-text">{t.conditionDuration}</p>
              </div>
            )}

            {t.unableToDoBefore && (
              <div className="mod-detail-block">
                <span className="mod-block-label">Unable to Do Before</span>
                <p className="mod-block-text">{t.unableToDoBefore}</p>
              </div>
            )}

            {t.whatHappenedDuringProgram && (
              <div className="mod-detail-block">
                <span className="mod-block-label">What Happened During the Program</span>
                <p className="mod-block-text">{t.whatHappenedDuringProgram}</p>
              </div>
            )}

            {t.ableToDoNow && (
              <div className="mod-detail-block">
                <span className="mod-block-label">Able to Do Now</span>
                <p className="mod-block-text">{t.ableToDoNow}</p>
              </div>
            )}

            {t.inviterOrNextOfKinDetails && (
              <div className="mod-detail-block">
                <span className="mod-block-label">Inviter / Next of Kin</span>
                <p className="mod-block-text">{t.inviterOrNextOfKinDetails}</p>
              </div>
            )}
          </div>

          {/* ── Full Description ── */}
          <div className="mod-detail-section">
            <h4 className="mod-section-label"><FileText size={14} /> Full Description</h4>
            <div className="mod-detail-description">
              {(t.description || "No description provided.").split("\n").map((line, i) => (
                <p key={i}>{line || "\u00A0"}</p>
              ))}
            </div>
          </div>

          {/* ── Admin Comments / Notes ── */}
          <div className="mod-detail-section">
            <h4 className="mod-section-label"><MessageSquare size={14} /> Admin Comments & Notes</h4>
            <div className="mod-comment-box">
              <textarea
                value={adminNote}
                onChange={(e) => setAdminNote(e.target.value)}
                placeholder="Add a note or request additional details from the testifier..."
                rows={3}
              />
              <button
                className="mod-comment-send"
                onClick={handleSendComment}
                disabled={!adminNote.trim() || submittingComment}
              >
                <Send size={14} />
                {submittingComment ? "Sending..." : "Post Comment"}
              </button>
            </div>

            {loadingComments ? (
              <p className="mod-comments-loading">Loading comments...</p>
            ) : comments.length > 0 ? (
              <div className="mod-comments-list">
                {comments.map((c) => (
                  <div className="mod-comment-item" key={c.id}>
                    <div className="mod-comment-avatar">
                      {(c.user?.name || "A").charAt(0).toUpperCase()}
                    </div>
                    <div className="mod-comment-content">
                      <div className="mod-comment-meta">
                        <strong>{c.user?.name || "Anonymous"}</strong>
                        <span>{c.createdAt ? new Date(c.createdAt).toLocaleDateString() : ""}</span>
                      </div>
                      <p>{c.content}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="mod-comments-empty">No comments yet.</p>
            )}
          </div>
        </div>

        {/* ── Sticky Action Bar ── */}
        <div className="mod-detail-actions-bar">
          {statusLower !== "approved" && (
            <button className="mod-btn approve" onClick={() => onAction("approve", t.id)}>
              <CheckCircle size={15} /> Approve
            </button>
          )}
          {statusLower !== "rejected" && (
            <button className="mod-btn reject" onClick={() => onAction("reject", t.id)}>
              <XCircle size={15} /> Reject
            </button>
          )}
          <button
            className={`mod-btn toggle ${t.isFeatured ? "active" : ""}`}
            onClick={() => onAction("feature", t.id)}
          >
            <Star size={15} /> {t.isFeatured ? "Unfeature" : "Feature"}
          </button>
          <button
            className={`mod-btn toggle ${t.isTrending ? "active" : ""}`}
            onClick={() => onAction("trend", t.id)}
          >
            <TrendingUp size={15} /> {t.isTrending ? "Untrend" : "Trend"}
          </button>
          <button className="mod-btn delete" onClick={() => onAction("delete", t.id)}>
            <Trash2 size={15} /> Delete
          </button>
        </div>
      </div>
    </div>
  );
}


// ── Main Admin Moderation ───────────────────────────────────────────────────
export default function AdminModeration() {
  const navigate = useNavigate();
  const [testimonies, setTestimonies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("PENDING");
  const [expandedId, setExpandedId] = useState(null);
  const [detailTestimony, setDetailTestimony] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
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
      let res;
      if (statusFilter === "GRC") {
        res = await api.get("/api/admin/testimonies/grc", { params });
      } else {
        if (statusFilter) params.status = statusFilter;
        res = await api.get("/api/admin/testimonies", { params });
      }
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

  const openDetail = async (testimonyId) => {
    setLoadingDetail(true);
    try {
      const res = await api.get(`/api/testimonies/${testimonyId}`);
      setDetailTestimony(res.data);
    } catch (err) {
      console.error("Error loading testimony detail:", err);
      showToast("Failed to load testimony details", "error");
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleApprove = async (id) => {
    try {
      await api.post(`/api/admin/testimonies/${id}/approve`);
      setTestimonies((prev) => prev.map((t) =>
        t.id === id ? { ...t, status: "APPROVED" } : t
      ));
      if (detailTestimony?.id === id) {
        setDetailTestimony(prev => ({ ...prev, status: "APPROVED" }));
      }
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
      if (detailTestimony?.id === rejectModal) {
        setDetailTestimony(prev => ({ ...prev, status: "REJECTED" }));
      }
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
      if (detailTestimony?.id === id) {
        setDetailTestimony(prev => ({ ...prev, isFeatured: !prev.isFeatured }));
      }
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
      if (detailTestimony?.id === id) {
        setDetailTestimony(prev => ({ ...prev, isTrending: !prev.isTrending }));
      }
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
      if (detailTestimony?.id === id) {
        setDetailTestimony(null);
      }
      showToast("Testimony deleted successfully!");
    } catch (err) {
      showToast("Failed to delete: " + (err.response?.data?.message || err.message), "error");
    }
  };

  const handleDetailAction = (action, id) => {
    switch (action) {
      case "approve": handleApprove(id); break;
      case "reject": setRejectModal(id); setRejectReason(""); break;
      case "feature": handleToggleFeatured(id); break;
      case "trend": handleToggleTrending(id); break;
      case "delete": handleDelete(id); break;
      default: break;
    }
  };

  const apiBase = api.defaults.baseURL || "";

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
            const hasMedia = t.media && t.media.length > 0;
            return (
              <div key={t.id} className={`mod-card ${statusLower}`}>
                <div className="mod-card-accent" />
                <div className="mod-card-body">

                  {/* Header */}
                  <div className="mod-card-header">
                    <div className="mod-card-header-left">
                      <span className="mod-card-cat">{t.category?.name || "General"}</span>
                      <span className={`mod-card-status ${statusLower}`}>
                        {t.isGrc && <span style={{color:'var(--gold)', marginRight:'8px'}}><Shield size={10} /> GRC</span>}
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

                  {/* Media indicators */}
                  {hasMedia && (
                    <div className="mod-media-indicators">
                      {t.media.filter(m => m.mediaType === "VIDEO").length > 0 && (
                        <span className="mod-media-indicator"><Video size={12} /> Video</span>
                      )}
                      {t.media.filter(m => m.mediaType === "AUDIO").length > 0 && (
                        <span className="mod-media-indicator"><Volume2 size={12} /> Audio</span>
                      )}
                      {t.media.filter(m => m.mediaType === "IMAGE").length > 0 && (
                        <span className="mod-media-indicator"><ImageIcon size={12} /> Images</span>
                      )}
                    </div>
                  )}

                  {/* Expandable description */}
                  <div className={`mod-card-desc ${isExpanded ? "expanded" : ""}`}>
                    <p>{t.description || ""}</p>
                  </div>
                  <button
                    className="mod-expand-btn"
                    onClick={() => setExpandedId(isExpanded ? null : t.id)}
                  >
                    {isExpanded ? <><ChevronUp size={13} /> Show less</> : <><ChevronDown size={13} /> Read more</>}
                  </button>

                  {/* Badges */}
                  <div className="mod-card-badges">
                    {t.isFeatured && <span className="mod-badge featured"><Star size={10} /> Featured</span>}
                    {t.isTrending && <span className="mod-badge trending"><TrendingUp size={10} /> Trending</span>}
                    <span className="mod-badge views"><Eye size={10} /> {t.viewCount || 0}</span>
                  </div>

                  {/* Actions */}
                  <div className="mod-card-actions">
                    <button className="mod-btn review" onClick={() => openDetail(t.id)}>
                      <Eye size={13} /> Review Full Details
                    </button>
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
                    <button className="mod-btn delete" onClick={() => handleDelete(t.id)} style={{ background: "rgba(231, 76, 60, 0.1)", color: "#e74c3c", border: "1px solid rgba(231, 76, 60, 0.2)" }}>
                      <Trash2 size={13} /> Delete
                    </button>
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

      {/* Detail Review Panel */}
      {detailTestimony && (
        <DetailPanel
          testimony={detailTestimony}
          onClose={() => setDetailTestimony(null)}
          onAction={handleDetailAction}
          apiBase={apiBase}
        />
      )}

      {/* Loading Detail Overlay */}
      {loadingDetail && (
        <div className="mod-detail-overlay">
          <div className="mod-detail-loading">
            <div className="admin-spinner" />
            <p>Loading testimony details...</p>
          </div>
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
