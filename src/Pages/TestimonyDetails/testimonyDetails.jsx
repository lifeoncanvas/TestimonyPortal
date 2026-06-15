/**
 * TestimonyDetails.jsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Route:   /testimony/:id
 * Purpose: Full detail view of a single testimony.
 *
 * Layout (mobile):  Stacked — Hero banner → scrollable body content
 * Layout (desktop): Hero full-width → two-column body (main content | sidebar)
 *
 * Sections inside this file:
 *   1. Imports
 *   2. Mock data  (swap with real API calls when backend is ready)
 *   3. State declarations
 *   4. Handlers   (bless, miracle, prayer, comment, share)
 *   5. JSX render
 *      ├── Hero banner (background + audio player)
 *      ├── Body wrapper (becomes 2-col grid on desktop)
 *      │   ├── Meta row (category badge + date)
 *      │   ├── Title
 *      │   ├── Author card
 *      │   ├── Testimony text (collapsible, with pull-quote)
 *      │   ├── Engagement bar (Bless · Comment · Share · Same Miracle)
 *      │   ├── Prayer button
 *      │   ├── Comments section (input + list + replies)
 *      │   └── Related testimonies (sidebar on desktop, horizontal scroll on mobile)
 *      └── Toast notification (bottom pop-up feedback)
 * ─────────────────────────────────────────────────────────────────────────────
 */

// ─── 1. IMPORTS ──────────────────────────────────────────────────────────────
import React, { useState, useRef, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ChevronLeft, Play, Pause,
  Heart, MessageCircle, Share2, Sparkles, Flame, Send,
} from "lucide-react";
import BottomNav from "../../Sections/BottomNav/BottomNav";
import "./styles.css";


// ─── 2. MOCK DATA ─────────────────────────────────────────────────────────────
// TODO: Replace getTestimony() with  GET /api/testimonies/:id
// TODO: Replace COMMENTS            with  GET /api/testimonies/:id/comments
// TODO: Replace RELATED             with  GET /api/testimonies?categoryId=x

/**
 * Testimony objects keyed by ID.
 * Falls back to "default" when no match is found (useful during dev).
 */
const TESTIMONY_MAP = {
  default: {
    id: "t001",
    category: "Healing",
    date: "June 3, 2025",
    title: "Doctors Said It Was Impossible — But God Had the Final Word",
    // mediaType: "audio" | "video" | null (null hides the player)
    mediaType: "audio",
    mediaSrc: null, // TODO: real URL from API e.g. "https://cdn.../file.mp3"
    author: {
      initials: "SM",
      name: "Sister Mary Okonkwo",
      church: "Redemption Chapel",
      location: "Lagos, Nigeria",
    },
    // body is an array of paragraphs — first 2 are shown collapsed, rest revealed on "Read more"
    body: [
      `In February of last year, I was admitted to Lagos University Teaching Hospital with a diagnosis that changed everything I thought I knew about my future. The doctors used words like "irreversible" and "chronic." My husband sat beside my bed for three days without sleeping.`,
      `My church family began a three-day dry fast on my behalf. I didn't know this until later — they simply gathered and prayed. On the morning of the third day, something shifted inside me. I felt it before the nurses did. A warmth. A lightness I had not known in months.`,
      `When the specialist came in that afternoon for the routine check, he reviewed my scans, then stepped out, then came back in again. He did this three times. Finally he said, very quietly: "I don't have a medical explanation for what I'm seeing." My husband and I held hands and wept. We knew exactly what had happened.`,
      `Today I stand before you completely whole. Not managed. Not maintained. Whole. I want you to know that the God who was faithful then is faithful now. Whatever your report says, He has the final word.`,
    ],
    // pullQuote is rendered as a styled blockquote after the first paragraph
    pullQuote: "I told the Lord — if you can raise Lazarus, you can raise me. And He did.",
    // stats come from the backend — used as the initial count before user interactions
    stats: { bless: 2847, comments: 134, miracle: 408 },
  },
};

/** Returns testimony by id, or falls back to the default mock */
function getTestimony(id) {
  return TESTIMONY_MAP[id] || { ...TESTIMONY_MAP.default, id };
}

/**
 * Mock comments list.
 * Shape: { id, initials, color, name, time, text, likes, replies[] }
 * TODO: Replace with GET /api/testimonies/:id/comments
 */
