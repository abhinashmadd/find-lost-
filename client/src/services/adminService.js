import api from "./api";

/**
 * Service encapsulating administrative moderation operations.
 */
export const adminService = {
  /**
   * Fetch all system items across all statuses.
   * @returns {Promise<Array>} List of items
   */
  async getAllItems() {
    const response = await api.get("/admin/items");
    return response.data;
  },

  /**
   * Fetch all registered users.
   * @returns {Promise<Array>} List of users
   */
  async getUsers() {
    const response = await api.get("/admin/users");
    return response.data;
  },

  /**
   * Deactivate a user account.
   * @param {string} userId - User ID
   * @returns {Promise<Object>} Updated user info
   */
  async deactivateUser(userId) {
    const response = await api.patch(`/admin/users/${userId}/deactivate`);
    return response.data;
  },

  /**
   * Re-activate a deactivated user account.
   * @param {string} userId - User ID
   * @returns {Promise<Object>} Updated user info
   */
  async activateUser(userId) {
    const response = await api.patch(`/admin/users/${userId}/activate`);
    return response.data;
  },
};

export default adminService;
