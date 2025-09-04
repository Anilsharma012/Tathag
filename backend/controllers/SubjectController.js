const Subject = require("../models/course/Subject");

// ✅ Create Subject
exports.createSubject = async (req, res) => {
  try {
    const { courseId, name, description, order } = req.body;

    const existing = await Subject.findOne({ courseId, name });
    if (existing) {
      return res.status(400).json({ message: "Subject already exists in this course" });
    }

    const subject = new Subject({ courseId, name, description, order });
    await subject.save();

    res.status(201).json({ success: true, message: "Subject created", subject });
  } catch (err) {
    console.error("Subject create error:", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// ✅ Get All Subjects for a course
exports.getSubjectsByCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    const subjects = await Subject.find({ courseId }).sort({ order: 1 });

    res.status(200).json({ success: true, subjects });
  } catch (err) {
    res.status(500).json({ success: false, message: "Unable to fetch subjects" });
  }
};

// ✅ Update Subject
exports.updateSubject = async (req, res) => {
  try {
    const updated = await Subject.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.status(200).json({ success: true, subject: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: "Update failed" });
  }
};

// ✅ Delete Subject
exports.deleteSubject = async (req, res) => {
  try {
    await Subject.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: "Subject deleted" });
  } catch (err) {
    res.status(500).json({ success: false, message: "Delete failed" });
  }
};



// ✅ Bulk Add Subjects
exports.bulkAddSubjects = async (req, res) => {
  try {
    const { courseId, subjects } = req.body;

    if (!Array.isArray(subjects) || subjects.length === 0) {
      return res.status(400).json({ message: "Subjects array is required" });
    }

    const newSubjects = subjects.map((subject, index) => ({
      courseId,
      name: subject.name,
      description: subject.description || "",
      order: subject.order || index + 1
    }));

    const inserted = await Subject.insertMany(newSubjects);

    res.status(201).json({ success: true, message: "Subjects added", subjects: inserted });
  } catch (err) {
    console.error("Bulk insert error:", err);
    res.status(500).json({ success: false, message: "Bulk subject insert failed" });
  }
};
