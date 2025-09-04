const mongoose = require('mongoose');

const BatchSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true, trim: true },
  currentSubject: { type: String, enum: ['A','B','C','D'], default: 'A', index: true },
  courseIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Course' }],
}, { timestamps: true });

module.exports = mongoose.models.Batch || mongoose.model('Batch', BatchSchema);
