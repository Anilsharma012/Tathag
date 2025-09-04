const mongoose = require("mongoose");
const slugify = require("slugify");

const blogSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  slug: {
    type: String,
    unique: true
  },
  category: {
    type: String,
    enum: ["CAT", "CUET", "IIT", "Non-IIT", "Study Abroad"],
    required: true
  },
  content: {
    type: String,
    required: true
  },
  featureImage: {
    type: String,
    required: true
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// ✅ Automatically Generate Slug from Title
blogSchema.pre("save", function (next) {
  if (this.title) {
    this.slug = slugify(this.title, { lower: true, strict: true });
  }
  next();
});

module.exports = mongoose.model("Blog", blogSchema);
