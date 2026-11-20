const { check } = require("express-validator");
const validate = require("./validate");
const { ITEM_TYPES, ITEM_STATUS } = require("../constants");

/**
 * Validation rules for creating a new item report.
 */
const createItemRules = [
  check(["type", "title", "description", "category", "location", "dateOfEvent"])
    .notEmpty()
    .withMessage("All required fields must be provided"),
  check("type")
    .isIn(Object.values(ITEM_TYPES))
    .withMessage("Type must be either 'lost' or 'found'"),
  validate,
];

/**
 * Validation rules for updating an existing item report.
 */
const updateItemRules = [
  check("type")
    .optional()
    .isIn(Object.values(ITEM_TYPES))
    .withMessage("Type must be either 'lost' or 'found'"),
  check("status")
    .optional()
    .isIn([ITEM_STATUS.OPEN, ITEM_STATUS.RETURNED])
    .withMessage("Status must be either 'open' or 'returned'"),
  validate,
];

module.exports = {
  createItemRules,
  updateItemRules,
};
