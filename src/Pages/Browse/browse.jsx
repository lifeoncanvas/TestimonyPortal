import React from "react";
import { useNavigate } from "react-router-dom";
import "./styles.css";
import BottomNav from "../../Sections/BottomNav/BottomNav";
import { Search, ChevronLeft, Eye, Heart, Play, BookOpen, Clock } from "lucide-react";

// ─── Category gradient map ────────────────────────────────────────────────────
// Each category gets its own cover gradient so poster cards feel like
// distinct "albums" rather than identical coloured boxes.
const CAT_GRADIENTS = {
  Healing:      "linear-gradient(145deg, #1a1a4b 0%, #3a2a7b 50%, #6a3a9b 100%)",
  Provision:    "linear-gradient(145deg, #1a3a1a 0%, #2a6b3a 50%, #4a9b5a 100%)",
  Marriage:     "linear-gradient(145deg, #4b1a2a 0%, #8a2a4a 50%, #c94a7a 100%)",
  Salvation:    "linear-gradient(145deg, #1a2a4b 0%, #0f2447 50%, #2a5298 100%)",
  Deliverance:  "linear-gradient(145deg, #3a1a0a 0%, #7a3a1a 50%, #c97a3a 100%)",
  Restoration:  "linear-gradient(145deg, #1a3a3a 0%, #2a6b6b 50%, #4a9b9b 100%)",
  Faith:        "linear-gradient(145deg, #3a2a1a 0%, #7a5a2a 50%, #c9a96e 100%)",
  All:          "linear-gradient(145deg, #0f2447 0%, #1a3a6b 50%, #2a5298 100%)",
};

const getCatGradient = (cat) => CAT_GRADIENTS[cat] || CAT_GRADIENTS.All;

// Feed thumbnail gradients (per-item variety)
const FEED_GRADIENTS = [
  "linear-gradient(135deg, #dcccf4, #a07ac8)",
  "linear-gradient(135deg, #f3d8c4, #c97a3a)",
  "linear-gradient(135deg, #ccf4d4, #3a9b5a)",
  "linear-gradient(135deg, #f4cccc, #c83a3a)",
];

// ─── Tag colour map ───────────────────────────────────────────────────────────
const TAG_STYLES = {
  Healing:     { bg: "#dcccf4", color: "#5a3d8a" },
  Provision:   { bg: "#d4f0de", color: "#2a6b3a" },
  Marriage:    { bg: "#f3d8e4", color: "#8a3a5a" },
  Salvation:   { bg: "#d4e4f0", color: "#2a4a8a" },
  Deliverance: { bg: "#f6d7be", color: "#8a5a2a" },
  Restoration: { bg: "#d4f0ee", color: "#2a6b6a" },
  Faith:       { bg: "#e8d5b0", color: "#6b4a1a" },
};
const getTagStyle = (cat) => TAG_STYLES[cat] || { bg: "#e8d5b0", color: "#6b4a1a" };

// ─── Data ─────────────────────────────────────────────────────────────────────
const CATEGORIES = [
  "All", "Healing", "Provision", "Marriage",
  "Salvation", "Deliverance", "Restoration",
];

const TESTIMONY_ROWS = [
  {
    title: "Healing Testimonies",
    category: "Healing",
    items: [
      { id: "t005", title: "Miracle Healing — What the Doctors Couldn't Explain", author: "Sarah M", location: "Lagos", views: "2.4K", likes: 320 },
      { id: "t006", title: "Cancer Reversed Overnight After Prayer", author: "James K", location: "Accra", views: "5.1K", likes: 887 },
      { id: "t007", title: "Blind Eye Opened in the Service", author: "Esther A", location: "Abuja", views: "3.8K", likes: 612 },
      { id: "t008", title: "Risen from the Sickbed — a Doctor's Report", author: "Paul O", location: "London", views: "1.9K", likes: 244 },
    ],
  },
  {
    title: "Financial Breakthroughs",
    category: "Provision",
    items: [
      { id: "t009", title: "Debt Wiped Clean in 30 Days", author: "Miriam T", location: "Lagos", views: "4.2K", likes: 540 },
      { id: "t010", title: "Business Restored After Total Loss", author: "Daniel E", location: "Nairobi", views: "2.7K", likes: 389 },
      { id: "t011", title: "Job Offer in 24 Hours of Prayer", author: "Ruth N", location: "Kampala", views: "1.6K", likes: 201 },
      { id: "t012", title: "A House from Nothing — Supernatural Provision", author: "Samuel B", location: "Accra", views: "3.0K", likes: 415 },
    ],
  },
  {
    title: "Marriage & Family",
    category: "Marriage",
    items: [
      { id: "t013", title: "Divorce Papers Torn Up — We Are One Again", author: "Grace & Emeka", location: "Lagos", views: "6.8K", likes: 1420 },
      { id: "t014", title: "The Prodigal Son Returned — A Father's Testimony", author: "Pastor John A", location: "Ibadan", views: "3.3K", likes: 611 },
      { id: "t015", title: "After 10 Years of Waiting — Pregnant!", author: "Priscilla M", location: "Accra", views: "8.2K", likes: 2140 },
      { id: "t016", title: "My Family Is Whole Again", author: "Joy F", location: "London", views: "2.1K", likes: 389 },
    ],
  },
];

const RECENT_FEED = [
  { id: "f001", title: "God Restored My Family After I Lost Everything", category: "Restoration", location: "London", readTime: "5 min read", gradient: FEED_GRADIENTS[0] },
  { id: "f002", title: "Provision in the Desert — He Never Failed Me", category: "Provision",   location: "Nairobi", readTime: "3 min read", gradient: FEED_GRADIENTS[1] },
  { id: "f003", title: "Set Free from 14 Years of Addiction", category: "Deliverance", location: "Lagos",   readTime: "7 min read", gradient: FEED_GRADIENTS[2] },
  { id: "f004", title: "My Marriage Was Dead on Paper. God Wrote a New Story.", category: "Marriage", location: "Accra", readTime: "4 min read", gradient: FEED_GRADIENTS[3] },
];

