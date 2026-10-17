import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router";
import './App.css';
import api from "./services/axiosConfig";

import Homepage from "./Pages/Homepage/homepage";
import Browse from "./Pages/Browse/browse";
import TestimonyDetails from "./Pages/TestimonyDetails/testimonyDetails";
import UploadTestimony from "./Pages/UploadTestimony/uploadTestimony";
import Login from "./Pages/Login/login";
import Register from "./Pages/Register/register";
import ForgotPassword from "./Pages/Login/forgotPassword";
import ResetPassword from "./Pages/Login/resetPassword";
import Profile from "./Pages/Profile/profile";
import MyTestimonies from "./Pages/MyTestimonies/myTestimonies";
import SavedTestimonies from "./Pages/SavedTestimonies/savedTestimonies";
import Notifications from "./Pages/Notifications/notifications";
import Analytics from "./Pages/Analytics/analytics";
import AdminDashboard from "./Pages/AdminDashboard/adminDashboard";
import AdminModeration from "./Pages/AdminModeration/adminModeration";
import AdminCategories from "./Pages/AdminCategories/adminCategories";
import AdminUsers from "./Pages/AdminUsers/adminUsers";
import PrayerWall from "./Pages/PrayerWall/prayerWall";

function ProtectedRoute({ children, requireAdmin = false }) {
  const token = localStorage.getItem("token");
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  if (requireAdmin) {
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      if (user?.role !== "ADMIN") {
        return <Navigate to="/" replace />;
      }
    } catch (e) {
      return <Navigate to="/login" replace />;
    }
  }
  return children;
}

function KingsChatCallbackHandler({ children }) {
  const [processing] = useState(() => {
    const search = window.location.search;
    return new URLSearchParams(search).has("code") || new URLSearchParams(search).has("token");
  });
  const [statusMessage, setStatusMessage] = useState("Connecting with KingsChat...");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");
    const token = params.get("token");
    const kcError = params.get("error") || params.get("kc_error");

    if (kcError) {
      window.history.replaceState({}, document.title, "/login");
      window.location.href = `/login?kc_error=${encodeURIComponent(kcError)}`;
      return;
    }

    if (code) {
      const redirectUri = "https://testimonyportal.com";
      api.post("/api/auth/kingschat/verify", {
        code,
        redirectUri
      })
      .then(res => {
        localStorage.setItem("token", res.data.token);
        localStorage.setItem("user", JSON.stringify(res.data.user));
        window.history.replaceState({}, document.title, "/");
        const role = res.data.user?.role;
        window.location.replace(role === "ADMIN" ? "/admin" : "/");
      })
      .catch(err => {
        console.error("KingsChat verification failed:", err);
        const msg = err.response?.data?.message || err.message || "KingsChat authentication failed.";
        window.history.replaceState({}, document.title, "/login");
        window.location.href = `/login?kc_error=${encodeURIComponent(msg)}`;
      });
      return;
    }

    if (token) {
      setStatusMessage("Signing you in...");
      localStorage.setItem("token", token);
      api.get("/api/auth/me", { headers: { Authorization: `Bearer ${token}` } })
        .then(res => {
          localStorage.setItem("user", JSON.stringify(res.data));
          window.history.replaceState({}, document.title, "/");
          const role = res.data?.role;
          window.location.replace(role === "ADMIN" ? "/admin" : "/");
        })
        .catch(() => {
          window.history.replaceState({}, document.title, "/");
          window.location.replace("/");
        });
      return;
    }
  }, []);

  if (processing) {
    return (
      <div style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "radial-gradient(ellipse at 50% 20%, #171b30 0%, #0a0b14 100%)",
        color: "#fff",
        fontFamily: "'Outfit', sans-serif"
      }}>
        <div style={{
          width: "56px",
          height: "56px",
          border: "4px solid rgba(0, 132, 255, 0.2)",
          borderTop: "4px solid #0084ff",
          borderRadius: "50%",
          animation: "spin 0.8s linear infinite",
          marginBottom: "24px"
        }} />
        <h2 style={{ fontSize: "22px", fontWeight: "700", marginBottom: "8px", letterSpacing: "0.2px" }}>
          {statusMessage}
        </h2>
        <p style={{ color: "#9a95a8", fontSize: "14px", margin: 0 }}>
          Directing you to your account...
        </p>
      </div>
    );
  }

  return children;
}

function App() {
  return (
    <BrowserRouter>
      <KingsChatCallbackHandler>
        <Routes>
        <Route path="/" element={<ProtectedRoute><Homepage /></ProtectedRoute>} />
        <Route path="/browse" element={<ProtectedRoute requireAdmin={true}><Browse /></ProtectedRoute>} />
        <Route path="/testimony/:id" element={<ProtectedRoute><TestimonyDetails /></ProtectedRoute>} />
        <Route path="/upload" element={<ProtectedRoute><UploadTestimony /></ProtectedRoute>} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/my-testimonies" element={<ProtectedRoute><MyTestimonies /></ProtectedRoute>} />
        <Route path="/saved" element={<ProtectedRoute><SavedTestimonies /></ProtectedRoute>} />
        <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
        <Route path="/analytics" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
        <Route path="/admin" element={<ProtectedRoute requireAdmin={true}><AdminDashboard /></ProtectedRoute>} />
        <Route path="/admin/moderation" element={<ProtectedRoute requireAdmin={true}><AdminModeration /></ProtectedRoute>} />
        <Route path="/admin/categories" element={<ProtectedRoute requireAdmin={true}><AdminCategories /></ProtectedRoute>} />
        <Route path="/admin/users" element={<ProtectedRoute requireAdmin={true}><AdminUsers /></ProtectedRoute>} />
        <Route path="/prayers" element={<ProtectedRoute requireAdmin={true}><PrayerWall /></ProtectedRoute>} />
      </Routes>
      </KingsChatCallbackHandler>
    </BrowserRouter>
  );
}

export default App;
