import { useNavigate, useLocation } from "react-router";

export default function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();

  const items = [
    {
      key: "home",
      icon: "🏠",
      label: "Home",
      path: "/",
    },
    {
      key: "discover",
      icon: "🔍",
      label: "Discover",
      path: "/browse",
    },
    {
      key: "upload",
      icon: "+",
      label: "Share",
      path: "/upload",
      center: true,
    },
    {
      key: "My Testimonies",
      icon: "🙏",
      label: "My Testimonies",
      path: "/my-testimonies",
    },
    {
      key: "profile",
      icon: "👤",
      label: "Profile",
      path: "/profile",
    },
  ];

  return (
    <nav className="bottom-nav">
      {items.map((item) =>
        item.center ? (
          <button
            key={item.key}
            className="center-btn"
            aria-label={item.label}
            onClick={() => navigate(item.path)}
          >
            {item.icon}
          </button>
        ) : (
          <button
            key={item.key}
            className={
              location.pathname === item.path
                ? "nav-active"
                : ""
            }
            aria-label={item.label}
            onClick={() => navigate(item.path)}
          >
            {item.icon}
          </button>
        )
      )}
    </nav>
  );
}