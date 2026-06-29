import { BrowserRouter, Routes, Route, Navigate } from "react-router";
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

function App() {
  return (
    <BrowserRouter>
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
