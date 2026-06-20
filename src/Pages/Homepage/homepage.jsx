// Homepage.jsx
import { useState, useMemo } from "react";
import { useNavigate } from "react-router";
import BottomNav from "../../Sections/BottomNav/BottomNav";
import "./styles.css";

function useIsLoggedIn() {
  const token = localStorage.getItem("token");
  return !!token;
}

// ─── NEW CATEGORIES ──────────────────────────────────────────
const CATEGORIES = [
  { label: "All Stories",              key: "all" },
  { label: "Healing Streams",          key: "healing-streams" },
  { label: "Partnership",              key: "partnership" },
  { label: "Healing to the Nations",   key: "healing-nations" },
  { label: "Magazines",                key: "magazines" },
  { label: "Prayer Clouds",            key: "prayer-clouds" },
  { label: "Crusades",                 key: "crusades" },
  { label: "Pray with Me",             key: "pray-with-me" },
  { label: "Heralds",                  key: "heralds" },
];

// Category grid items (sidebar + mobile grid)
const CAT_GRID = [
  { emoji: "💧", label: "Healing Streams",        bg: "#dcccf4", key: "healing-streams" },
  { emoji: "🤝", label: "Partnership",            bg: "#f6d7be", key: "partnership" },
  { emoji: "🌍", label: "Healing to the Nations", bg: "#d4e8d4", key: "healing-nations" },
  { emoji: "📖", label: "Magazines",              bg: "#e8d5b0", key: "magazines" },
  { emoji: "☁️", label: "Prayer Clouds",           bg: "#e0f0f8", key: "prayer-clouds" },
  { emoji: "🔥", label: "Crusades",               bg: "#ffe4d4", key: "crusades" },
  { emoji: "🙏", label: "Pray with Me",           bg: "#f3d8e4", key: "pray-with-me" },
  { emoji: "📯", label: "Heralds",                bg: "#fef3c7", key: "heralds" },
];

// ─── TRENDING CARDS ──────────────────────────────────────────
const TRENDING = [
  {
    id: "t001",
    img: "https://images.unsplash.com/photo-1504439468489-c8920d796a29?w=800&q=80",
    overlay: "linear-gradient(160deg,rgba(15,36,71,0.72) 0%,rgba(42,82,152,0.55) 100%)",
    title: "Doctors gave me 3 months — God had other plans",
    meta: "Sarah M. · Lagos", views: "2.4K",
    categoryKey: "healing-streams", categoryLabel: "Healing Streams",
  },
  {
    id: "t002",
    img: "https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=800&q=80",
    overlay: "linear-gradient(160deg,rgba(90,61,138,0.72) 0%,rgba(200,181,240,0.45) 100%)",
    title: "Our partnership sowed seeds across three nations",
    meta: "Emmanuel K. · Accra", views: "1.8K",
    categoryKey: "partnership", categoryLabel: "Partnership",
  },
  {
    id: "t003",
    img: "https://images.unsplash.com/photo-1559757175-0eb30cd8c063?w=800&q=80",
    overlay: "linear-gradient(160deg,rgba(107,74,26,0.75) 0%,rgba(232,213,176,0.45) 100%)",
    title: "The crusade that shook Abuja — thousands healed",
    meta: "Pastor Ade · Abuja", views: "3.1K",
    categoryKey: "crusades", categoryLabel: "Crusades",
  },
  {
    id: "t004",
    img: "https://images.unsplash.com/photo-1511895426328-dc8714191011?w=800&q=80",
    overlay: "linear-gradient(160deg,rgba(42,107,58,0.72) 0%,rgba(184,217,184,0.45) 100%)",
    title: "Healing reached the ends of the earth through our prayer cloud",
    meta: "Grace O. · London", views: "4.5K",
    categoryKey: "prayer-clouds", categoryLabel: "Prayer Clouds",
  },
];

