import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import itemService from "../services/itemService";
import claimService from "../services/claimService";
import { useAuth } from "../context/AuthContext";
import Loader from "../components/Loader";
import Alert from "../components/Alert";
import { ITEM_TYPES, ITEM_STATUS, CATEGORIES } from "../constants";
import { PLACEHOLDER_ITEM_IMAGE } from "../constants/assets";
import { formatDate } from "../utils/formatters";

export default function ItemDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Claim form state
  const [claimMessage, setClaimMessage] = useState("");
  const [proofDetails, setProofDetails] = useState("");
  const [submittingClaim, setSubmittingClaim] = useState(false);

  // Edit mode state
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    title: "",
    description: "",
    category: "",
    location: "",
    status: ITEM_STATUS.OPEN,
  });

  const fetchItem = async () => {
    try {
      setLoading(true);
      const data = await itemService.getItemById(id);
      setItem(data);
      setEditForm({
        title: data.title,
        description: data.description,
        category: data.category,
        location: data.location,
        status: data.status,
      });
    } catch (err) {
      setError(err.response?.data?.message || "Item not found");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItem();
  }, [id]);

  // Handle claim submission
  const handleClaimSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!claimMessage.trim() || !proofDetails.trim()) {
      setError("Please fill out both the message and proof details.");
      return;
    }

    try {
      setSubmittingClaim(true);
      await claimService.createClaim(id, {
        message: claimMessage,
        proofDetails,
      });
      setSuccess("Your claim has been submitted successfully! The reporter will review it.");
      setClaimMessage("");
      setProofDetails("");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to submit claim.");
    } finally {
      setSubmittingClaim(false);
    }
  };

  // Handle item deletion (owner or admin)
  const handleDeleteItem = async () => {
    const confirmed = window.confirm("Are you sure you want to delete this listing?");
    if (!confirmed) return;

    try {
      await itemService.deleteItem(id);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Could not delete item.");
    }
  };

  // Handle item update by owner
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const updated = await itemService.updateItem(id, editForm);
      setItem(updated);
      setIsEditing(false);
      setSuccess("Item details updated successfully.");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update item.");
    }
  };

  if (loading) return <Loader text="Loading item details..." />;
  if (error && !item) return <div className="page-container"><Alert type="error" message={error} /></div>;
  if (!item) return null;

  const isOwner = Boolean(
    user && item.reportedBy && (item.reportedBy._id === user.id || item.reportedBy === user.id)
  );
  const isLost = item.type === ITEM_TYPES.LOST;
  const isReturned = item.status === ITEM_STATUS.RETURNED;

  return (
    <div className="page-container">
      {error && <Alert type="error" message={error} onClose={() => setError("")} />}
      {success && <Alert type="success" message={success} onClose={() => setSuccess("")} />}

      <div className="item-detail-layout">
        {/* Left Column: Image */}
        <div className="detail-image-wrap">
          <img
            src={item.imageUrl || PLACEHOLDER_ITEM_IMAGE}
            alt={item.title}
            className="detail-image"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = PLACEHOLDER_ITEM_IMAGE;
            }}
          />
        </div>

        {/* Right Column: Info & Actions */}
        <div className="detail-info-wrap">
          <div className="detail-header-badges">
            <span className={`badge ${isLost ? "badge-lost" : "badge-found"}`}>
              {isLost ? "Lost Item" : "Found Item"}
            </span>
            <span className={`badge ${isReturned ? "badge-returned" : "badge-open"}`}>
              {isReturned ? "Returned / Resolved" : "Open Listing"}
            </span>
          </div>

          {!isEditing ? (
            <>
              <h1 className="detail-title">{item.title}</h1>

              <div className="detail-meta-list">
                <div className="detail-meta-item">
                  <strong>📁 Category:</strong> {item.category}
                </div>
                <div className="detail-meta-item">
                  <strong>📍 Location:</strong> {item.location}
                </div>
                <div className="detail-meta-item">
                  <strong>📅 Date of Event:</strong> {formatDate(item.dateOfEvent, { month: "long" })}
                </div>
                <div className="detail-meta-item">
                  <strong>👤 Reported By:</strong> {item.reportedBy?.name || "Campus User"}
                </div>
              </div>

              <div className="detail-desc-box">
                <h3>Description</h3>
                <p>{item.description}</p>
              </div>

              {/* Owner Actions */}
              {isOwner && (
                <div className="owner-action-bar">
                  <button onClick={() => setIsEditing(true)} className="btn btn-secondary">
                    ✏️ Edit Details
                  </button>
                  <button onClick={handleDeleteItem} className="btn btn-danger">
                    🗑️ Delete Listing
                  </button>
                </div>
              )}
            </>
          ) : (
            /* Inline Edit Form for Owner */
            <form onSubmit={handleEditSubmit} className="edit-item-form">
              <h3>Edit Item Details</h3>
              <div className="form-group">
                <label className="form-label">Title</label>
                <input
                  type="text"
                  value={editForm.title}
                  onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                  required
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Category</label>
                <select
                  value={editForm.category}
                  onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                  className="form-input"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Location</label>
                <input
                  type="text"
                  value={editForm.location}
                  onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                  required
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea
                  rows={4}
                  value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  required
                  className="form-textarea"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Status</label>
                <select
                  value={editForm.status}
                  onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                  className="form-input"
                >
                  <option value={ITEM_STATUS.OPEN}>Open</option>
                  <option value={ITEM_STATUS.RETURNED}>Returned</option>
                </select>
              </div>

              <div className="form-actions-inline">
                <button type="submit" className="btn btn-submit">Save Changes</button>
                <button type="button" onClick={() => setIsEditing(false)} className="btn btn-cancel">Cancel</button>
              </div>
            </form>
          )}

          {/* Claim Section: When user is not the reporter */}
          {!isOwner && (
            <div className="claim-box-wrapper">
              {isReturned ? (
                <div className="notice-returned">
                  ✅ This item has already been claimed and marked as returned.
                </div>
              ) : user ? (
                <div className="claim-form-card">
                  <h3>Is this item yours? Submit a Claim</h3>
                  <p className="claim-sub">
                    Provide identifiable details that only the real owner would know (e.g., wallpaper, serial number, bag contents).
                  </p>
                  <form onSubmit={handleClaimSubmit}>
                    <div className="form-group">
                      <label className="form-label">Message to Reporter *</label>
                      <input
                        type="text"
                        placeholder="e.g., Hello, this is my lost wallet!"
                        value={claimMessage}
                        onChange={(e) => setClaimMessage(e.target.value)}
                        required
                        className="form-input"
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Identifying Proof Details *</label>
                      <textarea
                        rows={3}
                        placeholder="e.g., Key in side pocket, scratch on top left, student ID ending in 009..."
                        value={proofDetails}
                        onChange={(e) => setProofDetails(e.target.value)}
                        required
                        className="form-textarea"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={submittingClaim}
                      className="btn btn-claim"
                    >
                      {submittingClaim ? "Submitting Claim..." : "Submit Claim"}
                    </button>
                  </form>
                </div>
              ) : (
                <div className="login-to-claim-box">
                  <p>Recognize this item? Log in to your campus account to submit a claim.</p>
                  <Link to="/login" className="btn btn-login-cta">
                    Login to Claim This Item
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

