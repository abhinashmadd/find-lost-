/**
 * Centralized Domain Constants & Enums for Client Application.
 * Standardizes naming conventions across all pages, services, and components.
 */

export const ITEM_TYPES = Object.freeze({
  LOST: "lost",
  FOUND: "found",
});

export const ITEM_STATUS = Object.freeze({
  OPEN: "open",
  RETURNED: "returned",
});

export const CLAIM_STATUS = Object.freeze({
  PENDING: "pending",
  APPROVED: "approved",
  REJECTED: "rejected",
});

export const USER_ROLES = Object.freeze({
  USER: "user",
  ADMIN: "admin",
});

export const CATEGORIES = Object.freeze([
  "Electronics",
  "Documents",
  "Accessories",
  "Books",
  "Bags",
  "Keys",
  "Clothing",
  "Other",
]);

