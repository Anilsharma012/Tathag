const Topic = require("../models/course/Topic");
const mongoose = require("mongoose");

// ✅ Create a new Topic
const createTopic = async (req, res) => {
  try {
    const { course, subject, chapter, name, description, order, isFullTestSection } = req.body;

    // ✅ Required fields validation
    if (!course || !subject || !chapter || !name) {
      return res.status(400).json({ message: "course, subject, chapter and name are required" });
    }

    const existing = await Topic.findOne({ chapter, name });
    if (existing) {
      return res.status(400).json({ message: "Topic already exists in this chapter" });
    }

    const topic = new Topic({
      course,
      subject,
      chapter,
      name,
      description,
      order,
      isFullTestSection
    });

    await topic.save();
    console.log("✅ Topic created:", topic.name);

    res.status(201).json({ success: true, topic });
  } catch (err) {
    console.error("❌ Topic create error:", err.message);
    res.status(500).json({ success: false, message: "Failed to create topic", error: err.message });
  }
};

// ✅ Get all Topics in a Chapter
const getTopicsByChapter = async (req, res) => {
  try {
    const chapterId = req.params.chapterId;

    if (!mongoose.Types.ObjectId.isValid(chapterId)) {
      return res.status(400).json({ success: false, message: "Invalid chapter ID" });
    }

    const topics = await Topic.find({ chapter: new mongoose.Types.ObjectId(chapterId) }).sort({ order: 1 });

    res.status(200).json({ success: true, topics });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to fetch topics", error: err.message });
  }
};


// ✅ Update Topic
const updateTopic = async (req, res) => {
  try {
    const updated = await Topic.findByIdAndUpdate(req.params.id, req.body, { new: true });

    if (!updated) {
      return res.status(404).json({ success: false, message: "Topic not found" });
    }

    res.status(200).json({ success: true, topic: updated });
  } catch (err) {
    console.error("❌ Topic update error:", err.message);
    res.status(500).json({ success: false, message: "Update failed", error: err.message });
  }
};

// ✅ Delete Topic
const deleteTopic = async (req, res) => {
  try {
    const deleted = await Topic.findByIdAndDelete(req.params.id);

    if (!deleted) {
      return res.status(404).json({ success: false, message: "Topic not found" });
    }

    res.status(200).json({ success: true, message: "Topic deleted" });
  } catch (err) {
    console.error("❌ Topic delete error:", err.message);
    res.status(500).json({ success: false, message: "Delete failed", error: err.message });
  }
};

module.exports = {
  createTopic,
  getTopicsByChapter,
  updateTopic,
  deleteTopic
};
