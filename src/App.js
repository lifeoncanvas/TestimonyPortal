import { BrowserRouter, Routes, Route, Navigate } from "react-router";
import { useEffect, useState } from "react";
import api from "./services/axiosConfig";
import './App.css';

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
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");

    // Only act if KingsChat sent us back with ?code=
    if (!code) return;

    // Clean URL immediately
    window.history.replaceState({}, document.title, window.location.pathname);
    setProcessing(true);

    api
      .post("/api/auth/kingschat/verify", { code })
      .then((res) => {
        localStorage.setItem("token", res.data.token);
        localStorage.setItem("user", JSON.stringify(res.data.user));

        const user = res.data.user;
        if (user && user.role === "ADMIN") {
          window.location.href = "/admin";
        } else {
          window.location.href = "/profile";
        }
      })
      .catch((err) => {
        console.error("KingsChat verification failed:", err);
        setError(
          err.response?.data?.message ||
            err.response?.data ||
            "KingsChat login failed. Please try again."
        );
        setProcessing(false);
      });
  }, []);

  if (processing) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #0a0a16 0%, #13132b 100%)",
          color: "white",
          fontFamily: "'Inter', sans-serif",
          gap: "20px",
        }}
      >
        <div
          style={{
            width: "56px",
            height: "56px",
            borderRadius: "50%",
            border: "3px solid rgba(201,169,110,0.15)",
            borderTopColor: "#c9a96e",
            animation: "kcSpin 0.8s linear infinite",
          }}
        />
        <h2 style={{ margin: 0, fontWeight: 600 }}>
          Signing you in with KingsChat...
        </h2>
        <p style={{ margin: 0, color: "#9a95a8", fontSize: "14px" }}>
          Please wait a moment
        </p>
        {error && (
          <div
            style={{
              background: "rgba(255,80,80,0.15)",
              border: "1px solid rgba(255,80,80,0.3)",
              borderRadius: "10px",
              padding: "15px 25px",
              color: "#ff6b6b",
              maxWidth: "400px",
              textAlign: "center",
            }}
          >
            {error}
            <br />
            <a href="/login" style={{ color: "#c9a96e", marginTop: "10px", display: "inline-block" }}>
              ← Back to Login
            </a>
          </div>
        )}
        <style>{`@keyframes kcSpin { to { transform: rotate(360deg); } }`}</style>
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
        <Route path="/" element={<Homepage />} />
        <Route path="/browse" element={<ProtectedRoute requireAdmin={true}><Browse /></ProtectedRoute>} />
        <Route path="/testimony/:id" element={<ProtectedRoute requireAdmin={true}><TestimonyDetails /></ProtectedRoute>} />
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
