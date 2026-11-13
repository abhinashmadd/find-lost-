import api from "./api";

/**
 * Service encapsulating all Item-related HTTP operations.
 * Decouples network logic and query string formatting from UI components.
 */
export const itemService = {
  /**
   * Fetch paginated and filtered items.
   * @param {Object} params - Query parameters (q, type, category, status, page, limit, reportedBy)
   * @returns {Promise<Object>} API response data with items, total, page, pages
   */
  async listItems(params = {}) {
    const query = new URLSearchParams();
    
    if (params.status) query.append("status", params.status);
    if (params.page) query.append("page", params.page);
    if (params.limit) query.append("limit", params.limit);
    if (params.q && params.q.trim()) query.append("q", params.q.trim());
    if (params.type) query.append("type", params.type);
    if (params.category) query.append("category", params.category);
    if (params.reportedBy) query.append("reportedBy", params.reportedBy);

    const queryString = query.toString();
    const url = queryString ? `/items?${queryString}` : "/items";
    const response = await api.get(url);
    return response.data;
  },

  /**
   * Fetch single item details by ID.
   * @param {string} id - Item ID
   * @returns {Promise<Object>} Item document
   */
  async getItemById(id) {
    const response = await api.get(`/items/${id}`);
    return response.data;
  },

  /**
   * Submit a new lost or found item report with optional image.
   * @param {FormData} formData - Multi-part form data
   * @returns {Promise<Object>} Created item document
   */
  async createItem(formData) {
    const response = await api.post("/items", formData);
    return response.data;
  },

  /**
   * Update an existing item report (owner only).
   * @param {string} id - Item ID
   * @param {Object} updateData - Updated item fields
   * @returns {Promise<Object>} Updated item document
   */
  async updateItem(id, updateData) {
    const response = await api.put(`/items/${id}`, updateData);
    return response.data;
  },

  /**
   * Delete an item listing (owner or admin).
   * @param {string} id - Item ID
   * @returns {Promise<Object>} Success message
   */
  async deleteItem(id) {
    const response = await api.delete(`/items/${id}`);
    return response.data;
  },
};

export default itemService;
