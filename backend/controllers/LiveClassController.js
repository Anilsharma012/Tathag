const LiveClass = require('../models/LiveClass');
const Course = require('../models/course/Course');
const ZoomService = require('../services/zoomService');
const User = require('../models/UserSchema');
const nodemailer = require('nodemailer');

let LIVE_VERSION = Date.now();
const bumpVersion = () => { LIVE_VERSION = Date.now(); };
exports.version = (req, res) => { res.json({ success: true, v: LIVE_VERSION }); };

const parseFilters = (query) => {
  const filters = {};
  if (query.courseId) filters.courseId = query.courseId;
  if (query.status) filters.status = query.status;
  if (query.from || query.to) {
    filters.startTime = {};
    if (query.from) filters.startTime.$gte = new Date(query.from);
    if (query.to) filters.startTime.$lte = new Date(query.to);
  }
  if (query.q) {
    filters.$or = [
      { title: { $regex: query.q, $options: 'i' } },
      { description: { $regex: query.q, $options: 'i' } }
    ];
  }
  return filters;
};

exports.list = async (req, res) => {
  try {
    const role = req.user?.role || 'student';
    let filters = parseFilters(req.query);

    if (role === 'student') {
      // limit to enrolled courses only
      const User = require('../models/UserSchema');
      const user = await User.findById(req.user.id);
      const courseIds = (user?.enrolledCourses || [])
        .filter(c => c.status === 'unlocked' && c.courseId)
        .map(c => c.courseId);
      filters.courseId = filters.courseId ? filters.courseId : { $in: courseIds };
      // default to upcoming
      if (!req.query.from && !req.query.to) {
        filters.startTime = { $gte: new Date() };
      }
    }

    const items = await LiveClass.find(filters).populate('courseId', 'name').sort({ startTime: 1 }).lean();
    res.json({ success: true, items });
  } catch (err) {
    console.error('LiveClass list error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.get = async (req, res) => {
  try {
    const item = await LiveClass.findById(req.params.id).populate('courseId', 'name');
    if (!item) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, item });
  } catch (err) {
    console.error('LiveClass get error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.create = async (req, res) => {
  try {
    const { title, courseId, platform, joinLink, startTime, endTime, timezone, rrule, description, reminders } = req.body;
    if (!title || !courseId || !platform || !startTime || !endTime) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    let finalJoinLink = joinLink || '';
    const start = new Date(startTime);
    const end = new Date(endTime);
    const duration = Math.max(1, Math.ceil((end - start) / 60000));
    const platformMeta = {};

    if (!finalJoinLink && platform === 'zoom') {
      try {
        const meeting = await ZoomService.createMeeting(courseId, title, start.toISOString(), duration);
        finalJoinLink = meeting.joinUrl;
        platformMeta.meetingId = meeting.meetingId?.toString();
      } catch (e) {
        return res.status(400).json({ success: false, message: 'Zoom integration not configured. Please provide Join Link manually or configure Zoom credentials.' });
      }
    }

    const doc = await LiveClass.create({
      title,
      courseId,
      platform,
      joinLink: finalJoinLink,
      startTime: start,
      endTime: end,
      timezone: timezone || 'Asia/Kolkata',
      rrule: rrule || '',
      description: description || '',
      reminders: Array.isArray(reminders) && reminders.length ? reminders : [1440, 60, 10],
      platformMeta,
      createdBy: { id: req.user.id, role: req.user.role === 'subadmin' ? 'subadmin' : 'admin' }
    });

    // Fire-and-forget notification to enrolled students
    notifyStudentsSafe(doc).catch(()=>{});
    bumpVersion();

    res.status(201).json({ success: true, item: doc });
  } catch (err) {
    console.error('LiveClass create error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.update = async (req, res) => {
  try {
    const body = req.body || {};
    if (body.startTime) body.startTime = new Date(body.startTime);
    if (body.endTime) body.endTime = new Date(body.endTime);

    const existing = await LiveClass.findById(req.params.id);
    if (!existing) return res.status(404).json({ success: false, message: 'Not found' });

    // Handle zoom auto-link if needed
    let finalJoinLink = body.joinLink !== undefined ? body.joinLink : existing.joinLink;
    const platform = body.platform || existing.platform;
    if (!finalJoinLink && platform === 'zoom' && (body.startTime || body.endTime || body.title)) {
      const start = body.startTime || existing.startTime;
      const end = body.endTime || existing.endTime;
      const duration = Math.max(1, Math.ceil((end - start) / 60000));
      try {
        const meeting = await ZoomService.createMeeting(existing.courseId, body.title || existing.title, new Date(start).toISOString(), duration);
        finalJoinLink = meeting.joinUrl;
        body.platformMeta = { ...(existing.platformMeta || {}), meetingId: meeting.meetingId?.toString() };
      } catch (e) {
        return res.status(400).json({ success: false, message: 'Zoom integration not configured. Provide Join Link manually.' });
      }
    }

    body.joinLink = finalJoinLink;

    const updated = await LiveClass.findByIdAndUpdate(req.params.id, body, { new: true });
    bumpVersion();
    // If times changed, you may want to re-notify
    res.json({ success: true, item: updated });
  } catch (err) {
    console.error('LiveClass update error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.remove = async (req, res) => {
  try {
    await LiveClass.findByIdAndDelete(req.params.id);
    bumpVersion();
    res.json({ success: true });
  } catch (err) {
    console.error('LiveClass delete error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

async function notifyStudentsSafe(lc){
  try { await exports.notifyCore(lc); } catch(e){ console.warn('LiveClass notify skipped:', e.message); }
}

exports.notifyCore = async (lc) => {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) throw new Error('SMTP not configured');
  const students = await User.find({
    'enrolledCourses.courseId': lc.courseId,
    'enrolledCourses.status': 'unlocked'
  }).select('email name');
  if (!students.length) return;

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
  });

  const course = await Course.findById(lc.courseId).select('name');
  const html = (name) => `
    <h2>Live Class Scheduled</h2>
    <p>Hi ${name || 'Student'},</p>
    <p>A new live class has been scheduled for your course <b>${course?.name || ''}</b>.</p>
    <ul>
      <li><b>Title:</b> ${lc.title}</li>
      <li><b>Start:</b> ${new Date(lc.startTime).toLocaleString()}</li>
      <li><b>End:</b> ${new Date(lc.endTime).toLocaleString()}</li>
      <li><b>Join:</b> <a href="${lc.joinLink}">${lc.joinLink}</a></li>
    </ul>
    <p>You'll receive in-app reminders nearer the start time.</p>
  `;

  for (const stu of students) {
    if (!stu.email) continue;
    await transporter.sendMail({
      to: stu.email,
      subject: `Live Class: ${lc.title}`,
      html: html(stu.name)
    });
  }

  await LiveClass.findByIdAndUpdate(lc._id, { notificationSent: true, notifiedStudents: students.map(s=>s._id) });
};

exports.notify = async (req, res) => {
  try {
    const lc = await LiveClass.findById(req.params.id);
    if (!lc) return res.status(404).json({ success: false, message: 'Not found' });
    await exports.notifyCore(lc);
    res.json({ success: true });
  } catch (e) {
    res.status(400).json({ success: false, message: e.message });
  }
};

exports.stats = async (req, res) => {
  try {
    const now = new Date();
    const weekAhead = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    const [upcomingWeek, totalScheduled, byPlatformAgg] = await Promise.all([
      LiveClass.countDocuments({ startTime: { $gte: now, $lte: weekAhead } }),
      LiveClass.countDocuments({ startTime: { $gte: now } }),
      LiveClass.aggregate([
        { $match: {} },
        { $group: { _id: '$platform', count: { $sum: 1 } } }
      ])
    ]);

    const byPlatform = byPlatformAgg.reduce((acc, cur) => { acc[cur._id] = cur.count; return acc; }, {});

    res.json({ success: true, data: { upcomingWeek, totalScheduled, byPlatform } });
  } catch (err) {
    console.error('LiveClass stats error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
