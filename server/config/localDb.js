const fs = require("fs");
const path = require("path");
const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");

const dataDir = path.join(__dirname, "../data");

// Helper to sanitize document before saving to disk (un-populate references)
const sanitizeDocForSave = (doc) => {
  if (!doc) return doc;
  const clean = { ...doc };
  delete clean.save;
  delete clean.toObject;
  if (clean.item && typeof clean.item === "object" && clean.item._id) {
    clean.item = clean.item._id;
  }
  if (clean.claimant && typeof clean.claimant === "object" && clean.claimant._id) {
    clean.claimant = clean.claimant._id;
  }
  if (clean.reportedBy && typeof clean.reportedBy === "object" && clean.reportedBy._id) {
    clean.reportedBy = clean.reportedBy._id;
  }
  return clean;
};

// Helper to wrap a plain document with Mongoose-like methods (.save, .toObject)
const wrapDocument = (doc, collection) => {
  if (!doc) return null;

  const wrapped = { ...doc };

  wrapped.save = async function () {
    this.updatedAt = new Date();
    await collection.updateById(this._id, sanitizeDocForSave(this));
    return this;
  };

  wrapped.toObject = function () {
    const copy = { ...this };
    delete copy.save;
    delete copy.toObject;
    return copy;
  };

  return wrapped;
};

// Generic Collection class mimicking Mongoose Model API backed by a JSON file
class LocalCollection {
  constructor(name) {
    this.name = name;
    this.filePath = path.join(dataDir, `${name}.json`);
    this.ensureFile();
  }

  ensureFile() {
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    if (!fs.existsSync(this.filePath)) {
      fs.writeFileSync(this.filePath, JSON.stringify([], null, 2));
    }
  }

  read() {
    try {
      this.ensureFile();
      const content = fs.readFileSync(this.filePath, "utf-8");
      return JSON.parse(content || "[]");
    } catch {
      return [];
    }
  }

  write(data) {
    this.ensureFile();
    fs.writeFileSync(this.filePath, JSON.stringify(data, null, 2));
  }

  async create(data) {
    const records = this.read();
    const id = new mongoose.Types.ObjectId().toString();
    const now = new Date();
    const defaults = {};
    if (this.name === "items") {
      defaults.status = "open";
      defaults.imageUrl = "";
    } else if (this.name === "claims") {
      defaults.status = "pending";
    } else if (this.name === "users") {
      defaults.role = "user";
      defaults.phone = "";
      defaults.isActive = true;
    }
    const newDoc = {
      _id: id,
      ...defaults,
      ...data,
      createdAt: now,
      updatedAt: now,
    };
    records.push(newDoc);
    this.write(records);
    return wrapDocument(newDoc, this);
  }

  async findOne(query = {}) {
    const records = this.read();
    const match = records.find((item) => this.matchQuery(item, query));
    return match ? wrapDocument(match, this) : null;
  }

  findById(id) {
    const records = this.read();
    const match = records.find((item) => String(item._id) === String(id));
    const wrapped = match ? wrapDocument(match, this) : null;

    // Chainable query helper supporting .select() and .populate()
    const queryChain = {
      _doc: wrapped,
      select: function (fields) {
        if (wrapped && fields.includes("-passwordHash")) {
          delete wrapped.passwordHash;
        }
        return this;
      },
      populate: function (field) {
        if (wrapped && field === "reportedBy" && wrapped.reportedBy) {
          const users = new LocalCollection("users").read();
          const user = users.find((u) => String(u._id) === String(wrapped.reportedBy));
          wrapped.reportedBy = user ? { _id: user._id, name: user.name, email: user.email } : null;
        }
        if (wrapped && field === "item" && wrapped.item) {
          const items = new LocalCollection("items").read();
          const item = items.find((i) => String(i._id) === String(wrapped.item));
          wrapped.item = item ? wrapDocument(item, new LocalCollection("items")) : null;
        }
        return this;
      },
      then: function (resolve, reject) {
        return Promise.resolve(this._doc).then(resolve, reject);
      },
    };

    return queryChain;
  }

  async findByIdAndUpdate(id, update) {
    const records = this.read();
    const index = records.findIndex((item) => String(item._id) === String(id));
    if (index === -1) return null;

    records[index] = {
      ...records[index],
      ...update,
      updatedAt: new Date(),
    };
    this.write(records);
    return wrapDocument(records[index], this);
  }

  async findByIdAndDelete(id) {
    const records = this.read();
    const index = records.findIndex((item) => String(item._id) === String(id));
    if (index === -1) return null;

    const [deleted] = records.splice(index, 1);
    this.write(records);
    return wrapDocument(deleted, this);
  }

  async updateById(id, updatedDoc) {
    const records = this.read();
    const index = records.findIndex((item) => String(item._id) === String(id));
    if (index !== -1) {
      records[index] = { ...records[index], ...sanitizeDocForSave(updatedDoc), updatedAt: new Date() };
      this.write(records);
    }
  }

  async countDocuments(filter = {}) {
    const records = this.read();
    const matched = records.filter((item) => this.matchQuery(item, filter));
    return matched.length;
  }

  async updateMany(filter = {}, update = {}) {
    const records = this.read();
    let updatedCount = 0;
    const appliedUpdate = update.$set ? { ...update.$set } : { ...update };
    const newRecords = records.map((item) => {
      if (this.matchQuery(item, filter)) {
        updatedCount++;
        return { ...item, ...appliedUpdate, updatedAt: new Date() };
      }
      return item;
    });
    this.write(newRecords);
    return { modifiedCount: updatedCount };
  }

