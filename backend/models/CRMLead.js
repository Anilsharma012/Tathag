const mongoose = require('mongoose');

const CRMLeadSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  mobile: { type: String, required: true, trim: true },
  email: { type: String, trim: true, lowercase: true },
  courseInterest: { type: String, trim: true },
  source: { type: String, trim: true },
  stage: { type: String, enum: ['New', 'Contacted', 'Demo Scheduled', 'Negotiation', 'Won', 'Lost'], default: 'New', index: true },
  owner: { type: String, trim: true },
  score: { type: Number, default: 0 },
  tags: [{ type: String }],
  lastActivity: { type: Date },
  nextFollowUp: { type: Date },
  notes: { type: String },
  meta: { type: Object, default: {} },
  attachments: [
    {
      name: String,
      url: String,
      uploadedAt: { type: Date, default: Date.now },
    },
  ],
  order: { type: Number, default: 0 },
  convertedToStudent: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
}, { timestamps: true });

module.exports = mongoose.models.CRMLead || mongoose.model('CRMLead', CRMLeadSchema);
