import api from "./api";

/**
 * Service encapsulating all Claim-related HTTP operations.
 * Decouples claim submission, privacy-masked retrieval, and approval decisions from UI.
 */
export const claimService = {
  /**
   * Submit an ownership claim for an item.
   * @param {string} itemId - Target item ID
   * @param {Object} claimData - { message, proofDetails }
   * @returns {Promise<Object>} Created claim document
   */
  async createClaim(itemId, claimData) {
    const response = await api.post(`/items/${itemId}/claims`, claimData);
    return response.data;
  },

  /**
   * Fetch claims submitted by the current user and claims received on user's items.
   * @returns {Promise<Object>} { made: [...], received: [...] }
   */
  async getMyClaims() {
    const response = await api.get("/claims/mine");
    return response.data;
  },

  /**
   * Approve or reject a claim (reporter only).
   * @param {string} claimId - Target claim ID
   * @param {'approved' | 'rejected'} decision - Decision string
   * @returns {Promise<Object>} Updated claim document
   */
  async decideClaim(claimId, decision) {
    const response = await api.patch(`/claims/${claimId}`, { decision });
    return response.data;
  },
};

export default claimService;