const COMMENTS = [
  {
    id: "c1",
    initials: "BT",
    color: "#ece4da",
    name: "Brother Taiwo",
    time: "2d ago",
    text: "This brought me to tears. My own wife is facing a similar diagnosis right now. Holding onto this testimony.",
    likes: 84,
    replies: [
      {
        id: "r1",
        initials: "SM",
        color: "#c9a96e",
        name: "Sister Mary Okonkwo",
        text: "Brother Taiwo, I am standing with you in prayer right now. Do not let go. He is faithful.",
      },
    ],
  },
  {
    id: "c2",
    initials: "PJ",
    color: "#dcccf4",
    name: "Pastor Joshua A.",
    time: "3d ago",
    text: "Shared this in our Sunday service. The whole congregation was on their feet. Glory to God!",
    likes: 201,
    replies: [],
  },
  {
    id: "c3",
    initials: "GR",
    color: "#e8f4ec",
    textColor: "#2a7a4b",
    name: "Grace from Abuja",
    time: "5d ago",
    text: "The part about the three-day fast — that's exactly what my family did for my father last year. God is the same yesterday, today, forever.",
    likes: 56,
    replies: [],
  },
];

/**
 * Mock related testimonies shown in the sidebar (desktop) or horizontal scroll (mobile).
 * TODO: Replace with GET /api/testimonies?categoryId=x
 */
const RELATED = [
  { id: "t005", thumb: "navy",   title: "From the Operating Table to Full Recovery", author: "Daniel E. • Nairobi",   mediaType: "audio" },
  { id: "t015", thumb: "forest", title: "Six Years of Barrenness — Then Two Sons",   author: "Priscilla M. • Accra", mediaType: "text"  },
  { id: "t010", thumb: "plum",   title: "The Accident That Became a Miracle",         author: "Emmanuel K. • London", mediaType: "text"  },
];

/** Gradient backgrounds for related testimony thumbnails, keyed by theme name */
const THUMB_COLORS = {
  navy:   "linear-gradient(135deg,#1a3a6b,#365fa3)",
  forest: "linear-gradient(135deg,#2a4a1f,#4a8032)",
  plum:   "linear-gradient(135deg,#4a1a2a,#8a3050)",
};


