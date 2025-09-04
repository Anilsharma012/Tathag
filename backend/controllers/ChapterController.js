const Chapter = require("../models/course/Chapter");

// ✅ Create Chapter
 const createChapter = async (req, res) => {
  try {
    console.log("🔥 Incoming body:", req.body);

    const { courseId, subjectId, name, description, order } = req.body;

    const exists = await Chapter.findOne({ subjectId, name });
    if (exists) return res.status(400).json({ message: "Chapter already exists" });

    const chapter = new Chapter({
      courseId,
      subjectId,
      name,
      description,
      order
    });

    await chapter.save();

    res.status(201).json({ success: true, chapter });
  } catch (err) {
    console.error("❌ Chapter creation error:", err); // 🔥 Add this
    res.status(500).json({ success: false, message: "Failed to create chapter" });
  }
};


// ✅ Get all chapters for a course
// ✅ Get chapters of a subject
const getChaptersBySubject = async (req, res) => {
  try {
    const { subjectId } = req.params;

    const chapters = await Chapter.find({ subjectId }).sort({ order: 1 }); // ✅ fixed filter
    res.status(200).json({ success: true, chapters });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to fetch chapters" });
  }
};


// ✅ Update Chapter
const updateChapter = async (req, res) => {
  try {
    const chapter = await Chapter.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.status(200).json({ success: true, chapter });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to update chapter" });
  }
};

// ✅ Delete Chapter
const deleteChapter = async (req, res) => {
  try {
    await Chapter.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: "Chapter deleted" });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to delete chapter" });
  }
};

module.exports = {
  createChapter,
  getChaptersBySubject,
  updateChapter,
  deleteChapter
};
