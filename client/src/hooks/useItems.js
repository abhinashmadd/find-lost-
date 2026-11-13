import { useState, useEffect, useCallback } from "react";
import itemService from "../services/itemService";

/**
 * Custom hook to manage fetching and filtering item listings.
 * Decouples state and lifecycle management from UI components.
 * @param {Object} queryParams - { q, type, category, status, page, limit, reportedBy }
 * @param {boolean} autoFetch - Whether to trigger fetch on mount / param change
 * @returns {Object} { items, totalItems, totalPages, loading, error, refetch }
 */
export function useItems(queryParams = {}, autoFetch = true) {
  const [items, setItems] = useState([]);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const { q, type, category, status, page, limit, reportedBy } = queryParams;

  const fetchItems = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const data = await itemService.listItems({
        q,
        type,
        category,
        status: status || "open",
        page: page || 1,
        limit: limit || 12,
        reportedBy,
      });

      setItems(data.items || []);
      setTotalItems(data.total || 0);
      setTotalPages(data.pages || 1);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load items");
    } finally {
      setLoading(false);
    }
  }, [q, type, category, status, page, limit, reportedBy]);

  useEffect(() => {
    if (autoFetch) {
      fetchItems();
    }
  }, [fetchItems, autoFetch]);

  return {
    items,
    setItems,
    totalItems,
    totalPages,
    loading,
    error,
    refetch: fetchItems,
  };
}

export default useItems;
