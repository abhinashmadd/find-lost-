import React, { useState, useEffect } from "react";
import api from "../services/api";
import ItemCard from "../components/ItemCard";
import Loader from "../components/Loader";
import Alert from "../components/Alert";

export default function Listing() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Search & filter state
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const categories = [
    "Electronics",
    "Documents",
    "Accessories",
    "Books",
    "Bags",
    "Keys",
    "Clothing",
    "Other",
  ];

  // 500 ms debounce for search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPage(1); // Reset to first page on search query change
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Fetch items whenever search, type, category, or page changes
  useEffect(() => {
    const fetchItems = async () => {
      try {
        setLoading(true);
        setError("");

        const params = new URLSearchParams();
        params.append("status", "open");
        params.append("page", page);
        params.append("limit", "12");

        if (debouncedSearch.trim()) params.append("q", debouncedSearch.trim());
        if (selectedType) params.append("type", selectedType);
        if (selectedCategory) params.append("category", selectedCategory);

        const response = await api.get(`/items?${params.toString()}`);
        setItems(response.data.items || []);
        setTotalPages(response.data.pages || 1);
        setTotalItems(response.data.total || 0);
      } catch (err) {
        setError(err.response?.data?.message || "Error loading items");
      } finally {
        setLoading(false);
      }
    };

    fetchItems();
  }, [debouncedSearch, selectedType, selectedCategory, page]);

  const handleResetFilters = () => {
    setSearchTerm("");
    setDebouncedSearch("");
    setSelectedType("");
    setSelectedCategory("");
    setPage(1);
  };

  return (
    <div className="listing-page">
      <div className="listing-header">
        <h2>Browse Campus Listings</h2>
        <p className="listing-sub">
          Search by keyword or filter by category and item status. Total items: {totalItems}
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="filter-card">
        <div className="search-input-wrap">
          <input
            type="text"
            placeholder="Search by title, description or location..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="filter-controls">
          <select
            value={selectedType}
            onChange={(e) => {
              setSelectedType(e.target.value);
              setPage(1);
            }}
            className="filter-select"
          >
            <option value="">All Types (Lost & Found)</option>
            <option value="lost">Lost Items Only</option>
            <option value="found">Found Items Only</option>
          </select>

          <select
            value={selectedCategory}
            onChange={(e) => {
              setSelectedCategory(e.target.value);
              setPage(1);
            }}
            className="filter-select"
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          {(searchTerm || selectedType || selectedCategory) && (
            <button onClick={handleResetFilters} className="btn-reset-filters">
              Clear Filters
            </button>
          )}
        </div>
      </div>

      {error && <Alert type="error" message={error} />}

      {/* Content Area */}
      {loading ? (
        <Loader text="Searching listings..." />
      ) : items.length > 0 ? (
        <>
          <div className="items-grid">
            {items.map((item) => (
              <ItemCard key={item._id} item={item} />
            ))}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="pagination">
              <button
                className="btn-page"
                onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                disabled={page === 1}
              >
                &larr; Previous
              </button>
              <span className="page-indicator">
                Page {page} of {totalPages}
              </span>
              <button
                className="btn-page"
                onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={page === totalPages}
              >
                Next &rarr;
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="no-items-card">
          <span className="no-items-icon">🔎</span>
          <h3>No items found</h3>
          <p>Try refining your search keyword or clearing the filters.</p>
        </div>
      )}
    </div>
  );
}

