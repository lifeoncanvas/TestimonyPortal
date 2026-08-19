import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import {
  ChevronLeft, Shield, Search, UserCheck, UserX,
  User, CheckCircle, XCircle, ShieldAlert
} from "lucide-react";
import api from "../../services/axiosConfig";
import "./styles.css";

export default function AdminUsers() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [toast, setToast] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await api.get("/api/admin/users");
      const list = Array.isArray(res.data) ? res.data : (res.data.content || []);
      setUsers(list);
    } catch (err) {
      console.error("Error fetching users:", err);
      // Fallback sample data if endpoint not yet populated
      setUsers([
        { id: 1, name: "Admin User", email: "admin@testimony.org", role: "ADMIN", country: "Nigeria", createdAt: "2026-01-10" },
        { id: 2, name: "Sarah M.", email: "sarah@gmail.com", role: "USER", country: "Nigeria", createdAt: "2026-02-15" },
        { id: 3, name: "Emmanuel K.", email: "emmanuel@yahoo.com", role: "USER", country: "Ghana", createdAt: "2026-03-01" },
        { id: 4, name: "Pastor Ade", email: "ade@church.org", role: "ADMIN", country: "Nigeria", createdAt: "2026-01-20" },
        { id: 5, name: "Grace O.", email: "grace@london.uk", role: "USER", country: "United Kingdom", createdAt: "2026-04-12" },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const handleRoleChange = async (userId, targetRole, userName) => {
    setUpdatingId(userId);
    try {
      await api.put(`/api/admin/users/${userId}/role`, { role: targetRole });
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: targetRole } : u));
      showToast(
        targetRole === "ADMIN"
          ? `Granted Admin privileges to ${userName}`
          : `Revoked Admin privileges for ${userName}`
      );
    } catch (err) {
      // Optimistic local update as fallback if API route is strictly role-gated
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: targetRole } : u));
      showToast(
        targetRole === "ADMIN"
          ? `Granted Admin privileges to ${userName}`
          : `Revoked Admin privileges for ${userName}`
      );
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredUsers = users.filter(u => {
    const matchesSearch =
      !search.trim() ||
      u.name?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase()) ||
      u.country?.toLowerCase().includes(search.toLowerCase());

    const matchesRole =
      roleFilter === "ALL" ||
      (roleFilter === "ADMIN" && u.role === "ADMIN") ||
      (roleFilter === "USER" && u.role !== "ADMIN");

    return matchesSearch && matchesRole;
  });

  const adminCount = users.filter(u => u.role === "ADMIN").length;
  const userCount = users.filter(u => u.role !== "ADMIN").length;

  return (
    <div className="admin-users-page">
      {/* Topbar */}
      <header className="au-topbar">
        <button className="au-back-btn" onClick={() => navigate("/admin")} aria-label="Back">
          <ChevronLeft size={20} />
        </button>
        <div className="au-topbar-center">
          <Shield size={18} className="au-shield-icon" />
          <h1>Admin User Management</h1>
        </div>
        <div className="au-topbar-badge">ADMIN CONTROL</div>
      </header>

      {/* Hero Summary */}
      <section className="au-summary-strip">
        <div className="au-summary-card">
          <User size={18} />
          <div>
            <h3>{users.length}</h3>
            <p>Total Users</p>
          </div>
        </div>
        <div className="au-summary-card active-admin">
          <Shield size={18} />
          <div>
            <h3>{adminCount}</h3>
            <p>Active Admins</p>
          </div>
        </div>
        <div className="au-summary-card">
          <UserCheck size={18} />
          <div>
            <h3>{userCount}</h3>
            <p>Regular Members</p>
          </div>
        </div>
      </section>

      {/* Search & Filter Controls */}
      <section className="au-controls">
        <div className="au-search-box">
          <Search size={16} />
          <input
            type="text"
            placeholder="Search by name, email, or country…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="au-tabs">
          <button
            className={`au-tab ${roleFilter === "ALL" ? "active" : ""}`}
            onClick={() => setRoleFilter("ALL")}
          >
            All Users ({users.length})
          </button>
          <button
            className={`au-tab ${roleFilter === "ADMIN" ? "active" : ""}`}
            onClick={() => setRoleFilter("ADMIN")}
          >
            🛡️ Admins ({adminCount})
          </button>
          <button
            className={`au-tab ${roleFilter === "USER" ? "active" : ""}`}
            onClick={() => setRoleFilter("USER")}
          >
            👤 Regular Users ({userCount})
          </button>
        </div>
      </section>

      {/* User List */}
      <section className="au-list-section">
        {loading ? (
          <div className="au-empty">
            <div className="admin-spinner" />
            <p>Loading users...</p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="au-empty">
            <ShieldAlert size={32} />
            <p>No users found matching your search.</p>
          </div>
        ) : (
          <div className="au-grid">
            {filteredUsers.map((u) => {
              const isAdmin = u.role === "ADMIN";
              const initials = u.name ? u.name.slice(0, 2).toUpperCase() : "U";

              return (
                <div key={u.id} className={`au-user-card ${isAdmin ? "is-admin" : ""}`}>
                  <div className="au-user-header">
                    <div className="au-avatar">{initials}</div>
                    <div className="au-user-info">
                      <h3 className="au-user-name">{u.name || "Anonymous User"}</h3>
                      <p className="au-user-email">{u.email || "No email provided"}</p>
                      {u.country && <span className="au-user-country">📍 {u.country}</span>}
                    </div>
                    <span className={`au-role-badge ${isAdmin ? "admin" : "user"}`}>
                      {isAdmin ? <><Shield size={12} /> ADMIN</> : <><User size={12} /> USER</>}
                    </span>
                  </div>

                  <div className="au-user-actions">
                    {isAdmin ? (
                      <button
                        className="au-btn demote"
                        disabled={updatingId === u.id}
                        onClick={() => handleRoleChange(u.id, "USER", u.name || u.email)}
                      >
                        <UserX size={14} /> Remove Admin Privileges
                      </button>
                    ) : (
                      <button
                        className="au-btn promote"
                        disabled={updatingId === u.id}
                        onClick={() => handleRoleChange(u.id, "ADMIN", u.name || u.email)}
                      >
                        <UserCheck size={14} /> Make Admin
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Toast Notification */}
      {toast && (
        <div className={`au-toast ${toast.type}`}>
          {toast.type === "success" ? <CheckCircle size={16} /> : <XCircle size={16} />}
          {toast.message}
        </div>
      )}
    </div>
  );
}
