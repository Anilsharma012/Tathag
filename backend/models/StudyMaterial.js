const mongoose = require('mongoose');

const studyMaterialSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  subject: {
    type: String,
    required: true,
    enum: ['Quantitative Aptitude', 'Verbal Ability', 'Data Interpretation', 'Logical Reasoning', 'General Knowledge', 'All Subjects']
  },
  type: {
    type: String,
    required: true,
    enum: ['PDF', 'Video', 'Practice Sets', 'Notes', 'Other']
  },
  fileName: {
    type: String,
    required: true
  },
  filePath: {
    type: String,
    required: true
  },
  fileSize: {
    type: String, // e.g., "5.2 MB"
  },
  downloadCount: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: false
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
    required: true
  },
  tags: [{
    type: String,
    trim: true
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field before saving
studyMaterialSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Virtual for formatted file size
studyMaterialSchema.virtual('formattedSize').get(function() {
  return this.fileSize || '0 MB';
});

// Virtual for download count text
studyMaterialSchema.virtual('downloadText').get(function() {
  return `${this.downloadCount} downloads`;
});

// Instance method to increment download count
studyMaterialSchema.methods.incrementDownload = function() {
  this.downloadCount += 1;
  return this.save();
};

// Static method to find materials by subject
studyMaterialSchema.statics.findBySubject = function(subject) {
  return this.find({ subject, isActive: true }).populate('uploadedBy', 'name');
};

// Static method to find materials by type
studyMaterialSchema.statics.findByType = function(type) {
  return this.find({ type, isActive: true }).populate('uploadedBy', 'name');
};

const StudyMaterial = mongoose.model('StudyMaterial', studyMaterialSchema);

module.exports = StudyMaterial;
