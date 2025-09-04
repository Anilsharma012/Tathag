const Test = require("../models/course/Test");
const mongoose=require("mongoose")

// ✅ Create Test
const createTest = async (req, res) => {
  try {
    const {
      course,
      subject,
      chapter,
      topic,
      title,
      description,
      duration,
      totalMarks,
      instructions
    } = req.body;

    // ✅ Required field check
    if (!course || !subject || !chapter || !topic || !title) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const exists = await Test.findOne({ topic, title });
    if (exists) {
      return res.status(400).json({ message: "Test already exists with this title in topic" });
    }

    const test = new Test({
      course,
      subject,
      chapter,
      topic,
      title,
      description,
      duration,
      totalMarks,
      instructions
    });

    await test.save();

    res.status(201).json({ success: true, test });
  } catch (err) {
    console.error("❌ Error creating test:", err.message);
    res.status(500).json({ success: false, message: "Failed to create test", error: err.message });
  }
};


// ✅ Get all tests for a topic


// ✅ Update Test
const updateTest = async (req, res) => {
  try {
    const test = await Test.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.status(200).json({ success: true, test });
  } catch (err) {
    res.status(500).json({ success: false, message: "Update failed" });
  }
};

// ✅ Delete Test
const deleteTest = async (req, res) => {
  try {
    await Test.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: "Test deleted" });
  } catch (err) {
    res.status(500).json({ success: false, message: "Delete failed" });
  }
};

const getTestsByTopic = async (req, res) => {
  try {
    const { topicId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(topicId)) {
      return res.status(400).json({ success: false, message: "Invalid topic ID" });
    }

    const tests = await Test.find({ topic: topicId });
    res.status(200).json({ success: true, tests });
  } catch (err) {
    console.error("❌ Test fetch error:", err.message);
    res.status(500).json({ success: false, message: "Failed to fetch tests", error: err.message });
  }
};


module.exports = {
  createTest,
  getTestsByTopic,
  updateTest,
  deleteTest,
 

};
