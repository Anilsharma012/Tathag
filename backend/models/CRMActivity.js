const mongoose = require('mongoose');

const CRMActivitySchema = new mongoose.Schema({
  leadId: { type: mongoose.Schema.Types.ObjectId, ref: 'CRMLead', required: true, index: true },
  type: { type: String, enum: ['call', 'note', 'meeting'], required: true },
  title: { type: String, trim: true },
  content: { type: String },
  loggedAt: { type: Date, default: Date.now },
  createdBy: { type: String, trim: true },
}, { timestamps: true });

module.exports = mongoose.models.CRMActivity || mongoose.model('CRMActivity', CRMActivitySchema);
