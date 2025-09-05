const Batch = require('../models/Batch');

// Ensures requested subject is the only unlocked subject for the batch
module.exports = async function ensureSubjectUnlocked(req, res, next) {
  try {
    const { batchId, subjectId } = req.params;
    const batch = await Batch.findById(batchId).select('activeSubjectId');
    if (!batch) return res.status(404).json({ message: 'Batch not found' });

    if (!batch.activeSubjectId || String(batch.activeSubjectId) !== String(subjectId)) {
      return res.status(403).json({ message: 'This subject is locked for this batch.' });
    }
    return next();
  } catch (e) {
    return res.status(500).json({ message: e.message });
  }
}
