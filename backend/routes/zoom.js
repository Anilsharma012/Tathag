const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const ZoomMeeting = require('../models/ZoomMeeting');
const ZoomService = require('../services/zoomService');
const Course = require('../models/course/Course');
const User = require('../models/UserSchema');
const nodemailer = require('nodemailer');

// Create Zoom meeting and notify students
// router.post('/schedule', auth, async (req, res) => {
//     try {
//         const { courseId, title, startTime, duration } = req.body;
        
//         // Verify user has access to this course
//         const course = await Course.findById(courseId);
//         if (!course) {
//             return res.status(404).json({ message: 'Course not found' });
//         }

//         // Create Zoom meeting
//         const zoomMeeting = await ZoomService.createMeeting(courseId, title, startTime, duration);

//         // Save to database
//         const meeting = new ZoomMeeting({
//             ...zoomMeeting,
//             courseId,
//             title
//         });
//         await meeting.save();

//         // Get enrolled students
//         const enrolledStudents = await User.find({ enrolledCourses: courseId });

//         // Send notifications
//         const transporter = nodemailer.createTransport({
//             service: 'gmail',
//             auth: {
//                 user: process.env.SMTP_USER,
//                 pass: process.env.SMTP_PASS
//             }
//         });

//         for (const student of enrolledStudents) {
//             await transporter.sendMail({
//                 from: process.env.SMTP_USER,
//                 to: student.email,
//                 subject: `Upcoming Live Class: ${title}`,
//                 html: `
//                     <h2>Live Class Notification</h2>
//                     <p>Hi ${student.name},</p>
//                     <p>You have a live class coming up:</p>
//                     <ul>
//                         <li><strong>Title:</strong> ${title}</li>
//                         <li><strong>Date/Time:</strong> ${new Date(startTime).toLocaleString()}</li>
//                         <li><strong>Duration:</strong> ${duration} minutes</li>
//                         <li><strong>Join URL:</strong> <a href="${zoomMeeting.joinUrl}">${zoomMeeting.joinUrl}</a></li>
//                     </ul>
//                     <p>Reminder: You'll receive another notification 15 minutes before the class starts.</p>
//                 `
//             });

//             // Mark student as notified
//             meeting.notifiedStudents.push(student._id);
//         }

//         meeting.notificationSent = true;
//         await meeting.save();

//         res.status(201).json({
//             message: 'Zoom meeting scheduled successfully',
//             meeting: {
//                 _id: meeting._id,
//                 joinUrl: meeting.joinUrl,
//                 startTime: meeting.startTime,
//                 title: meeting.title
//             }
//         });
//     } catch (error) {
//         console.error('Error scheduling Zoom meeting:', error);
//         res.status(500).json({ message: 'Error scheduling Zoom meeting', error: error.message });
//     }
// });

// Get recordings for a meeting
// router.get('/recordings/:meetingId', auth, async (req, res) => {
//     try {
//         const meeting = await ZoomMeeting.findById(req.params.meetingId);
//         if (!meeting) {
//             return res.status(404).json({ message: 'Meeting not found' });
//         }

//         // If recording already exists in our database
//         if (meeting.recordingUrl) {
//             return res.json({ recordingUrl: meeting.recordingUrl });
//         }

//         // Fetch from Zoom API
//         const recordings = await ZoomService.getMeetingRecordings(meeting.meetingId);
//         if (recordings?.recording_files?.length) {
//             // Update our database with recording URL
//             meeting.recordingUrl = recordings.recording_files[0].download_url;
//             meeting.recordingStatus = 'completed';
//             await meeting.save();

//             // Update course module with recording
//             const course = await Course.findById(meeting.courseId);
//             if (course) {
//                 // Add recording to relevant module
//                 // You might want to implement a more specific mapping here
//                 course.modules.push({
//                     title: `${meeting.title} Recording`,
//                     type: 'video',
//                     content: meeting.recordingUrl
//                 });
//                 await course.save();
//             }
//         }

//         res.json({ recordingUrl: meeting.recordingUrl });
//     } catch (error) {
//         console.error('Error getting recordings:', error);
//         res.status(500).json({ message: 'Error fetching recordings', error: error.message });
//     }
// });

module.exports = router;
