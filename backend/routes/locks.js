const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const { authMiddleware } = require('../middleware/authMiddleware');
const { checkPermission } = require('../middleware/permissionMiddleware');
const LockState = require('../models/LockState');
const Subject = require('../models/course/Subject');
const Chapter = require('../models/course/Chapter');
const Topic = require('../models/course/Topic');

router.get('/locks/state', authMiddleware, checkPermission('course_read'), async (req, res) => {
  try {
    const { courseId, batchId } = req.query;
    if (!courseId || !batchId) return res.status(400).json({ success:false, message:'courseId and batchId required' });
    const states = await LockState.find({ courseId, batchId });
    res.json({ success:true, states: states.map(s=>({ itemId: s.itemId, scope: s.scope, status: s.status, unlockAt: s.unlockAt })) });
  } catch (e) {
    res.status(500).json({ success:false, message: e.message });
  }
});

// Helper to compute siblings per action
async function siblingIds(courseId, scope, targetId) {
  if (scope === 'subject') {
    const subj = await Subject.find({ courseId }).select('_id');
    return subj.map(s=>String(s._id));
  }
  if (scope === 'section') {
    const ch = await Chapter.findById(targetId);
    if (!ch) return [];
    const sib = await Chapter.find({ courseId, subjectId: ch.subjectId }).select('_id');
    return sib.map(s=>String(s._id));
  }
  if (scope === 'topic') {
    const tp = await Topic.findById(targetId);
    if (!tp) return [];
    const sib = await Topic.find({ course: courseId, subject: tp.subject, chapter: tp.chapter }).select('_id');
    return sib.map(s=>String(s._id));
  }
  return [];
}

router.post('/locks/apply', authMiddleware, checkPermission('course_update'), async (req, res) => {
  const session = await mongoose.startSession();
  try {
    const { courseId, batchId, actions = [], idempotencyKey, dryRun } = req.body;
    if (!courseId || !batchId) return res.status(400).json({ success:false, message:'courseId and batchId required' });
    if (!Array.isArray(actions) || actions.length === 0) return res.status(400).json({ success:false, message:'actions array required' });

    // Basic validation
    for (const a of actions) {
      if (!a || !a.scope || !a.targetId || !a.op) {
        return res.status(400).json({ success:false, message:'Invalid action entry' });
      }
      if (!['subject','section','topic'].includes(a.scope)) return res.status(400).json({ success:false, message:'Invalid scope' });
      if (!['setActive','lock','unlock'].includes(a.op)) return res.status(400).json({ success:false, message:'Invalid op' });
    }

    // Prepare ops
    let changed = 0, locked = 0, unlocked = 0, activeUpdated = 0;

    if (dryRun) {
      return res.json({ ok:true, changed, locked, unlocked, activeUpdated, dryRun:true });
    }

    await session.withTransaction(async () => {
      for (const a of actions) {
        const auto = !!a.autoLockSiblings;
        const schedule = a.schedule || {};

        if (a.op === 'setActive') {
          const sibs = await siblingIds(courseId, a.scope, a.targetId);
          // Lock all siblings except target
          for (const sibId of sibs) {
            const isTarget = String(sibId) === String(a.targetId);
            if (isTarget) {
              const upd = await LockState.findOneAndUpdate(
                { courseId, batchId, itemId: a.targetId, scope: a.scope },
                { status: 'active', unlockAt: schedule.unlockAt || null, idempotencyKey },
                { upsert: true, new: true, session }
              );
              activeUpdated += 1; changed += 1;
            } else if (auto) {
              const upd = await LockState.findOneAndUpdate(
                { courseId, batchId, itemId: sibId, scope: a.scope },
                { status: 'locked', unlockAt: null, idempotencyKey },
                { upsert: true, new: true, session }
              );
              locked += 1; changed += 1;
            }
          }
        } else if (a.op === 'lock') {
          const upd = await LockState.findOneAndUpdate(
            { courseId, batchId, itemId: a.targetId, scope: a.scope },
            { status: 'locked', unlockAt: schedule.unlockAt || null, idempotencyKey },
            { upsert: true, new: true, session }
          );
          locked += 1; changed += 1;
        } else if (a.op === 'unlock') {
          const upd = await LockState.findOneAndUpdate(
            { courseId, batchId, itemId: a.targetId, scope: a.scope },
            { status: 'unlocked', unlockAt: schedule.unlockAt || null, idempotencyKey },
            { upsert: true, new: true, session }
          );
          unlocked += 1; changed += 1;
        }
      }
    });

    res.json({ ok:true, changed, locked, unlocked, activeUpdated });
  } catch (e) {
    console.error('locks/apply error', e);
    res.status(500).json({ ok:false, message: e.message });
  } finally {
    session.endSession();
  }
});

module.exports = router;
