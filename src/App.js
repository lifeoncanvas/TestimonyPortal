import { BrowserRouter, Routes, Route } from "react-router";
import './App.css';

import Homepage from "./Pages/Homepage/homepage";
import Browse from "./Pages/Browse/browse";
import TestimonyDetails from "./Pages/TestimonyDetails/testimonyDetails";
import UploadTestimony from "./Pages/UploadTestimony/uploadTestimony";
import Login from "./Pages/Login/login";
import Register from "./Pages/Register/register";
import Profile from "./Pages/Profile/profile";
import MyTestimonies from "./Pages/MyTestimonies/myTestimonies";
import SavedTestimonies from "./Pages/SavedTestimonies/savedTestimonies";
import Notifications from "./Pages/Notifications/notifications";
import Analytics from "./Pages/Analytics/analytics";
import AdminDashboard from "./Pages/AdminDashboard/adminDashboard";
import AdminModeration from "./Pages/AdminModeration/adminModeration";
import AdminCategories from "./Pages/AdminCategories/adminCategories";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Homepage />} />
        <Route path="/browse" element={<Browse />} />
        <Route path="/testimony/:id" element={<TestimonyDetails />} />
        <Route path="/upload" element={<UploadTestimony />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/my-testimonies" element={<MyTestimonies />} />
        <Route path="/saved" element={<SavedTestimonies />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/moderation" element={<AdminModeration />} />
        <Route path="/admin/categories" element={<AdminCategories />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
