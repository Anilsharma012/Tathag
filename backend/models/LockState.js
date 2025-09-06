const mongoose = require('mongoose');

const LockStateSchema = new mongoose.Schema({
  courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true, index: true },
  batchId: { type: mongoose.Schema.Types.ObjectId, ref: 'Batch', required: true, index: true },
  itemId: { type: mongoose.Schema.Types.ObjectId, required: true, index: true },
  scope: { type: String, enum: ['subject','section','topic'], required: true, index: true },
  status: { type: String, enum: ['locked','unlocked','active'], required: true },
  unlockAt: { type: Date, default: null },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin', default: null },
  idempotencyKey: { type: String, default: null, index: true }
}, { timestamps: true });

LockStateSchema.index({ courseId: 1, batchId: 1, itemId: 1, scope: 1 }, { unique: true });

module.exports = mongoose.models.LockState || mongoose.model('LockState', LockStateSchema);
