const mongoose = require('mongoose');

const EnrollmentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true, index: true },
  joinedAt: { type: Date, default: Date.now },
  validTill: { type: Date, required: true },
  status: { type: String, enum: ['active','expired'], default: 'active', index: true },
}, { timestamps: true });

EnrollmentSchema.index({ userId: 1, courseId: 1 }, { unique: true });

module.exports = mongoose.models.Enrollment || mongoose.model('Enrollment', EnrollmentSchema);
