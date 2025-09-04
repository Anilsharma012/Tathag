const mongoose = require('mongoose');

const ZoomMeetingSchema = new mongoose.Schema({
    courseId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course',
        required: true
    },
    meetingId: {
        type: String,
        required: true
    },
    title: {
        type: String,
        required: true
    },
    startTime: {
        type: Date,
        required: true
    },
    duration: {
        type: Number,
        required: true
    },
    joinUrl: {
        type: String,
        required: true
    },
    recordingUrl: {
        type: String
    },
    recordingStatus: {
        type: String,
        enum: ['pending', 'completed', 'failed'],
        default: 'pending'
    },
    notifiedStudents: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    notificationSent: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

ZoomMeetingSchema.index({ courseId: 1, startTime: 1 });

module.exports = mongoose.model('ZoomMeeting', ZoomMeetingSchema);
