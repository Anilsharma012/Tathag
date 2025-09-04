const mongoose = require('mongoose');

const SubjectProgressSchema = new mongoose.Schema({
  enrollmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Enrollment', required: true, index: true },
  subject: { type: String, enum: ['A','B','C','D'], required: true },
  status: { type: String, enum: ['pending','done'], default: 'pending' },
}, { timestamps: true });

SubjectProgressSchema.index({ enrollmentId: 1, subject: 1 }, { unique: true });

module.exports = mongoose.models.SubjectProgress || mongoose.model('SubjectProgress', SubjectProgressSchema);
