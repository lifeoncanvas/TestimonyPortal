import { BrowserRouter, Routes, Route, Navigate } from "react-router";
import { useEffect } from "react";
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



function App() {
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const code = searchParams.get("code");
    const origin = searchParams.get("origin");

    if (code && origin) {
      window.history.replaceState({}, document.title, window.location.pathname);
      
      api.post("/api/auth/kingschat/verify", { code })
        .then(res => {
          localStorage.setItem("token", res.data.token);
          localStorage.setItem("user", JSON.stringify(res.data.user));
          window.location.reload();
        })
        .catch(err => {
          console.error("Kingschat verification failed", err);
          alert("KingsChat login failed: " + (err.response?.data?.message || err.message));
        });
    }
  }, []);

  return (
    <BrowserRouter>

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
    </BrowserRouter>
  );
}

export default App;
