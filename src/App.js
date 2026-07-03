import { BrowserRouter, Routes, Route, Navigate, useNavigate } from "react-router";
import { useEffect } from "react";
import api from "./services/axiosConfig";
import './App.css';

import Homepage from "./Pages/Homepage/homepage";
import Browse from "./Pages/Browse/browse";
import TestimonyDetails from "./Pages/TestimonyDetails/testimonyDetails";
import UploadTestimony from "./Pages/UploadTestimony/uploadTestimony";
import Login from "./Pages/Login/login";
import Register from "./Pages/Register/register";
import ForgotPassword from "./Pages/ForgotPassword/ForgotPassword";
import Profile from "./Pages/Profile/profile";
import MyTestimonies from "./Pages/MyTestimonies/myTestimonies";
import SavedTestimonies from "./Pages/SavedTestimonies/savedTestimonies";
import Notifications from "./Pages/Notifications/notifications";
import Analytics from "./Pages/Analytics/analytics";
import AdminDashboard from "./Pages/AdminDashboard/adminDashboard";
import AdminModeration from "./Pages/AdminModeration/adminModeration";
import AdminCategories from "./Pages/AdminCategories/adminCategories";
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

function KingsChatCallbackHandler() {
  const navigate = useNavigate();

  useEffect(() => {
    let token = null;
    if (window.location.hash && window.location.hash.includes("access_token")) {
      const params = new URLSearchParams(window.location.hash.substring(1));
      token = params.get("access_token");
    } else if (window.location.search && window.location.search.includes("access_token")) {
      const params = new URLSearchParams(window.location.search);
      token = params.get("access_token");
    }

    if (token) {
      window.history.pushState(null, null, " ");
      
      fetch("https://connect.kingsch.at/developer/api/user/profile", {
        headers: {
          "Authorization": `Bearer ${token}`,
          "api-key": process.env.REACT_APP_KINGSCHAT_API_KEY || "FBDOzHxVmtEAauNceYMcDQ30SoZTlj7GW3QPI8SYH4k="
        }
      })
      .then(res => {
        if (!res.ok) throw new Error("Failed to fetch KingsChat profile");
        return res.json();
      })
      .then(async (kingschatUserRaw) => {
        let userObj = kingschatUserRaw;
        if (kingschatUserRaw.profile) userObj = kingschatUserRaw.profile;
        else if (kingschatUserRaw.user) userObj = kingschatUserRaw.user;
        else if (kingschatUserRaw.data) userObj = kingschatUserRaw.data;
        
        if (userObj && userObj.id) {
           const name = `${userObj.first_name || ""} ${userObj.last_name || ""}`.trim() || "KingsChat User";
           const email = userObj.email || `${userObj.id}@kingschat.com`;
           
           try {
              const res = await api.post("/api/auth/kingschat", {
                name, email,
                church: "Christ Embassy Virtual Church",
                zone: "Virtual Zone 1",
                country: "Nigeria",
              });
        
              localStorage.setItem("token", res.data.token);
              localStorage.setItem("user", JSON.stringify(res.data.user));
              navigate("/");
           } catch (err) {
              console.error("KingsChat login failed", err);
           }
        }
      })
      .catch(err => {
        console.error("KingsChat API error", err);
      });
    }
  }, [navigate]);

  return null;
}

function App() {
  return (
    <BrowserRouter>
      <KingsChatCallbackHandler />
      <Routes>
        <Route path="/" element={<Homepage />} />
        <Route path="/browse" element={<Browse />} />
        <Route path="/testimony/:id" element={<TestimonyDetails />} />
        <Route path="/upload" element={<ProtectedRoute><UploadTestimony /></ProtectedRoute>} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/my-testimonies" element={<ProtectedRoute><MyTestimonies /></ProtectedRoute>} />
        <Route path="/saved" element={<ProtectedRoute><SavedTestimonies /></ProtectedRoute>} />
        <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
        <Route path="/analytics" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
        <Route path="/admin" element={<ProtectedRoute requireAdmin={true}><AdminDashboard /></ProtectedRoute>} />
        <Route path="/admin/moderation" element={<ProtectedRoute requireAdmin={true}><AdminModeration /></ProtectedRoute>} />
        <Route path="/admin/categories" element={<ProtectedRoute requireAdmin={true}><AdminCategories /></ProtectedRoute>} />
        <Route path="/prayers" element={<PrayerWall />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