// ─── 3. MAIN COMPONENT ────────────────────────────────────────────────────────
export default function TestimonyDetail() {
  const navigate = useNavigate();

  // :id comes from the URL — e.g. /testimony/t001
  const { id } = useParams();
  const testimony = getTestimony(id);

  // ── Audio player state ──────────────────────────────────────────────────────
  // playing:     whether the simulated audio is currently playing
  // progress:    0–100 percentage of audio played
  // intervalRef: holds the setInterval reference so we can clear it on pause/unmount
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(35); // starts at 35% for demo purposes
  const intervalRef = useRef(null);

  // ── Engagement state ────────────────────────────────────────────────────────
  // blessed/miracled are toggles — count adjusts optimistically (no server round-trip yet)
  // TODO: Wire up POST /api/testimonies/:id/like and POST /api/testimonies/:id/same-miracle
  const [blessed,      setBlessed]      = useState(false);
  const [blessCount,   setBlessCount]   = useState(testimony.stats.bless);
  const [miracled,     setMiracled]     = useState(false);
  const [miracleCount, setMiracleCount] = useState(testimony.stats.miracle);

  // prayerJoined: one-time action — button becomes disabled after first tap
  // TODO: Wire up POST /api/testimonies/:id/pray
  const [prayerJoined, setPrayerJoined] = useState(false);

  // ── Read-more state ─────────────────────────────────────────────────────────
  // When collapsed, only the first 2 paragraphs of testimony.body are shown
  const [expanded, setExpanded] = useState(false);

  // ── Comment state ───────────────────────────────────────────────────────────
  // localComments: starts with mock data, new comments are prepended optimistically
  // TODO: Wire up POST /api/testimonies/:id/comments
  const [commentText,   setCommentText]   = useState("");
  const [localComments, setLocalComments] = useState(COMMENTS);
  const commentInputRef = useRef(null); // used to scroll/focus input when "Comment" btn is tapped

  // ── Toast state ─────────────────────────────────────────────────────────────
  // A small non-blocking notification that appears at the bottom of the screen
  const [toast, setToast] = useState({ show: false, msg: "" });
  const toastTimer = useRef(null);


  // ─── 4. HANDLERS ───────────────────────────────────────────────────────────

  /** Shows a bottom toast message that auto-dismisses after 2.2s */
  function showToast(msg) {
    clearTimeout(toastTimer.current);
    setToast({ show: true, msg });
    toastTimer.current = setTimeout(
      () => setToast({ show: false, msg: "" }),
      2200
    );
  }

  /**
   * Simulates audio playback by incrementing progress every 300ms.
   * Stops and resets playing state when progress reaches 100.
   * TODO: Replace with a real <audio> element or audio library when mediaSrc is available.
   */
  useEffect(() => {
    if (playing) {
      intervalRef.current = setInterval(() => {
        setProgress((p) => {
          if (p >= 100) {
            clearInterval(intervalRef.current);
            setPlaying(false);
            return 100;
          }
          return p + 0.3;
        });
      }, 300);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current); // cleanup on unmount
  }, [playing]);

  /**
   * Converts a 0–100 progress percentage to a MM:SS time string.
   * Assumes total audio length is 398 seconds (6:38).
   * TODO: Use actual audio duration from the media element.
   */
  function formatTime(pct) {
    const total = 398;
    const secs  = Math.floor((total * pct) / 100);
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  }

  /** Toggles the "Bless" reaction — optimistic UI, count adjusts immediately */
  function handleBless() {
    setBlessed((b) => !b);
    setBlessCount((c) => (blessed ? c - 1 : c + 1));
    if (!blessed) showToast("Blessed this testimony ♥");
    // TODO: if (!blessed) POST /api/testimonies/:id/like
    // TODO: else          DELETE /api/testimonies/:id/like
  }

  /** Toggles the "Same Miracle" reaction — optimistic UI */
  function handleMiracle() {
    setMiracled((m) => !m);
    setMiracleCount((c) => (miracled ? c - 1 : c + 1));
    if (!miracled) showToast("Standing in faith for the same miracle ✨");
    // TODO: POST /api/testimonies/:id/same-miracle
  }

  /** One-time prayer join — button is disabled after first tap */
  function handlePrayer() {
    setPrayerJoined(true);
    showToast("🙏 You have joined in prayer for this person");
    // TODO: POST /api/testimonies/:id/pray
  }

  /**
   * Adds a new comment to the top of the list optimistically.
   * Triggered by pressing Enter or clicking the send button.
   * TODO: POST /api/testimonies/:id/comments  { text: commentText }
   */
  function handleSend() {
    if (!commentText.trim()) return;
    const newComment = {
      id:       `c${Date.now()}`,
      initials: "Y",
      color:    "#e8d5b0",
      name:     "You",
      time:     "Just now",
      text:     commentText.trim(),
      likes:    0,
      replies:  [],
    };
    setLocalComments((prev) => [newComment, ...prev]);
    setCommentText("");
    showToast("Comment posted");
  }

  /** Scrolls the comment input into view and focuses it */
  function focusComment() {
    commentInputRef.current?.focus();
    commentInputRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  // Only show first 2 paragraphs when collapsed
  const visibleBody = expanded ? testimony.body : testimony.body.slice(0, 2);


  // ─── 5. RENDER ─────────────────────────────────────────────────────────────
  return (
    <div className="td-page">

      {/*
        ════════════════════════════════════════════════════════
        HERO BANNER
        ════════════════════════════════════════════════════════
        Full-width dark blue banner at the top of the page.
        Contains:
          - Decorative gold glow overlay
          - Decorative cross symbol (purely visual)
          - Back button (navigates to previous page)
          - Audio/Video player (play button + progress bar)
            Only shown if testimony.mediaType is not null.
      */}
      <div className="td-hero">

        {/* Soft radial gold glow for depth — purely decorative */}
        <div className="td-hero-glow" />

        {/* Large faint cross in the top-right corner — decorative watermark */}
        <span className="td-hero-cross" aria-hidden="true">✝</span>

        {/* Back button — returns to the previous page in history */}
        <button
          className="td-back"
          onClick={() => navigate(-1)}
          aria-label="Go back"
        >
          <ChevronLeft size={20} />
        </button>

        {/* Media player — only rendered when the testimony has audio or video */}
        {testimony.mediaType && (
          <div className="td-player-center">

            {/* Small label above the play button — "Audio Testimony" or "Video Testimony" */}
            <span className="td-media-label">
              {testimony.mediaType === "audio" ? "Audio Testimony" : "Video Testimony"}
            </span>

            {/* Play / Pause toggle button */}
            <button
              className="td-play-btn"
              onClick={() => setPlaying((p) => !p)}
              aria-label={playing ? "Pause" : "Play"}
            >
              {playing
                ? <Pause size={26} />
                : <Play  size={26} style={{ marginLeft: 3 }} />
              }
            </button>

            {/* Progress bar + elapsed / total time display */}
            <div className="td-progress-wrap">
              <div className="td-progress-track">
                <div className="td-progress-fill" style={{ width: `${progress}%` }} />
              </div>
              <div className="td-progress-times">
                <span>{formatTime(progress)}</span>
                <span>6:38</span>
              </div>
            </div>

          </div>
        )}
      </div>


      {/*
        ════════════════════════════════════════════════════════
        BODY WRAPPER
        ════════════════════════════════════════════════════════
        On mobile:  single column, padded container.
        On desktop: CSS grid — left column (main content) + right column (related sidebar).
        See styles.css @media (min-width: 1024px) for the grid setup.
      */}
      <div className="td-body">

        {/*
          ── META ROW ───────────────────────────────────────────
          Category badge (e.g. "Healing") + publication date.
          Sits directly above the title.
        */}
        <div className="td-meta-row">
          <span className="td-badge">{testimony.category}</span>
          <span className="td-date">{testimony.date}</span>
        </div>

        {/* ── TITLE ─────────────────────────────────────────── */}
        <h1 className="td-title">{testimony.title}</h1>

        {/*
          ── AUTHOR CARD ────────────────────────────────────────
          Shows author avatar (initials), name, church & location,
          and a "Follow" button.
          TODO: Follow button should call POST /api/users/:id/follow
        */}
        <div className="td-author">
          <div className="td-avatar">{testimony.author.initials}</div>
          <div className="td-author-info">
            <p className="td-author-name">{testimony.author.name}</p>
            <p className="td-author-sub">
              {testimony.author.church} • {testimony.author.location}
            </p>
          </div>
          <button
            className="td-follow-btn"
            onClick={() => showToast(`Following ${testimony.author.name}`)}
          >
            Follow
          </button>
        </div>

        {/* Thin horizontal rule used between major sections */}
        <div className="td-divider" />

        {/*
          ── TESTIMONY TEXT ─────────────────────────────────────
          Renders the body paragraphs from the testimony object.
          - Only the first 2 paragraphs are shown when collapsed.
          - A pull-quote blockquote is injected after the first paragraph.
          - A fade-out gradient masks the cut-off text when collapsed.
          - "Read full testimony" button toggles expanded state.
        */}
        <div className="td-text">
          {visibleBody.map((para, i) => (
            <React.Fragment key={i}>
              <p>{para}</p>
              {/* Pull-quote appears only after the very first paragraph */}
              {i === 0 && (
                <blockquote className="td-pullquote">
                  "{testimony.pullQuote}"
                </blockquote>
              )}
            </React.Fragment>
          ))}

          {/* Gradient fade shown only when text is collapsed and there are hidden paragraphs */}
          {!expanded && testimony.body.length > 2 && (
            <div className="td-fade-out" />
          )}
        </div>

        {/* Toggle button — expands or collapses the testimony body */}
        <button
          className="td-read-more"
          onClick={() => setExpanded((e) => !e)}
        >
          {expanded ? "Show less ↑" : "Read full testimony ↓"}
        </button>

        <div className="td-divider" />

        {/*
          ── ENGAGEMENT BAR ─────────────────────────────────────
          Four action buttons in a horizontal pill-style row:
            1. Bless      — toggleable like/heart (POST /api/testimonies/:id/like)
            2. Comment    — scrolls to the comment input
            3. Share      — native share or clipboard (frontend only)
            4. Same Miracle — toggleable reaction (POST /api/testimonies/:id/same-miracle)
          Active states change the icon colour (red for bless, green for miracle).
        */}
        <div className="td-engage">

          {/* Bless button — turns red when active */}
          <button
            className={`td-eng-btn${blessed ? " td-blessed" : ""}`}
            onClick={handleBless}
            aria-label="Bless"
          >
            <Heart size={20} fill={blessed ? "#c0392b" : "none"} />
            <span className="td-eng-count">{blessCount.toLocaleString()}</span>
            <span className="td-eng-label">Bless</span>
          </button>

          {/* Comment button — jumps to comment input on click */}
          <button className="td-eng-btn" onClick={focusComment} aria-label="Comment">
            <MessageCircle size={20} />
            {/* Total = server count + any locally added comments */}
            <span className="td-eng-count">
              {localComments.length + testimony.stats.comments}
            </span>
            <span className="td-eng-label">Comment</span>
          </button>

          {/* Share button — frontend only, uses native share API if available */}
          <button
            className="td-eng-btn"
            onClick={() => showToast("Sharing testimony...")}
            aria-label="Share"
          >
            <Share2 size={20} />
            <span className="td-eng-count">Share</span>
            <span className="td-eng-label">Spread</span>
          </button>

          {/* Same Miracle button — turns green when active */}
          <button
            className={`td-eng-btn${miracled ? " td-miracled" : ""}`}
            onClick={handleMiracle}
            aria-label="Same Miracle"
          >
            <Sparkles size={20} />
            <span className="td-eng-count">{miracleCount.toLocaleString()}</span>
            <span className="td-eng-label">Same Miracle</span>
          </button>

        </div>

        {/*
          ── PRAYER BUTTON ──────────────────────────────────────
          Full-width CTA button below the engagement bar.
          - First tap: joins prayer, changes to a confirmation state, becomes disabled.
          - Background turns green after joining.
          TODO: POST /api/testimonies/:id/pray  on first tap
        */}
        <button
          className={`td-prayer-btn${prayerJoined ? " td-prayer-joined" : ""}`}
          onClick={handlePrayer}
          disabled={prayerJoined}
        >
          <Flame size={18} />
          {prayerJoined
            ? "Praying for this Person ✓"
            : "Join in Prayer for this Person"
          }
        </button>

        <div className="td-divider" />

        {/*
          ── COMMENTS SECTION ───────────────────────────────────
          Title shows total comment count (server count + local additions).
          Followed by the comment input, then the list of comments.
        */}
        <h2 className="td-section-title">
          {localComments.length + testimony.stats.comments} Comments
        </h2>

        {/*
          Comment input row:
          - Avatar placeholder "Y" for the current user
          - Text input — submits on Enter key or send button
          - Send button
          TODO: On submit → POST /api/testimonies/:id/comments { text }
        */}
        <div className="td-comment-input-row">
          <div className="td-c-avatar" style={{ background: "#e8d5b0" }}>Y</div>
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
        </div>

        {/*
          Comment list — renders each comment with:
            - Avatar (coloured circle with initials)
            - Name + timestamp
            - Comment text
            - Like + Reply action buttons
            - Nested replies (one level deep)
          TODO: Like  → POST /api/comments/:id/like
          TODO: Reply → POST /api/comments/:id/reply
          TODO: Delete (own comments) → DELETE /api/comments/:id
        */}
        {localComments.map((c) => (
          <div className="td-comment" key={c.id}>

            {/* Comment header: avatar + author name + time */}
            <div className="td-comment-header">
              <div
                className="td-c-avatar"
                style={{ background: c.color, color: c.textColor || "#0f2447" }}
              >
                {c.initials}
              </div>
              <span className="td-c-name">{c.name}</span>
              <span className="td-c-time">{c.time}</span>
            </div>

            {/* Comment body text */}
            <p className="td-c-text">{c.text}</p>

            {/* Like and Reply actions */}
            <div className="td-c-actions">
              <button className="td-c-act" onClick={() => showToast("Liked!")}>
                <Heart size={12} /> {c.likes > 0 ? c.likes : ""}
              </button>
              <button
                className="td-c-act"
                onClick={() => showToast("Reply box coming soon")}
              >
                Reply
              </button>
            </div>

            {/* Nested replies — one level deep only */}
            {c.replies.map((r) => (
              <div className="td-reply" key={r.id}>
                <div className="td-reply-header">
                  <div className="td-r-avatar" style={{ background: r.color }}>
                    {r.initials}
                  </div>
                  <span className="td-r-name">{r.name}</span>
                </div>
                <p className="td-r-text">{r.text}</p>
              </div>
            ))}

          </div>
        ))}

        <div className="td-divider" />

        {/*
          ── RELATED TESTIMONIES ────────────────────────────────
          Mobile:  horizontal scroll row of cards
          Desktop: vertical stack in the right sidebar column
                   (CSS grid places .td-related-section in column 2,
                    spanning all rows, sticky at top)

          Each card shows a gradient thumbnail, title, and author.
          Clicking navigates to that testimony's detail page.

          TODO: Replace RELATED array with GET /api/testimonies?categoryId=x
        */}
        <div className="td-related-section">
          <h2 className="td-section-title">Related Testimonies</h2>
          <div className="td-related-scroll">
            {RELATED.map((item) => (
              <div
                className="td-related-card"
                key={item.id}
                onClick={() => navigate(`/testimony/${item.id}`)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) =>
                  e.key === "Enter" && navigate(`/testimony/${item.id}`)
                }
              >
                {/* Gradient thumbnail — shows play icon for audio testimonies */}
                <div
                  className="td-r-thumb"
                  style={{ background: THUMB_COLORS[item.thumb] }}
                >
                  {item.mediaType === "audio"
                    ? <Play size={20} color="rgba(255,255,255,0.7)" />
                    : null
                  }
                </div>
                <p className="td-r-title">{item.title}</p>
                <p className="td-r-author">{item.author}</p>
              </div>
            ))}
          </div>
        </div>

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
