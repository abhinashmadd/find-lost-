import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import itemService from "../services/itemService";
import claimService from "../services/claimService";
import { useAuth } from "../context/AuthContext";
import Loader from "../components/Loader";
import Alert from "../components/Alert";
import { ITEM_TYPES, ITEM_STATUS, CLAIM_STATUS } from "../constants";
import { formatDate } from "../utils/formatters";

export default function Dashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("reports"); // "reports" | "made" | "received"

  const [myReports, setMyReports] = useState([]);
  const [claimsMade, setClaimsMade] = useState([]);
  const [claimsReceived, setClaimsReceived] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fetchData = async () => {
    try {
      setLoading(true);
      setError("");

      // Fetch user's reported items via itemService
      const itemsData = await itemService.listItems({
        reportedBy: user.id,
        status: "all",
        limit: 100,
      });
      setMyReports(itemsData.items || []);

      // Fetch user's claims made and received via claimService
      const claimsData = await claimService.getMyClaims();
      setClaimsMade(claimsData.made || []);
      setClaimsReceived(claimsData.received || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.id) {
      fetchData();
    }
  }, [user]);

  // Handle report deletion via itemService
  const handleDeleteReport = async (itemId) => {
    const confirm = window.confirm("Are you sure you want to delete this report?");
    if (!confirm) return;

    try {
      await itemService.deleteItem(itemId);
      setSuccess("Report deleted successfully.");
      setMyReports((prev) => prev.filter((item) => item._id !== itemId));
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete report.");
    }
  };

  // Handle claim decision (Approve or Reject) via claimService
  const handleDecideClaim = async (claimId, decision) => {
    const confirm = window.confirm(`Are you sure you want to ${decision} this claim?`);
    if (!confirm) return;

    try {
      await claimService.decideClaim(claimId, decision);
      setSuccess(`Claim has been ${decision} successfully.`);
      // Refresh claims data to update status and reveal contact info
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update claim.");
    }
  };

  if (loading) return <Loader text="Loading your dashboard..." />;

  return (
    <div className="page-container dashboard-page">
      <div className="dashboard-header">
        <h2>User Dashboard</h2>
        <p className="dashboard-sub">
          Welcome back, <strong>{user?.name}</strong>! Manage your lost & found listings and track ownership claims.
        </p>
      </div>

      {error && <Alert type="error" message={error} onClose={() => setError("")} />}
      {success && <Alert type="success" message={success} onClose={() => setSuccess("")} />}

      {/* Tabs */}
      <div className="dashboard-tabs">
        <button
          className={`tab-btn ${activeTab === "reports" ? "active" : ""}`}
          onClick={() => setActiveTab("reports")}
        >
          📋 My Reports ({myReports.length})
        </button>
        <button
          className={`tab-btn ${activeTab === "made" ? "active" : ""}`}
          onClick={() => setActiveTab("made")}
        >
          📤 Claims I Made ({claimsMade.length})
        </button>
        <button
          className={`tab-btn ${activeTab === "received" ? "active" : ""}`}
          onClick={() => setActiveTab("received")}
        >
          📥 Claims Received ({claimsReceived.length})
        </button>
      </div>

      {/* Tab 1: My Reports */}
      {activeTab === "reports" && (
        <section className="dashboard-section">
          {myReports.length === 0 ? (
            <div className="empty-tab-box">
              <p>You haven't reported any lost or found items yet.</p>
              <Link to="/report" className="btn btn-submit">
                Report an Item Now
              </Link>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Type</th>
                    <th>Category</th>
                    <th>Location</th>
                    <th>Status</th>
                    <th>Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {myReports.map((item) => (
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
                      <td>{formatDate(item.createdAt)}</td>
                      <td className="table-actions">
                        <Link to={`/items/${item._id}`} className="btn-table-view">
                          View
                        </Link>
                        <button
                          onClick={() => handleDeleteReport(item._id)}
                          className="btn-table-delete"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}

      {/* Tab 2: Claims I Made */}
      {activeTab === "made" && (
        <section className="dashboard-section">
          {claimsMade.length === 0 ? (
            <div className="empty-tab-box">
              <p>You haven't submitted any claims yet.</p>
              <Link to="/items" className="btn btn-secondary">
                Browse Items
              </Link>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Item</th>
                    <th>Message</th>
                    <th>Proof Provided</th>
                    <th>Status</th>
                    <th>Submitted On</th>
                  </tr>
                </thead>
                <tbody>
                  {claimsMade.map((claim) => (
                    <tr key={claim._id}>
                      <td>
                        {claim.item ? (
                          <Link to={`/items/${claim.item._id}`}>
                            <strong>{claim.item.title}</strong>
                          </Link>
                        ) : (
                          <em>Item Removed</em>
                        )}
                      </td>
                      <td>{claim.message}</td>
                      <td>{claim.proofDetails}</td>
                      <td>
                        <span className={`badge badge-claim-${claim.status}`}>
                          {claim.status}
                        </span>
                      </td>
                      <td>{formatDate(claim.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}

      {/* Tab 3: Claims Received on My Items */}
      {activeTab === "received" && (
        <section className="dashboard-section">
          {claimsReceived.length === 0 ? (
            <div className="empty-tab-box">
              <p>No claims have been submitted on your reported items yet.</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Target Item</th>
                    <th>Claimant Name</th>
                    <th>Claim Message</th>
                    <th>Proof Details</th>
                    <th>Status</th>
                    <th>Claimant Contact (When Approved)</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {claimsReceived.map((claim) => {
                    const isPending = claim.status === CLAIM_STATUS.PENDING;
                    const isApproved = claim.status === CLAIM_STATUS.APPROVED;

                    return (
                      <tr key={claim._id}>
                        <td>
                          {claim.item ? (
                            <Link to={`/items/${claim.item._id}`}>
                              <strong>{claim.item.title}</strong>
                            </Link>
                          ) : (
                            <em>Item Removed</em>
                          )}
                        </td>
                        <td>{claim.claimant?.name || "Unknown User"}</td>
                        <td>{claim.message}</td>
                        <td>{claim.proofDetails}</td>
                        <td>
                          <span className={`badge badge-claim-${claim.status}`}>
                            {claim.status}
                          </span>
                        </td>
                        <td>
                          {isApproved && claim.claimant ? (
                            <div className="contact-revealed">
                              <div>📧 {claim.claimant.email || "N/A"}</div>
                              <div>📞 {claim.claimant.phone || "Not provided"}</div>
                            </div>
                          ) : (
                            <span className="text-muted">🔒 Hidden until approved</span>
                          )}
                        </td>
                        <td>
                          {isPending ? (
                            <div className="claim-decide-buttons">
                              <button
                                onClick={() => handleDecideClaim(claim._id, "approved")}
                                className="btn-approve"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => handleDecideClaim(claim._id, "rejected")}
                                className="btn-reject"
                              >
                                Reject
                              </button>
                            </div>
                          ) : (
                            <span className="text-muted">Completed</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}
    </div>
  );
}

