import { useNavigate } from "react-router";
import { Bookmark, Heart } from "lucide-react";
import BottomNav from "../../Sections/BottomNav/BottomNav";
import "./styles.css";

const SAVED = [
  { id: "t001", tag: "Healing",     tagBg: "#dcccf4", tagColor: "#5a3d8a", title: "Doctors Said It Was Impossible — But God Had the Final Word", author: "Sister Mary Okonkwo", likes: 2847 },
  { id: "t004", tag: "Restoration", tagBg: "#d4e8d4", tagColor: "#2a6b3a", title: "After 11 years, my family is whole again", author: "Grace O.", likes: 4512 },
  { id: "t002", tag: "Provision",   tagBg: "#f6d7be", tagColor: "#8a5a2a", title: "Debt cleared overnight after prayer", author: "Emmanuel K.", likes: 1830 },
];

export default function SavedTestimonies() {
  const navigate = useNavigate();

  return (
    <div className="saved-testimonies-page">
      <header className="saved-header">
        <h1>Saved Stories</h1>
        <span>{SAVED.length} stories</span>
      </header>

      <div className="saved-list">
        {SAVED.map((s) => (
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
              onClick={(e) => e.stopPropagation()}
            >
              <Bookmark size={16} fill="#c9a96e" color="#c9a96e" />
            </button>
          </div>
        ))}
      </div>

      <BottomNav />
    </div>
  );
}
