const express = require('express');
const router = express.Router();
const ZoomMeeting = require('../models/ZoomMeeting');
const nodemailer = require('nodemailer');
const zoomConfig = require('../config/zoomConfig');

// Zoom webhook endpoint
router.post('/', async (req, res) => {
    try {
        const { event, payload } = req.body;
        
        switch (event) {
            case 'meeting.recording.completed':
                await handleRecordingCompleted(payload);
                break;
            
            case 'meeting.started':
                await handleMeetingStarted(payload);
                break;
            
            case 'meeting.ended':
                await handleMeetingEnded(payload);
                break;
        }

        res.status(200).json({ message: 'Webhook received' });
    } catch (error) {
        console.error('Error processing Zoom webhook:', error);
        res.status(500).json({ message: 'Error processing webhook', error: error.message });
    }
});

async function handleRecordingCompleted(payload) {
    try {
        const meeting = await ZoomMeeting.findOne({ meetingId: payload.object.id });
        if (!meeting) return;

        // Update recording status
        meeting.recordingStatus = 'completed';
        await meeting.save();

        // Send notification to instructor that recording is ready
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS
            }
        });

        await transporter.sendMail({
            to: meeting.instructorEmail,
            subject: 'Recording Ready - ' + meeting.title,
            html: `
                <h2>Recording Ready</h2>
                <p>The recording for your meeting "${meeting.title}" is now available.</p>
                <p>Please verify and upload it to the course module.</p>
            `
        });
    } catch (error) {
        console.error('Error handling recording completed:', error);
    }
}

async function handleMeetingStarted(payload) {
    try {
        const meeting = await ZoomMeeting.findOne({ meetingId: payload.object.id });
        if (!meeting) return;

        // Send reminder to students 15 minutes before end time
        setTimeout(async () => {
            const enrolledStudents = await User.find({ enrolledCourses: meeting.courseId });
            const transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: process.env.SMTP_USER,
                    pass: process.env.SMTP_PASS
                }
            });

            for (const student of enrolledStudents) {
                await transporter.sendMail({
                    to: student.email,
                    subject: 'Live Class Reminder - ' + meeting.title,
                    html: `
                        <h2>Live Class Reminder</h2>
                        <p>Hi ${student.name},</p>
                        <p>This is a reminder that your live class is ending soon:</p>
                        <ul>
                            <li><strong>Title:</strong> ${meeting.title}</li>
                            <li><strong>Join URL:</strong> <a href="${meeting.joinUrl}">${meeting.joinUrl}</a></li>
                        </ul>
                    `
                });
            }
        }, 15 * 60 * 1000); // 15 minutes before end time
    } catch (error) {
        console.error('Error handling meeting started:', error);
    }
}

async function handleMeetingEnded(payload) {
    try {
        const meeting = await ZoomMeeting.findOne({ meetingId: payload.object.id });
        if (!meeting) return;

        // Check if recording is available
        const recordings = await ZoomService.getMeetingRecordings(meeting.meetingId);
        if (recordings?.recording_files?.length) {
            // Update our database with recording URL
            meeting.recordingUrl = recordings.recording_files[0].download_url;
            await meeting.save();

            // Update course module with recording
            const course = await Course.findById(meeting.courseId);
            if (course) {
                course.modules.push({
                    title: `${meeting.title} Recording`,
                    type: 'video',
                    content: meeting.recordingUrl
                });
                await course.save();
            }
        }
    } catch (error) {
        console.error('Error handling meeting ended:', error);
    }
}

module.exports = router;