// ─── STORY CARDS ─────────────────────────────────────────────
const ALL_STORIES = [
  {
    id: "s001",
    img: "https://images.unsplash.com/photo-1516574187841-cb9cc2ca948b?w=600&q=80",
    tag: "Healing Streams", tagBg: "#dcccf4", tagColor: "#5a3d8a",
    categoryKey: "healing-streams",
    title: "Lost my sight — saw clearly after the healing stream",
    author: "Joy A.", location: "Ibadan",
    likes: 241, readTime: "4 min", wide: false,
  },
  {
    id: "s002",
    img: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=600&q=80",
    tag: "Partnership", tagBg: "#f6d7be", tagColor: "#8a5a2a",
    categoryKey: "partnership",
    title: "Our giving opened a new mission field in Kenya",
    author: "Kemi O.", location: "Birmingham",
    likes: 188, readTime: "3 min", wide: false,
  },
  {
    id: "s003",
    img: "https://images.unsplash.com/photo-1581579438747-1dc8d17bbce4?w=600&q=80",
    tag: "Prayer Clouds",  tagBg: "#e0f0f8", tagColor: "#1a5a7a",
    categoryKey: "prayer-clouds",
    title: "The prayer cloud lifted every burden we carried",
    author: "Peter N.", location: "Enugu",
    likes: 312, readTime: "5 min", wide: false,
  },
  {
    id: "s004",
    img: "https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?w=600&q=80",
    tag: "Pray with Me", tagBg: "#f3d8e4", tagColor: "#8a3a5a",
    categoryKey: "pray-with-me",
    title: "We prayed together across continents — and the answer came",
    author: "Ruth & Dan", location: "Kumasi",
    likes: 406, readTime: "6 min", wide: false,
  },
  {
    id: "s005",
    img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1200&q=80",
    tag: "Heralds", tagBg: "#fef3c7", tagColor: "#92610a",
    categoryKey: "heralds",
    title: "I was free before I even finished praying — a herald's testimony",
    author: "Michael I.", location: "Port Harcourt",
    likes: 892, views: "4.2K", prayers: 341, readTime: "7 min", wide: true,
  },
  {
    id: "s006",
    img: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=600&q=80",
    tag: "Healing to the Nations", tagBg: "#d4e8d4", tagColor: "#2a6b3a",
    categoryKey: "healing-nations",
    title: "From our village to the nations — healing in his name",
    author: "Amara K.", location: "Nairobi",
    likes: 534, readTime: "5 min", wide: false,
  },
  {
    id: "s007",
    img: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=600&q=80",
    tag: "Magazines", tagBg: "#e8d5b0", tagColor: "#6b4a1a",
    categoryKey: "magazines",
    title: "The magazine article that led 300 people to salvation",
    author: "Pastor David", location: "Lagos",
    likes: 278, readTime: "4 min", wide: false,
  },
  {
    id: "s008",
    img: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=600&q=80",
    tag: "Crusades", tagBg: "#ffe4d4", tagColor: "#8a3a1a",
    categoryKey: "crusades",
    title: "The crusade night that changed an entire district",
    author: "Evangelist Rose", location: "Kampala",
    likes: 621, readTime: "6 min", wide: false,
  },
// ─── KEY TO ID MAPPING ─────────────────────────────────────────
const KEY_TO_ID = {
  "all": null,
  "healing-streams": 1,
  "partnership": 2,
  "healing-nations": 3,
  "magazines": 4,
  "prayer-clouds": 5,
  "crusades": 6,
  "pray-with-me": 7,
  "heralds": 8,
};

const STREAK_DAYS = [true, true, true, true, true, false, false];

// ─── Homepage ─────────────────────────────────────────────────
import { useEffect } from "react";
import api from "../../services/axiosConfig";

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

export default function Homepage() {
  const [activeCategory, setActiveCategory] = useState("all");
  const navigate = useNavigate();
  const isLoggedIn = useIsLoggedIn();

  const [trending, setTrending] = useState([]);
  const [tod, setTod] = useState(null);
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch trending & today's testimony on mount
  useEffect(() => {
    fetchTrendingAndToday();
  }, []);

  const fetchTrendingAndToday = async () => {
    try {
      const trendingRes = await api.get("/api/testimonies/trending");
      setTrending(trendingRes.data || []);
    } catch (err) {
      console.error("Error fetching trending:", err);
    }

    try {
      const todayRes = await api.get("/api/testimonies/today");
      setTod(todayRes.data);
    } catch (err) {
      console.error("Error fetching today testimony:", err);
      // Fallback: fetch any featured testimony
      try {
        const featuredRes = await api.get("/api/testimonies/featured");
        if (featuredRes.data && featuredRes.data.length > 0) {
          setTod(featuredRes.data[0]);
        }
      } catch (fErr) {
        console.error("Error fetching fallback featured:", fErr);
      }
    }
  };

  // Fetch recent stories when category changes
  useEffect(() => {
    fetchRecentStories();
  }, [activeCategory]);

  const fetchRecentStories = async () => {
    try {
      setLoading(true);
      const categoryId = KEY_TO_ID[activeCategory];
      const params = categoryId ? { categoryId } : {};
      const res = await api.get("/api/testimonies", { params });
      setStories(res.data.content || []);
    } catch (err) {
      console.error("Error fetching recent stories:", err);
    } finally {
      setLoading(false);
    }
  };

  // Helper mappers
  const mapTrendingItem = (t) => {
    const categoryLabel = t.category?.name || "Miracle";
    const firstMedia = t.media && t.media.length > 0
      ? api.defaults.baseURL + t.media[0].fileUrl
      : "https://images.unsplash.com/photo-1504439468489-c8920d796a29?w=800&q=80";
    return {
      id: t.id,
      img: firstMedia,
      categoryLabel,
      title: t.title,
      meta: `${t.user?.name || "Anonymous"} · ${t.country || ""}`,
      views: t.viewCount || 0,
      overlay: "linear-gradient(160deg,rgba(15,36,71,0.72) 0%,rgba(42,82,152,0.55) 100%)",
    };
  };

  const mapStoryItem = (t, index) => {
    const categoryName = t.category?.name || "Healing Streams";
    const style = getTagStyle(categoryName);
    const firstMedia = t.media && t.media.length > 0
      ? api.defaults.baseURL + t.media[0].fileUrl
      : "https://images.unsplash.com/photo-1516574187841-cb9cc2ca948b?w=600&q=80";
    return {
      id: t.id,
      img: firstMedia,
      tag: categoryName,
      tagBg: style.bg,
      tagColor: style.color,
      title: t.title,
      author: t.user?.name || "Anonymous",
      location: t.country || "",
      likes: t.likeCount || 0,
      prayers: t.prayCount || 0,
      views: t.viewCount || 0,
      readTime: "3 min",
      wide: index % 5 === 0
    };
  };

  const mappedTrending = trending.map(mapTrendingItem);
  const mappedStories = stories.map(mapStoryItem);

  function goToTestimony(id) { navigate(`/testimony/${id}`); }

  return (
    <div className="homepage">

      {/* ══ HEADER — always full-width ══════════════════════ */}
      <header className="header">
        <div className="logo">My Miracle<span>Story</span></div>
        <div className="header-actions">
          {isLoggedIn ? (
            <>
              <button className="icon-btn" aria-label="Notifications"
                onClick={() => navigate("/notifications")}>🔔</button>
              <div className="avatar" onClick={() => navigate("/profile")} style={{ cursor: "pointer" }}>
                <img src="https://i.pravatar.cc/100" alt="User profile" />
              </div>
            </>
          ) : (
            <>
              <button className="header-login-btn" onClick={() => navigate("/login")}>
                Sign In
              </button>
              <button className="header-register-btn" onClick={() => navigate("/register")}>
                Register
              </button>
            </>
          )}
        </div>
      </header>

      {/* ══ LEFT SIDEBAR (desktop only) ═════════════════════ */}
      <aside className="sidebar-left">

        {/* Category grid */}
        <p className="sidebar-heading">Browse by Category</p>
        <div className="category-grid">
          {CAT_GRID.map((cat) => (
            <button
              key={cat.key}
              className={`category-item${activeCategory === cat.key ? " cat-active" : ""}`}
              style={{ background: cat.bg }}
              aria-label={cat.label}
              onClick={() => setActiveCategory(cat.key)}
            >
              <span className="category-emoji" aria-hidden="true">{cat.emoji}</span>
              <p className="category-label">{cat.label}</p>
            </button>
          ))}
        </div>

        {/* Prayer streak — below categories on desktop */}
        <section className="prayer-card">
          <small>✦ PRAYER STREAK</small>
          <h3>You've prayed for {STREAK_DAYS.filter(Boolean).length} people this week</h3>
          <div className="streak">
            {STREAK_DAYS.map((on, i) => (
              <span key={i} className={on ? "active" : ""} />
            ))}
          </div>
          <button onClick={() => navigate("/prayers")}>Pray For Someone Today</button>
        </section>

      </aside>

      {/* ══ MAIN FEED (centre) ══════════════════════════════ */}
      <main className="main-feed">

        {/* HERO */}
        <section className="hero">
          <div className="hero-bg">
            <p className="hero-eyebrow">✦ testimony portal</p>
            <h1>Your Miracle<br /><em>Can Change</em><br />Someone's Life</h1>
            <div className="hero-buttons">
              <button className="hero-btn-primary" onClick={() => navigate("/upload")}>
                Share Your Story
              </button>
              <button className="hero-btn-secondary" onClick={() => navigate("/browse")}>
                Browse Miracles
              </button>
            </div>
          </div>
        </section>

        {/* CATEGORY PILLS */}
        <section className="categories">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.key}
              className={`pill${activeCategory === cat.key ? " active" : ""}`}
              onClick={() => setActiveCategory(cat.key)}
            >
              {cat.label}
            </button>
          ))}
        </section>

        {/* TRENDING */}
        <div className="section-header">
          <h2>Trending Miracles</h2>
          <span className="see-all" role="button" tabIndex={0}
            onClick={() => navigate("/browse")}>See all →</span>
        </div>
        <div className="carousel-wrap">
          {mappedTrending.length === 0
            ? <p className="feed-empty">No trending stories in this category yet.</p>
            : mappedTrending.map((item) => (
              <div
                key={item.id}
                className="carousel-card"
                onClick={() => goToTestimony(item.id)}
                role="button" tabIndex={0}
                onKeyDown={(e) => e.key === "Enter" && goToTestimony(item.id)}
              >
                <img src={item.img} alt="" className="carousel-img" />
                <div className="carousel-card-overlay" style={{ background: item.overlay }} />
                <span className="carousel-chip">{item.categoryLabel}</span>
                <div className="carousel-play" aria-hidden="true">
                  <div className="carousel-play-icon" />
                </div>
                <div className="carousel-info">
                  <p className="carousel-title">{item.title}</p>
                  <p className="carousel-meta">{item.meta} · <span>👁 {item.views}</span></p>
                </div>
              </div>
            ))
          }
        </div>

        {/* TESTIMONY OF THE DAY */}
        {tod && (
          <div className="tod" onClick={() => goToTestimony(tod.id)}
            role="button" tabIndex={0}
            onKeyDown={(e) => e.key === "Enter" && goToTestimony(tod.id)}>
            <img
              src={tod.media && tod.media.length > 0 ? api.defaults.baseURL + tod.media[0].fileUrl : "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=900&q=80"}
              alt="" className="tod-bg-img"
            />
            <div className="tod-inner">
              <div className="tod-badge">✦ testimony of the day</div>
              <h3 className="tod-title">
                "{tod.title}"
              </h3>
              <p className="tod-excerpt">
                {tod.description ? tod.description.slice(0, 150) + "..." : ""}
              </p>
              <div className="tod-footer">
                <div className="tod-author">
                  <div className="tod-avatar" aria-hidden="true">
                    {tod.user?.name ? tod.user.name.slice(0,2).toUpperCase() : "T"}
                  </div>
                  <div>
                    <p className="tod-name">{tod.user?.name || "Anonymous"}</p>
                    <p className="tod-location">{tod.country} · {tod.category?.name}</p>
                  </div>
                </div>
                <div className="tod-stats">
                  <span>❤️ {tod.likeCount}</span>
                  <span>🙏 {tod.prayCount}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* MOBILE-ONLY: Category grid + prayer card */}
        <div className="mobile-only">
          <div className="section-header">
            <h2>Browse by Category</h2>
            <span className="see-all" role="button" tabIndex={0}
              onClick={() => navigate("/browse")}>All →</span>
          </div>
          <div className="category-grid mobile-cat-grid">
            {CAT_GRID.map((cat) => (
              <button
                key={cat.key}
                className={`category-item${activeCategory === cat.key ? " cat-active" : ""}`}
                style={{ background: cat.bg }}
                aria-label={cat.label}
                onClick={() => setActiveCategory(cat.key)}
              >
                <span className="category-emoji" aria-hidden="true">{cat.emoji}</span>
                <p className="category-label">{cat.label}</p>
              </button>
            ))}
          </div>

          <section className="prayer-card">
            <small>✦ PRAYER STREAK</small>
            <h3>You've prayed for {STREAK_DAYS.filter(Boolean).length} people this week</h3>
            <div className="streak">
              {STREAK_DAYS.map((on, i) => (
                <span key={i} className={on ? "active" : ""} />
              ))}
            </div>
            <button onClick={() => navigate("/prayers")}>Pray For Someone Today</button>
          </section>
        </div>

        {/* RECENT STORIES */}
        <section className="stories">
          <div className="section-header">
            <h2>
              {activeCategory === "all"
                ? "Recent Stories"
                : `${CATEGORIES.find(c => c.key === activeCategory)?.label} Stories`}
            </h2>
            <span className="see-all" role="button" tabIndex={0}
              onClick={() => navigate("/browse")}>See all →</span>
          </div>
          <div className="masonry-grid">
            {loading ? (
              <p className="feed-empty" style={{ gridColumn: "1/-1" }}>Loading stories...</p>
            ) : mappedStories.length === 0 ? (
              <p className="feed-empty" style={{ gridColumn: "1/-1" }}>
                No stories in this category yet.
              </p>
            ) : mappedStories.map((card) => (
              <article
                key={card.id}
                className={`story-card${card.wide ? " full-width" : ""}`}
                onClick={() => goToTestimony(card.id)}
                role="button" tabIndex={0}
                onKeyDown={(e) => e.key === "Enter" && goToTestimony(card.id)}
              >
                <div className="story-thumb">
                  <img src={card.img} alt={card.title} className="story-thumb-img" />
                  <div className="story-thumb-scrim" />
                  <span className="story-read-time">{card.readTime}</span>
                </div>
                <div className="story-body">
                  <span className="story-tag"
                    style={{ background: card.tagBg, color: card.tagColor }}>
                    {card.tag}
                  </span>
                  <h4 className="story-title">{card.title}</h4>
                  <div className="story-meta">
                    <div className="story-author-row">
                      <span className="story-author-name">{card.author}</span>
                      {card.location && <span className="story-location">· {card.location}</span>}
                    </div>
                    <div className="story-stats">
                      <span>❤️ {card.likes}</span>
                      {card.prayers && <span>🙏 {card.prayers}</span>}
                      {card.views   && <span>👁 {card.views}</span>}
                    </div>
                  </div>
                </div>
              </article>
            ))
            }
          </div>
        </section>

      </main>{/* end .main-feed */}

      <BottomNav isLoggedIn={isLoggedIn} />
    </div>
  );
}