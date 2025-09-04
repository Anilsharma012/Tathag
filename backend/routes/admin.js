const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const ZoomMeeting = require('../models/ZoomMeeting');
const Course = require('../models/course/Course');
const ZoomService = require('../services/zoomService');

// Get all courses
// router.get('/courses', auth, async (req, res) => {
//     try {
//         const courses = await Course.find({}).populate('modules');
//         res.json(courses);
//     } catch (error) {
//         res.status(500).json({ message: 'Error fetching courses', error: error.message });
//     }
// });

// Update course module with video
// router.post('/courses/update-module', auth, async (req, res) => {
//     try {
//         const { courseId, module } = req.body;
//         const course = await Course.findById(courseId);
//         if (!course) {
//             return res.status(404).json({ message: 'Course not found' });
//         }

//         course.modules.push(module);
//         await course.save();
//         res.json({ message: 'Module added successfully', course });
//     } catch (error) {
//         res.status(500).json({ message: 'Error updating course module', error: error.message });
//     }
// });

// Delete Zoom meeting
// router.delete('/zoom/meetings/:meetingId', auth, async (req, res) => {
//     try {
//         const meeting = await ZoomMeeting.findById(req.params.meetingId);
//         if (!meeting) {
//             return res.status(404).json({ message: 'Meeting not found' });
//         }

//         // Delete from Zoom API
//         const token = await ZoomService.getZoomAccessToken();
//         await axios.delete(`https://api.zoom.us/v2/meetings/${meeting.meetingId}`, {
//             headers: {
//                 'Authorization': `Bearer ${token}`
//             }
//         });

//         // Delete from database
//         await meeting.remove();
//         res.json({ message: 'Meeting deleted successfully' });
//     } catch (error) {
//         res.status(500).json({ message: 'Error deleting meeting', error: error.message });
//     }
// });

// Update Zoom meeting
// router.put('/zoom/meetings/:meetingId', auth, async (req, res) => {
//     try {
//         const { title, startTime, duration } = req.body;
//         const meeting = await ZoomMeeting.findById(req.params.meetingId);
//         if (!meeting) {
//             return res.status(404).json({ message: 'Meeting not found' });
//         }

//         // Update in Zoom API
//         const token = await ZoomService.getZoomAccessToken();
//         await axios.patch(`https://api.zoom.us/v2/meetings/${meeting.meetingId}`, {
//             topic: title,
//             start_time: startTime,
//             duration: duration
//         }, {
//             headers: {
//                 'Authorization': `Bearer ${token}`
//             }
//         });

//         // Update in database
//         meeting.title = title;
//         meeting.startTime = startTime;
//         meeting.duration = duration;
//         await meeting.save();

//         res.json({ message: 'Meeting updated successfully', meeting });
//     } catch (error) {
//         res.status(500).json({ message: 'Error updating meeting', error: error.message });
//     }
// });

module.exports = router;
