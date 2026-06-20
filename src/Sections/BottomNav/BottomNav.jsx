import { useNavigate, useLocation } from "react-router";

export default function BottomNav({ isLoggedIn }) {
  const navigate = useNavigate();
  const location = useLocation();

  // If not logged in, check from localStorage as fallback
  const loggedIn = isLoggedIn !== undefined ? isLoggedIn : !!localStorage.getItem("token");

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
      path: loggedIn ? "/upload" : "/login",
      center: true,
    },
    ...(loggedIn
      ? [
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
        ]
      : [
          {
            key: "login",
            icon: "🔑",
            label: "Login",
            path: "/login",
          },
          {
            key: "register",
            icon: "📝",
            label: "Register",
            path: "/register",
          },
        ]),
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