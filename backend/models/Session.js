const mongoose = require('mongoose');

const SessionSchema = new mongoose.Schema({
  batchId: { type: mongoose.Schema.Types.ObjectId, ref: 'Batch', required: true, index: true },
  subject: { type: String, enum: ['A','B','C','D'], required: true, index: true },
  startAt: { type: Date, required: true },
  endAt: { type: Date, required: true },
  joinUrl: { type: String, required: true },
  recordingUrl: { type: String },
}, { timestamps: true });

SessionSchema.index({ batchId: 1, subject: 1, startAt: 1 });

module.exports = mongoose.models.Session || mongoose.model('Session', SessionSchema);
