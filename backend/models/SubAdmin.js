const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const SubAdminSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
    },
    name: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    permissions: {
      type: [String],
      default: [],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    createdByAdmin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      required: true,
    },
    // Optional: role or permissions can be added here
  },
  {
    timestamps: true, // ✅ YE line add karni thi yahi par
  }
);

// Password hashing before save
SubAdminSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

module.exports = mongoose.model("SubAdmin", SubAdminSchema);
