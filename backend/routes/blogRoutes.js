const express = require("express");
const mongoose = require("mongoose");
const User = require("../models/UserSchema");
const Blog = require("../models/Blogs");
const { adminAuth } = require("../middleware/authMiddleware");

const router = express.Router();

// ✅ CREATE BLOG (Admin Only)
router.post("/create", adminAuth, async (req, res) => {
  try {
    const { title, category, content, featureImage } = req.body;
    const authorId = req.user.id;

    if (!title || !category || !content || !featureImage) {
      return res.status(400).json({ message: "❌ All fields are required!" });
    }

    const admin = await User.findById(authorId);
    if (!admin || admin.role !== "admin") {
      return res.status(403).json({ message: "❌ Unauthorized! Only Admins can create blogs." });
    }

    const newBlog = new Blog({
      title,
      category,
      content,
      featureImage,
      author: authorId,
    });

    await newBlog.save();
    res.status(201).json({ message: "✅ Blog Created Successfully!", blog: newBlog });

  } catch (error) {
    console.error("❌ Error Creating Blog:", error);
    res.status(500).json({ message: "Server Error" });
  }
});

// ✅ GET ALL BLOGS (Public)
router.get("/blogs", async (req, res) => {
  try {
    const blogs = await Blog.find().sort({ createdAt: -1 }).populate("author", "name email");

    if (!blogs || blogs.length === 0) {
      return res.status(404).json({ message: "❌ No blogs found!" });
    }

    res.status(200).json(blogs);
  } catch (error) {
    console.error("❌ Error Fetching Blogs:", error);
    res.status(500).json({ message: "Server Error" });
  }
});

// ✅ GET BLOG BY SLUG (Public)
router.get("/:slug", async (req, res) => {
  try {
    const blog = await Blog.findOne({ slug: req.params.slug }).populate("author", "name email");

    if (!blog) {
      return res.status(404).json({ message: "❌ Blog Not Found" });
    }

    res.status(200).json(blog);
  } catch (error) {
    console.error("❌ Error Fetching Blog:", error);
    res.status(500).json({ message: "Server Error" });
  }
});

// ✅ UPDATE BLOG (Admin Only)
router.put("/update/:id", adminAuth, async (req, res) => {
  try {
    const { title, category, content, featureImage } = req.body;
    const blog = await Blog.findById(req.params.id);

    if (!blog) {
      return res.status(404).json({ message: "❌ Blog Not Found" });
    }

    blog.title = title || blog.title;
    blog.category = category || blog.category;
    blog.content = content || blog.content;
    blog.featureImage = featureImage || blog.featureImage;
    blog.updatedAt = Date.now();

    await blog.save();
    res.status(200).json({ message: "✅ Blog Updated Successfully!", blog });
  } catch (error) {
    console.error("❌ Error Updating Blog:", error);
    res.status(500).json({ message: "Server Error" });
  }
});

// ✅ DELETE BLOG (Admin Only)
router.delete("/delete/:id", adminAuth, async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);

    if (!blog) {
      return res.status(404).json({ message: "❌ Blog Not Found" });
    }

    await blog.deleteOne();
    res.status(200).json({ message: "✅ Blog Deleted Successfully!" });
  } catch (error) {
    console.error("❌ Error Deleting Blog:", error);
    res.status(500).json({ message: "Server Error" });
  }
});

module.exports = router;
