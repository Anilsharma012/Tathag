const mongoose = require('mongoose');

const LiveClassSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true, index: true },
  platform: { type: String, enum: ['zoom', 'google_meet', 'custom'], required: true },
  joinLink: { type: String, required: true },
  startTime: { type: Date, required: true, index: true },
  endTime: { type: Date, required: true },
  timezone: { type: String, default: 'Asia/Kolkata' },
  rrule: { type: String, default: '' },
  description: { type: String, default: '' },
  reminders: { type: [Number], default: [1440, 60, 10] }, // minutes before: 24h, 1h, 10m
  status: { type: String, enum: ['scheduled', 'live', 'completed', 'cancelled'], default: 'scheduled' },
  platformMeta: {
    meetingId: { type: String, default: '' },
    hostUrl: { type: String, default: '' }
  },
  notifiedStudents: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  notificationSent: { type: Boolean, default: false },
  createdBy: {
    id: { type: mongoose.Schema.Types.ObjectId, required: true },
    role: { type: String, enum: ['admin', 'subadmin'], required: true }
  }
}, { timestamps: true });

LiveClassSchema.pre('save', function(next) {
  try {
    const now = new Date();
    if (this.status !== 'cancelled') {
      if (now < this.startTime) this.status = 'scheduled';
      else if (now >= this.startTime && now <= this.endTime) this.status = 'live';
      else if (now > this.endTime) this.status = 'completed';
    }
  } catch (_) {}
  next();
});

LiveClassSchema.index({ courseId: 1, startTime: 1 });

module.exports = mongoose.models.LiveClass || mongoose.model('LiveClass', LiveClassSchema);
