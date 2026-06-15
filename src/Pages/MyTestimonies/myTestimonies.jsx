// MyTestimonies.jsx
// Route: /my-testimonies
// Linked from Profile page via the "Testimonies" row.
// All API calls are commented out — mock data is active.

import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router";
import {
  ChevronLeft, Plus, Eye, Heart, CheckCircle, Clock,
  MoreHorizontal, Edit3, Trash2, Share2, XCircle,
} from "lucide-react";
import BottomNav from "../../Sections/BottomNav/BottomNav";
import "./styles.css";

// ─── Mock data ────────────────────────────────────────────────────────────────
// TODO: replace with GET /api/testimonies/mine

const MOCK_TESTIMONIES = [
  {
    id: "s005",
    tag: "Faith",
    tagBg: "#e8d5b0",
    tagColor: "#6b4a1a",
    accentColor: "#c9a96e",
    title: "I was free from addiction before I even finished praying",
    date: "June 3, 2025",
    status: "approved",
    views: 4200,
    likes: 892,
  },
  {
    id: "s006",
    tag: "Healing",
    tagBg: "#dcccf4",
    tagColor: "#5a3d8a",
    accentColor: "#9b7fd4",
    title: "The doctor called it a spontaneous remission. I call it God.",
    date: "May 17, 2025",
    status: "approved",
    views: 1800,
    likes: 341,
  },
  {
    id: "s007",
    tag: "Provision",
    tagBg: "#f6d7be",
    tagColor: "#8a5a2a",
    accentColor: "#e0945a",
    title: "Lost everything in the fire. Had a new home in 30 days.",
    date: "Aug 2, 2025",
    status: "pending",
    views: null,
    likes: null,
  },
  {
    id: "s008",
    tag: "Salvation",
    tagBg: "#d4e8d4",
    tagColor: "#2a6b3a",
    accentColor: "#5aaa6a",
    title: "My father gave his life to Christ on his hospital bed. We thought we were losing him.",
    date: "Mar 10, 2025",
    status: "approved",
    views: 6100,
    likes: 1420,
  },
];

// Filter options
const FILTERS = [
  { id: "all",      label: "All"      },
  { id: "approved", label: "Published" },
  { id: "pending",  label: "Pending"  },
];

// ─── Format helpers ────────────────────────────────────────────────────────────
function fmtNum(n) {
  if (n === null || n === undefined) return null;
  return n >= 1000 ? `${(n / 1000).toFixed(1)}K` : String(n);
}

