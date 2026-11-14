/**
 * Standardized Domain Enums and Constants for Backend Server.
 */

const ITEM_TYPES = Object.freeze({
  LOST: "lost",
  FOUND: "found",
});

const ITEM_STATUS = Object.freeze({
  OPEN: "open",
  RETURNED: "returned",
});

const CLAIM_STATUS = Object.freeze({
  PENDING: "pending",
  APPROVED: "approved",
  REJECTED: "rejected",
});

const USER_ROLES = Object.freeze({
  USER: "user",
  ADMIN: "admin",
});

const CATEGORIES = Object.freeze([
  "Electronics",
  "Documents",
  "Accessories",
  "Books",
  "Bags",
  "Keys",
  "Clothing",
  "Other",
]);

module.exports = {
  ITEM_TYPES,
  ITEM_STATUS,
  CLAIM_STATUS,
  USER_ROLES,
  CATEGORIES,
};

