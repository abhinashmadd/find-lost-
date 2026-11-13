import React, { useState, useEffect } from "react";
import adminService from "../services/adminService";
import itemService from "../services/itemService";
import { useAuth } from "../context/AuthContext";
import Loader from "../components/Loader";
import Alert from "../components/Alert";
import { ITEM_TYPES, ITEM_STATUS, USER_ROLES } from "../constants";
import { formatDate } from "../utils/formatters";

export default function Admin() {
  const { user: currentUser } = useAuth();
  const [items, setItems] = useState([]);
  const [users, setUsers] = useState([]);
  const [activeTab, setActiveTab] = useState("items"); // "items" | "users"

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      setError("");

      const [itemsData, usersData] = await Promise.all([
        adminService.getAllItems(),
        adminService.getUsers(),
      ]);

      setItems(itemsData || []);
      setUsers(usersData || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load admin data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  // Admin deletes any report
  const handleDeleteItem = async (itemId) => {
    const confirmed = window.confirm("Are you sure you want to permanently delete this report?");
    if (!confirmed) return;

    try {
      await itemService.deleteItem(itemId);
      setSuccess("Report deleted successfully by admin.");
      setItems((prev) => prev.filter((item) => item._id !== itemId));
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete item.");
    }
  };

  // Admin deactivates a user
  const handleDeactivateUser = async (userId) => {
    const confirmed = window.confirm("Are you sure you want to deactivate this user account?");
    if (!confirmed) return;

    try {
      const res = await adminService.deactivateUser(userId);
      setSuccess(res.message || "User deactivated successfully.");
      setUsers((prev) =>
        prev.map((u) => (u._id === userId ? { ...u, isActive: false } : u))
      );
    } catch (err) {
      setError(err.response?.data?.message || "Failed to deactivate user.");
    }
  };

  // Admin re-activates a user
  const handleActivateUser = async (userId) => {
    const confirmed = window.confirm("Are you sure you want to re-activate this user account?");
    if (!confirmed) return;

    try {
      const res = await adminService.activateUser(userId);
      setSuccess(res.message || "User activated successfully.");
      setUsers((prev) =>
        prev.map((u) => (u._id === userId ? { ...u, isActive: true } : u))
      );
    } catch (err) {
      setError(err.response?.data?.message || "Failed to activate user.");
    }
  };

  if (loading) return <Loader text="Loading administrator panel..." />;

  return (
    <div className="page-container admin-page">
      <div className="admin-header">
        <h2>Administrator Moderation Panel</h2>
        <p className="admin-sub">
          Review system content, delete non-compliant reports, and manage user accounts.
        </p>
      </div>

      {error && <Alert type="error" message={error} onClose={() => setError("")} />}
      {success && <Alert type="success" message={success} onClose={() => setSuccess("")} />}

      {/* Admin Tabs */}
      <div className="dashboard-tabs">
        <button
          className={`tab-btn ${activeTab === "items" ? "active" : ""}`}
          onClick={() => setActiveTab("items")}
        >
          📦 All Listings ({items.length})
        </button>
        <button
          className={`tab-btn ${activeTab === "users" ? "active" : ""}`}
          onClick={() => setActiveTab("users")}
        >
          👥 Registered Users ({users.length})
        </button>
      </div>

      {/* Table 1: All Items */}
      {activeTab === "items" && (
        <section className="dashboard-section">
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Type</th>
                  <th>Category</th>
                  <th>Location</th>
                  <th>Status</th>
                  <th>Reported By</th>
                  <th>Date</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item._id}>
                    <td>
                      <strong>{item.title}</strong>
                    </td>
                    <td>
                      <span className={`badge ${item.type === ITEM_TYPES.LOST ? "badge-lost" : "badge-found"}`}>
                        {item.type}
                      </span>
                    </td>
                    <td>{item.category}</td>
                    <td>{item.location}</td>
                    <td>
                      <span className={`badge ${item.status === ITEM_STATUS.RETURNED ? "badge-returned" : "badge-open"}`}>
                        {item.status}
                      </span>
                    </td>
                    <td>{item.reportedBy ? `${item.reportedBy.name} (${item.reportedBy.email})` : "N/A"}</td>
                    <td>{formatDate(item.createdAt)}</td>
                    <td>
                      <button
                        onClick={() => handleDeleteItem(item._id)}
                        className="btn-table-delete"
                      >
                        Delete Report
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* Table 2: All Users */}
      {activeTab === "users" && (
        <section className="dashboard-section">
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Registered On</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => {
                  const isCurrentAdmin = u._id === currentUser?.id || u._id === currentUser?._id;
                  return (
                    <tr key={u._id}>
                      <td>
                        <strong>{u.name}</strong>
                      </td>
                      <td>{u.email}</td>
                      <td>
                        <span className={`badge ${u.role === USER_ROLES.ADMIN ? "badge-admin" : "badge-user"}`}>
                          {u.role}
                        </span>
                      </td>
                      <td>
                        <span className={`badge ${u.isActive ? "badge-active" : "badge-inactive"}`}>
                          {u.isActive ? "Active" : "Deactivated"}
                        </span>
                      </td>
                      <td>{formatDate(u.createdAt)}</td>
                      <td>
                        {isCurrentAdmin || u.role === USER_ROLES.ADMIN ? (
                          <span className="text-muted">{isCurrentAdmin ? "(You)" : "(Admin)"}</span>
                        ) : u.isActive ? (
                          <button
                            onClick={() => handleDeactivateUser(u._id)}
                            className="btn-deactivate"
                          >
                            Deactivate
                          </button>
                        ) : (
                          <button
                            onClick={() => handleActivateUser(u._id)}
                            className="btn-approve"
                          >
                            Activate
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
}

