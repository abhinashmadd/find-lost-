const mongoose = require("mongoose");
const { getIsMongoConnected } = require("../config/db");
const localDb = require("../config/localDb");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    phone: {
      type: String,
      default: "",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

const MongooseUser = mongoose.models.User || mongoose.model("User", userSchema);

// Proxy that routes to Mongoose if MongoDB is connected, or to local JSON db if offline
const UserProxy = new Proxy(MongooseUser, {
  get(target, prop) {
    if (getIsMongoConnected()) {
      return target[prop];
    }
    const localCollection = localDb.users;
    if (typeof localCollection[prop] === "function") {
      return localCollection[prop].bind(localCollection);
    }
    return localCollection[prop] !== undefined ? localCollection[prop] : target[prop];
  },
});

module.exports = UserProxy;
