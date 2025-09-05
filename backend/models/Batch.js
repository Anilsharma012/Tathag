const mongoose = require('mongoose');

const BatchSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true, trim: true },
  // Legacy field used elsewhere in the app; keep for backward compatibility
  currentSubject: { type: String, enum: ['A','B','C','D'], default: 'A', index: true },
  // Legacy: batches could be attached to multiple courses
  courseIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Course' }],

  // New fields for single-course association and subject unlocking
  courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', index: true, default: null },
  activeSubjectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', index: true, default: null },
  schedule: [
    {
      subjectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', required: true },
      openAt: { type: Date, default: null }
    }
  ]
}, { timestamps: true });

module.exports = mongoose.models.Batch || mongoose.model('Batch', BatchSchema);