// ─── Context menu ─────────────────────────────────────────────────────────────
function CardMenu({ testimony, onDelete, onShare }) {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  return (
    <div className="mt-menu-wrap" ref={ref}>
      <button
        className="mt-menu-btn"
        onClick={(e) => { e.stopPropagation(); setOpen((o) => !o); }}
        aria-label="More options"
        aria-expanded={open}
      >
        <MoreHorizontal size={16} />
      </button>

      {open && (
        <div className="mt-dropdown" role="menu">
          <button
            className="mt-dropdown-item"
            role="menuitem"
            onClick={(e) => {
              e.stopPropagation();
              setOpen(false);
              onShare(testimony);
            }}
          >
            <Share2 size={14} /> Share
          </button>

          {testimony.status === "approved" && (
            <button
              className="mt-dropdown-item"
              role="menuitem"
              onClick={(e) => { e.stopPropagation(); setOpen(false); navigate(`/upload?edit=${testimony.id}`); }}
            >
              <Edit3 size={14} /> Edit
            </button>
          )}

          <div className="mt-dropdown-divider" />

          <button
            className="mt-dropdown-item danger"
            role="menuitem"
            onClick={(e) => {
              e.stopPropagation();
              setOpen(false);
              onDelete(testimony.id);
            }}
          >
            <Trash2 size={14} /> Delete
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Single testimony card ─────────────────────────────────────────────────────
function TestimonyCard({ testimony, onDelete, onShare }) {
  const navigate = useNavigate();
  const isClickable = testimony.status === "approved";

  const handleClick = () => {
    if (isClickable) navigate(`/testimony/${testimony.id}`);
  };

  return (
    <article
      className={`mt-card${isClickable ? " clickable" : ""}`}
      onClick={handleClick}
      role={isClickable ? "button" : undefined}
      tabIndex={isClickable ? 0 : undefined}
      onKeyDown={(e) => e.key === "Enter" && handleClick()}
      aria-label={testimony.title}
    >
      {/* colour-coded accent bar */}
      <div className="mt-card-accent" style={{ background: testimony.accentColor }} />

      <div className="mt-card-body">
        {/* top row: tag + status + menu */}
        <div className="mt-card-top">
          <div className="mt-card-top-left">
            <span
              className="mt-tag"
              style={{ background: testimony.tagBg, color: testimony.tagColor }}
            >
              {testimony.tag}
            </span>

            <span className={`mt-status ${testimony.status}`}>
              {testimony.status === "approved" && <><CheckCircle size={11} /> Published</>}
              {testimony.status === "pending"  && <><Clock size={11} /> Pending</>}
              {testimony.status === "rejected" && <><XCircle size={11} /> Rejected</>}
            </span>
          </div>

          <CardMenu
            testimony={testimony}
            onDelete={onDelete}
            onShare={onShare}
          />
        </div>

        {/* title */}
        <h2 className="mt-card-title">{testimony.title}</h2>

        {/* footer */}
        <div className="mt-card-footer">
          <span className="mt-card-date">{testimony.date}</span>

          {testimony.status === "approved" && (
            <div className="mt-card-stats">
              <span><Eye size={11} /> {fmtNum(testimony.views)}</span>
              <span><Heart size={11} /> {fmtNum(testimony.likes)}</span>
            </div>
          )}

          {testimony.status === "pending" && (
            <span className="mt-pending-note">Usually reviewed within 24h</span>
          )}
        </div>
      </div>
    </article>
  );
}

// ─── MyTestimonies page ────────────────────────────────────────────────────────
export default function MyTestimonies() {
  const navigate  = useNavigate();
  const [items,   setItems]   = useState(MOCK_TESTIMONIES);
  const [filter,  setFilter]  = useState("all");
  const [scrolled, setScrolled] = useState(false);

  // Sticky header shadow on scroll
  useEffect(() => {
    const el = document.querySelector(".mt-page");
    if (!el) return;
    const handler = () => setScrolled(el.scrollTop > 8);
    el.addEventListener("scroll", handler);
    return () => el.removeEventListener("scroll", handler);
  }, []);

  // Delete a testimony
  const handleDelete = (id) => {
    if (!window.confirm("Delete this testimony? This can't be undone.")) return;
    setItems((prev) => prev.filter((t) => t.id !== id));
    // TODO: DELETE /api/testimonies/{id}
    // fetch(`/api/testimonies/${id}`, { method: "DELETE" });
  };

  // Share a testimony
  const handleShare = (testimony) => {
    const url  = `${window.location.origin}/testimony/${testimony.id}`;
    const text = `"${testimony.title}" — read on My Miracle Story`;
    if (navigator.share) {
      navigator.share({ title: testimony.title, text, url }).catch(() => {});
    } else {
      navigator.clipboard?.writeText(url);
    }
    // TODO: POST /api/testimonies/{id}/share  (track share count)
  };

  // Derived: filtered list + stats
  const filtered = filter === "all" ? items : items.filter((t) => t.status === filter);
  const totalViews  = items.filter((t) => t.views).reduce((s, t) => s + t.views, 0);
  const totalLikes  = items.filter((t) => t.likes).reduce((s, t) => s + t.likes, 0);
  const approvedCount = items.filter((t) => t.status === "approved").length;
  const pendingCount  = items.filter((t) => t.status === "pending").length;

  return (
    <div className="mt-page">

      {/* ── Top bar ── */}
      <header className={`mt-topbar${scrolled ? " scrolled" : ""}`}>
        <div className="mt-topbar-left">
          <button className="mt-back-btn" onClick={() => navigate(-1)} aria-label="Back">
            <ChevronLeft size={20} />
          </button>
          <h1>My Testimonies</h1>
        </div>
      </header>

      {/* ── Summary strip ── */}
      <div className="mt-summary">
        <div className="mt-stat">
          <span className="mt-stat-value">{items.length}</span>
          <span className="mt-stat-label">Total</span>
        </div>
        <div className="mt-stat">
          <span className="mt-stat-value">{approvedCount}</span>
          <span className="mt-stat-label">Published</span>
        </div>
        <div className="mt-stat">
          <span className="mt-stat-value">{fmtNum(totalViews)}</span>
          <span className="mt-stat-label">Views</span>
        </div>
        <div className="mt-stat">
          <span className="mt-stat-value">{fmtNum(totalLikes)}</span>
          <span className="mt-stat-label">Likes</span>
        </div>
      </div>

      {/* ── Filter tabs ── */}
      <div className="mt-filters">
        {FILTERS.map((f) => {
          const count =
            f.id === "all"      ? items.length :
            f.id === "approved" ? approvedCount :
            pendingCount;
          return (
            <button
              key={f.id}
              className={`mt-filter-btn${filter === f.id ? " active" : ""}`}
              onClick={() => setFilter(f.id)}
            >
              {f.label}
              <span className="mt-filter-count">{count}</span>
            </button>
          );
        })}
      </div>

      {/* ── Card list ── */}
      <div className="mt-list">
        {filtered.length === 0 ? (
          <div className="mt-empty">
            <div className="mt-empty-icon">✦</div>
            <h3>Nothing here yet</h3>
            <p>
              {filter === "pending"
                ? "You have no testimonies pending review."
                : "You haven't shared a testimony yet. God has done something — tell it."}
            </p>
          </div>
        ) : (
          filtered.map((t, i) => (
            <div key={t.id} style={{ animationDelay: `${i * 0.06}s` }}>
              <TestimonyCard
                testimony={t}
                onDelete={handleDelete}
                onShare={handleShare}
              />
            </div>
          ))
        )}
      </div>

      {/* ── FAB ── */}
      <button
        className="mt-fab"
        onClick={() => navigate("/upload")}
        aria-label="Share a new testimony"
      >
        <Plus size={16} />
        Share New
      </button>

      <BottomNav />
    </div>
  );
}