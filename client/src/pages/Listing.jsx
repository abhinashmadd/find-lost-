import React, { useState } from "react";
import ItemCard from "../components/ItemCard";
import Loader from "../components/Loader";
import Alert from "../components/Alert";
import useDebounce from "../hooks/useDebounce";
import useItems from "../hooks/useItems";

export default function Listing() {
  // Filter state
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [page, setPage] = useState(1);

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

  // Decoupled debouncing via custom hook
  const debouncedSearch = useDebounce(searchTerm, 500);

  // Decoupled items query via custom hook
  const {
    items,
    totalItems,
    totalPages,
    loading,
    error,
  } = useItems({
    q: debouncedSearch,
    type: selectedType,
    category: selectedCategory,
    status: "open",
    page,
    limit: 12,
  });

  const handleResetFilters = () => {
    setSearchTerm("");
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
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPage(1);
            }}
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