// ─── Components ───────────────────────────────────────────────────────────────

// Poster Card — tall portrait card with title overlaid on a gradient cover
function PosterCard({ item, category, navigate }) {
  return (
    <div
      className="poster-card"
      onClick={() => navigate(`/testimony/${item.id}`)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && navigate(`/testimony/${item.id}`)}
      aria-label={item.title}
    >
      <div className="poster-thumb" style={{ background: getCatGradient(category) }}>
        <div className="poster-scrim" />
        {category && (
          <span className="poster-badge">{category}</span>
        )}
        <div className="poster-title-overlay">
          <h4>{item.title}</h4>
        </div>
      </div>

      <div className="poster-meta">
        <span className="poster-author">{item.author} · {item.location}</span>
        <div className="poster-stats">
          <span><Eye size={11} /> {item.views}</span>
          <span><Heart size={11} /> {item.likes}</span>
        </div>
      </div>
    </div>
  );
}

// Feed Row Card — horizontal card with thumbnail, tag, title, meta
function FeedCard({ item, navigate }) {
  const tagStyle = getTagStyle(item.category);
  return (
    <div
      className="feed-card"
      onClick={() => navigate(`/testimony/${item.id}`)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && navigate(`/testimony/${item.id}`)}
      aria-label={item.title}
    >
      <div className="feed-thumb" style={{ background: item.gradient }}>
        <div className="feed-thumb-scrim" />
        <div className="feed-thumb-icon"><BookOpen size={20} /></div>
      </div>

      <div className="feed-body">
        <span
          className="feed-tag"
          style={{ background: tagStyle.bg, color: tagStyle.color }}
        >
          {item.category}
        </span>
        <h4 className="feed-title">{item.title}</h4>
        <div className="feed-foot">
          <span>{item.location}</span>
          <span className="feed-foot-divider">·</span>
          <span className="feed-foot-time">
            <Clock size={10} /> {item.readTime}
          </span>
        </div>
      </div>
    </div>
  );
}

// ─── Browse page ──────────────────────────────────────────────────────────────
const Browse = () => {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = React.useState("All");
  const [query, setQuery] = React.useState("");

  // Filter rows + feed by active category + search query
  const filteredRows = TESTIMONY_ROWS.filter(
    (row) => activeCategory === "All" || row.category === activeCategory
  ).map((row) => ({
    ...row,
    items: query.trim()
      ? row.items.filter((i) => i.title.toLowerCase().includes(query.toLowerCase()))
      : row.items,
  })).filter((row) => row.items.length > 0);

  const filteredFeed = RECENT_FEED.filter(
    (item) =>
      (activeCategory === "All" || item.category === activeCategory) &&
      (!query.trim() || item.title.toLowerCase().includes(query.toLowerCase()))
  );

  return (
    <div className="browse-page">

      {/* ── HEADER ── */}
      <header className="browse-header">
        <button className="browse-back" onClick={() => navigate(-1)} aria-label="Go back">
          <ChevronLeft size={20} />
        </button>
        <h1>Browse Testimonies</h1>
        <button
          className="browse-search-icon"
          aria-label="Focus search"
          onClick={() => document.querySelector(".browse-search input")?.focus()}
        >
          <Search size={18} />
        </button>
      </header>

      {/* ── SEARCH + FILTERS (wrapped in a div on desktop for inline layout) ── */}
      <div className="browse-top-controls">
        <div className="browse-search">
          <Search size={15} />
          <input
            placeholder="Search miracles, healing, salvation…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        <div className="browse-filters">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              className={cat === activeCategory ? "active" : ""}
              onClick={() => setActiveCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* ── FEATURED HERO ── */}
      <div
        className="browse-featured"
        onClick={() => navigate("/testimony/t001")}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === "Enter" && navigate("/testimony/t001")}
        aria-label="Featured: Doctors Said It Was Impossible"
      >
        {/* decorative handled by CSS ::before */}
        <div className="featured-scrim" />

        <div className="featured-play-btn" aria-hidden="true">
          <Play size={22} fill="currentColor" />
        </div>

        <div className="featured-overlay">
          <p className="featured-eyebrow">Featured Story</p>
          <h2>"Doctors Said It Was Impossible — But God Had the Final Word"</h2>
          <div className="featured-meta">
            <span>Sister Mary Okonkwo</span>
            <span className="featured-meta-divider">·</span>
            <span>Lagos, Nigeria</span>
            <span className="featured-meta-divider">·</span>
            <span>Healing</span>
          </div>
        </div>
      </div>

      {/* ── OTT ROWS ── */}
      {filteredRows.map((row) => (
        <section key={row.title} className="browse-section">
          <div className="section-header">
            <h3>{row.title}</h3>
            <button
              className="section-see-all"
              onClick={() => navigate("/browse")}
            >
              See all →
            </button>
          </div>

          <div className="row-scroll">
            {row.items.map((item) => (
              <PosterCard
                key={item.id}
                item={item}
                category={row.category}
                navigate={navigate}
              />
            ))}
          </div>
        </section>
      ))}

      {/* ── RECENT FEED ── */}
      {filteredFeed.length > 0 && (
        <section className="recent-feed">
          <div className="section-header recent-feed-header">
            <h3>Recent Uploads</h3>
          </div>

          {filteredFeed.map((item) => (
            <FeedCard key={item.id} item={item} navigate={navigate} />
          ))}
        </section>
      )}

      <BottomNav />
    </div>
  );
};

export default Browse;