import React, { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import itemService from "../services/itemService";
import Alert from "../components/Alert";
import { CATEGORIES, ITEM_TYPES } from "../constants";

export default function ReportItem() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialType = searchParams.get("type") === ITEM_TYPES.FOUND ? ITEM_TYPES.FOUND : ITEM_TYPES.LOST;

  const [form, setForm] = useState({
    type: initialType,
    title: "",
    description: "",
    category: CATEGORIES[0],
    location: "",
    dateOfEvent: new Date().toISOString().split("T")[0],
  });

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file size in browser (max 2 MB)
      if (file.size > 2 * 1024 * 1024) {
        setError("Image size must be less than 2 MB");
        return;
      }
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      setError("");
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Browser-level validation
    if (!form.title.trim()) {
      setError("Title is required");
      return;
    }
    if (!form.description.trim()) {
      setError("Description is required");
      return;
    }
    if (!form.location.trim()) {
      setError("Location is required");
      return;
    }
    if (!form.dateOfEvent) {
      setError("Date of event is required");
      return;
    }

    try {
      setLoading(true);
      const data = new FormData();
      Object.entries(form).forEach(([key, value]) => {
        data.append(key, value);
      });

      if (imageFile) {
        data.append("image", imageFile);
      }

      await itemService.createItem(data);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Could not save the item");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-container">
      <div className="form-card">
        <h2>Report an Item</h2>
        <p className="form-subtitle">
          Provide accurate details so the item can be identified and recovered.
        </p>

        {error && <Alert type="error" message={error} onClose={() => setError("")} />}

        <form onSubmit={handleSubmit} className="form-body">
          {/* Item Type: Lost or Found */}
          <div className="form-group">
            <label className="form-label">Report Type</label>
            <div className="radio-group">
              <label className={`radio-label ${form.type === "lost" ? "selected" : ""}`}>
                <input
                  type="radio"
                  name="type"
                  value="lost"
                  checked={form.type === "lost"}
                  onChange={handleChange}
                />
                🔴 Lost Item (I lost it)
              </label>

              <label className={`radio-label ${form.type === "found" ? "selected" : ""}`}>
                <input
                  type="radio"
                  name="type"
                  value="found"
                  checked={form.type === "found"}
                  onChange={handleChange}
                />
                🟢 Found Item (I found it)
              </label>
            </div>
          </div>

          {/* Title */}
          <div className="form-group">
            <label className="form-label" htmlFor="title">
              Item Title *
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="e.g., Black Leather Wallet, Dell Laptop Charger"
              maxLength={100}
              required
              className="form-input"
            />
          </div>

          {/* Category & Date */}
          <div className="form-row">
            <div className="form-group form-col">
              <label className="form-label" htmlFor="category">
                Category *
              </label>
              <select
                id="category"
                name="category"
                value={form.category}
                onChange={handleChange}
                className="form-input"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group form-col">
              <label className="form-label" htmlFor="dateOfEvent">
                Date of Event *
              </label>
              <input
                type="date"
                id="dateOfEvent"
                name="dateOfEvent"
                value={form.dateOfEvent}
                onChange={handleChange}
                required
                className="form-input"
              />
            </div>
          </div>

          {/* Location */}
          <div className="form-group">
            <label className="form-label" htmlFor="location">
              Location *
            </label>
            <input
              type="text"
              id="location"
              name="location"
              value={form.location}
              onChange={handleChange}
              placeholder="e.g., Library 2nd floor, Canteen counter, Audi Lab 3"
              required
              className="form-input"
            />
          </div>

          {/* Description */}
          <div className="form-group">
            <label className="form-label" htmlFor="description">
              Detailed Description *
            </label>
            <textarea
              id="description"
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={4}
              placeholder="Describe color, brand, unique marks, stickers or identifying features..."
              maxLength={1000}
              required
              className="form-textarea"
            />
          </div>

          {/* Photograph Upload with Preview */}
          <div className="form-group">
            <label className="form-label">Item Photo (Optional, Max 2MB)</label>
            <input
              type="file"
              accept=".jpg,.jpeg,.png,.webp"
              onChange={handleImageChange}
              className="file-input"
            />
            {imagePreview && (
              <div className="image-preview-wrapper">
                <img src={imagePreview} alt="Preview" className="image-preview" />
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="btn-remove-preview"
                >
                  Remove Photo
                </button>
              </div>
            )}
          </div>

          <button type="submit" disabled={loading} className="btn btn-submit">
            {loading ? "Submitting Report..." : "Submit Report"}
          </button>
        </form>
      </div>
    </div>
  );
}

