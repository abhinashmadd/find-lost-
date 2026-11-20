const { check } = require("express-validator");
const validate = require("./validate");
const { CLAIM_STATUS } = require("../constants");

/**
 * Validation rules for submitting an ownership claim.
 */
const createClaimRules = [
  check(["message", "proofDetails"])
    .notEmpty()
    .withMessage("Message and proof details are required"),
  validate,
];

/**
 * Validation rules for resolving an ownership claim (approval/rejection).
 */
const decideClaimRules = [
  check("decision")
    .notEmpty()
    .withMessage("Decision must be either 'approved' or 'rejected'")
    .isIn([CLAIM_STATUS.APPROVED, CLAIM_STATUS.REJECTED])
    .withMessage("Decision must be either 'approved' or 'rejected'"),
  validate,
];

module.exports = {
  createClaimRules,
  decideClaimRules,
};
