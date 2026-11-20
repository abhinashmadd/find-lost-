const validate = require("./validate");
const { validateMongoId } = require("./paramValidator");
const { registerRules, loginRules } = require("./authValidator");
const { createItemRules, updateItemRules } = require("./itemValidator");
const { createClaimRules, decideClaimRules } = require("./claimValidator");

module.exports = {
  validate,
  validateMongoId,
  registerRules,
  loginRules,
  createItemRules,
  updateItemRules,
  createClaimRules,
  decideClaimRules,
};
