const { param } = require("express-validator");
const mongoose = require("mongoose");
const validate = require("./validate");

/**
 * Validates that a route parameter matches the MongoDB ObjectId format.
 * @param {string} paramName - Name of parameter in req.params (defaults to "id")
 * @param {string} entityName - Entity name for human-readable error messages
 */
const validateMongoId = (paramName = "id", entityName = "item ID") => [
  param(paramName)
    .custom((value) => mongoose.Types.ObjectId.isValid(value))
    .withMessage(`Invalid ${entityName} format`),
  validate,
];

module.exports = { validateMongoId };
