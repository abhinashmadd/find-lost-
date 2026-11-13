import api from "./api";

/**
 * Service encapsulating user authentication and profile HTTP operations.
 */
export const authService = {
  /**
   * Fetch current authenticated user's profile.
   * @returns {Promise<Object>} User profile object
   */
  async getMe() {
    const response = await api.get("/auth/me");
    return response.data;
  },

  /**
   * Authenticate user with credentials.
   * @param {string} email
   * @param {string} password
   * @returns {Promise<{token: string, user: Object}>} Token and user payload
   */
  async login(email, password) {
    const response = await api.post("/auth/login", { email, password });
    return response.data;
  },

  /**
   * Register a new user account.
   * @param {Object} userData - { name, email, password, phone }
   * @returns {Promise<Object>} Registration response
   */
  async register(userData) {
    const response = await api.post("/auth/register", userData);
    return response.data;
  },
};

export default authService;
