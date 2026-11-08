const mongoose = require("mongoose");
const { getIsMongoConnected } = require("../config/db");
const localDb = require("../config/localDb");

const claimSchema = new mongoose.Schema(
  {
    item: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Item",
      required: true,
    },
    claimant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    proofDetails: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
  },
  { timestamps: true }
);

const MongooseClaim = mongoose.models.Claim || mongoose.model("Claim", claimSchema);

// Proxy that routes to Mongoose if MongoDB is connected, or to local JSON db if offline
const ClaimProxy = new Proxy(MongooseClaim, {
  get(target, prop) {
    if (getIsMongoConnected()) {
      return target[prop];
    }
    const localCollection = localDb.claims;
    if (typeof localCollection[prop] === "function") {
      return localCollection[prop].bind(localCollection);
    }
    return localCollection[prop] !== undefined ? localCollection[prop] : target[prop];
  },
});

module.exports = ClaimProxy;
