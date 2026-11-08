const mongoose = require("mongoose");
const { getIsMongoConnected } = require("../config/db");
const localDb = require("../config/localDb");

const itemSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["lost", "found"],
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    description: {
      type: String,
      required: true,
      maxlength: 1000,
    },
    category: {
      type: String,
      required: true,
    },
    location: {
      type: String,
      required: true,
    },
    dateOfEvent: {
      type: Date,
      required: true,
    },
    imageUrl: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      enum: ["open", "returned"],
      default: "open",
    },
    reportedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

itemSchema.index({ title: "text", description: "text", location: "text" });

const MongooseItem = mongoose.models.Item || mongoose.model("Item", itemSchema);

// Proxy that routes to Mongoose if MongoDB is connected, or to local JSON db if offline
const ItemProxy = new Proxy(MongooseItem, {
  get(target, prop) {
    if (getIsMongoConnected()) {
      return target[prop];
    }
    const localCollection = localDb.items;
    if (typeof localCollection[prop] === "function") {
      return localCollection[prop].bind(localCollection);
    }
    return localCollection[prop] !== undefined ? localCollection[prop] : target[prop];
  },
});

module.exports = ItemProxy;