  find(filter = {}) {
    let results = this.read().filter((item) => this.matchQuery(item, filter));

    const queryObj = {
      _results: results,
      _collection: this,

      sort: function (sortObj) {
        if (sortObj && sortObj.createdAt === -1) {
          this._results.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        }
        return this;
      },

      skip: function (num) {
        this._results = this._results.slice(num);
        return this;
      },

      limit: function (num) {
        this._results = this._results.slice(0, num);
        return this;
      },

      select: function (fields) {
        if (fields.includes("-passwordHash")) {
          this._results = this._results.map((item) => {
            const copy = { ...item };
            delete copy.passwordHash;
            return copy;
          });
        }
        return this;
      },

      populate: function (field, selectFields = "") {
        if (field === "reportedBy") {
          const users = new LocalCollection("users").read();
          this._results = this._results.map((item) => {
            const user = users.find((u) => String(u._id) === String(item.reportedBy));
            const rep = user
              ? selectFields.includes("email")
                ? { _id: user._id, name: user.name, email: user.email }
                : { _id: user._id, name: user.name }
              : null;
            return { ...item, reportedBy: rep };
          });
        } else if (field === "item") {
          const items = new LocalCollection("items").read();
          this._results = this._results.map((claim) => {
            const itId = claim.item && typeof claim.item === "object" && claim.item._id ? claim.item._id : claim.item;
            const item = items.find((i) => String(i._id) === String(itId));
            return { ...claim, item: item || null };
          });
        } else if (field === "claimant") {
          const users = new LocalCollection("users").read();
          this._results = this._results.map((claim) => {
            const cId = claim.claimant && typeof claim.claimant === "object" && claim.claimant._id ? claim.claimant._id : claim.claimant;
            const user = users.find((u) => String(u._id) === String(cId));
            const claimantObj = user
              ? { _id: user._id, name: user.name, email: user.email, phone: user.phone }
              : null;
            return { ...claim, claimant: claimantObj };
          });
        }
        return this;
      },

      then: function (resolve, reject) {
        const wrappedList = this._results.map((doc) => wrapDocument(doc, this._collection));
        return Promise.resolve(wrappedList).then(resolve, reject);
      },
    };

    return queryObj;
  }

  matchQuery(item, query) {
    for (const [key, val] of Object.entries(query)) {
      if (key === "$text" && val && val.$search) {
        const searchTerm = val.$search.toLowerCase();
        const inTitle = item.title && item.title.toLowerCase().includes(searchTerm);
        const inDesc = item.description && item.description.toLowerCase().includes(searchTerm);
        const inLoc = item.location && item.location.toLowerCase().includes(searchTerm);
        if (!inTitle && !inDesc && !inLoc) return false;
      } else if (key === "item" && typeof val === "object" && val.$in) {
        const idList = val.$in.map(String);
        const itemVal = item.item && typeof item.item === "object" && item.item._id ? item.item._id : item.item;
        if (!idList.includes(String(itemVal))) return false;
      } else if (key === "item") {
        const itemVal = item.item && typeof item.item === "object" && item.item._id ? item.item._id : item.item;
        if (String(itemVal) !== String(val)) return false;
      } else if (key === "_id" && typeof val === "object" && val.$ne) {
        if (String(item._id) === String(val.$ne)) return false;
      } else if (key === "_id") {
        if (String(item._id) !== String(val)) return false;
      } else if (key === "status") {
        const itemStatus = item.status || "open";
        if (itemStatus !== val) return false;
      } else if (key === "reportedBy") {
        if (String(item.reportedBy) !== String(val)) return false;
      } else if (key === "claimant") {
        if (String(item.claimant) !== String(val)) return false;
      } else if (val && typeof val === "object" && "$exists" in val) {
        if (val.$exists === false && item[key] !== undefined) return false;
        if (val.$exists === true && item[key] === undefined) return false;
      } else if (key === "email") {
        if (!item.email || item.email.toLowerCase() !== String(val).toLowerCase()) return false;
      } else {
        if (item[key] !== val) return false;
      }
    }
    return true;
  }
}

// Local Database manager with automatic Admin seed
const localDb = {
  users: new LocalCollection("users"),
  items: new LocalCollection("items"),
  claims: new LocalCollection("claims"),

  init: async () => {
    try {
      const users = localDb.users.read();
      const adminEmail = (process.env.ADMIN_EMAIL || "admin@example.com").toLowerCase().trim();
      const adminExists = users.some((u) => u.email.toLowerCase() === adminEmail);

      if (!adminExists) {
        const passwordHash = await bcrypt.hash(process.env.ADMIN_PASSWORD || "Admin@1234", 10);
        await localDb.users.create({
          name: process.env.ADMIN_NAME || "System Admin",
          email: adminEmail,
          passwordHash,
          role: "admin",
          phone: "9999999999",
          isActive: true,
        });
        console.log(`Auto-seeded admin user: ${adminEmail} (Password: ${process.env.ADMIN_PASSWORD || "Admin@1234"})`);
      }
    } catch (err) {
      console.error("Local DB seed error:", err.message);
    }
  },
};

module.exports = localDb;
