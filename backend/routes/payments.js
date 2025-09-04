const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const { authMiddleware } = require('../middleware/authMiddleware');
const Payment = require('../models/Payment');
const Receipt = require('../models/Receipt');
const Course = require('../models/course/Course');
const userController = require('../controllers/userController');
const CRMInvoice = require('../models/CRMInvoice');
const upload = require('../middleware/uploadMiddleware');

// Map create-order for CRM use-cases (proxy to user controller)
router.post('/create-order', authMiddleware, userController.createOrder);

// Simple webhook to update CRM invoice paid amounts
router.post('/webhook', async (req, res) => {
  try {
    const secret = req.headers['x-webhook-secret'] || req.query.secret;
    const expected = process.env.PAYMENTS_WEBHOOK_SECRET || 'dev_payments_secret';
    if (!secret || secret !== expected) return res.status(401).json({ success: false, message: 'Unauthorized webhook' });

    const { invoiceId, amountPaid } = req.body || {};
    if (!invoiceId || typeof amountPaid !== 'number') return res.status(400).json({ success: false, message: 'invoiceId and amountPaid required' });

    const inv = await CRMInvoice.findById(invoiceId);
    if (!inv) return res.status(404).json({ success: false, message: 'Invoice not found' });

    inv.amountPaid = Math.max(0, amountPaid);
    if (inv.amountPaid >= (inv.total || 0)) {
      inv.status = 'Paid';
      inv.paidAt = new Date();
    }
    await inv.save();
    return res.json({ success: true });
  } catch (e) {
    console.error('payments/webhook error:', e);
    return res.status(500).json({ success: false, message: e.message });
  }
});

// GET /api/payments/history?cursor=&limit=&q=&dateFrom=&dateTo=&status=
router.get('/history', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    let { cursor = '', limit = '10', q = '', dateFrom = '', dateTo = '', status = '' } = req.query;
    const pageSize = Math.min(Math.max(parseInt(limit, 10) || 10, 1), 50);

    const filter = { userId };

    // Date range
    if (dateFrom || dateTo) {
      filter.createdAt = {};
      if (dateFrom) filter.createdAt.$gte = new Date(dateFrom);
      if (dateTo) {
        const dt = new Date(dateTo);
        // include end day
        dt.setHours(23, 59, 59, 999);
        filter.createdAt.$lte = dt;
      }
    }

    // Status filter (paid/refunded/failed)
    if (status && status !== 'all') {
      filter.status = status.toLowerCase();
    }

    // Search by receipt number or course name
    let courseIdsFromSearch = [];
    if (q && q.trim()) {
      filter.$or = [{ receiptNumber: { $regex: q.trim(), $options: 'i' } }];
      // Try match by course name
      const matchedCourses = await Course.find({ name: { $regex: q.trim(), $options: 'i' } }, { _id: 1 }).lean();
      courseIdsFromSearch = matchedCourses.map(c => c._id);
      if (courseIdsFromSearch.length) {
        filter.$or.push({ courseId: { $in: courseIdsFromSearch } });
      }
    }

    // Cursor-based pagination using _id
    if (cursor) {
      try {
        filter._id = { $lt: new mongoose.Types.ObjectId(cursor) };
      } catch {}
    }

    const query = Payment.find(filter)
      .populate('courseId', 'name')
      .sort({ _id: -1 })
      .limit(pageSize + 1);

    const results = await query.lean();
    const hasMore = results.length > pageSize;
    const slice = hasMore ? results.slice(0, pageSize) : results;

    const items = slice.map(p => ({
      _id: p._id.toString(),
      receiptNo: p.receiptNumber || null,
      receiptNumber: p.receiptNumber || null,
      courseId: p.courseId?._id || p.courseId || null,
      courseTitle: (p.courseId && p.courseId.name) ? p.courseId.name : null,
      amount: Number(p.amount) || 0, // paise
      currency: p.currency || 'INR',
      paidAt: p.status === 'paid' ? (p.updatedAt || p.createdAt) : p.createdAt,
      method: p.paymentMethod || p.method || 'Razorpay',
      status: p.status,
      downloads: { receiptPdf: p.status === 'paid' },
      createdAt: p.createdAt,
    }));

    const nextCursor = hasMore ? slice[slice.length - 1]._id.toString() : null;
    const total = await Payment.countDocuments({ userId, ...(status && status !== 'all' ? { status: status.toLowerCase() } : {}) });

    res.json({ items, nextCursor, total });
  } catch (err) {
    console.error('payments/history error:', err);
    res.status(500).json({ message: 'Failed to fetch history' });
  }
});

// POST /api/payments/offline/submit - student uploads offline slip
router.post('/offline/submit', authMiddleware, upload.single('slip'), async (req, res) => {
  try {
    let userId = req.user && req.user.id ? req.user.id : null;
    const { courseId, amount, note } = req.body;

    if (!courseId || !amount) {
      return res.status(400).json({ success: false, message: 'courseId and amount are required' });
    }

    // If request comes from an admin dev token in non-prod, map to demo student id
    if (req.user && req.user.role === 'admin' && process.env.NODE_ENV !== 'production') {
      userId = '507f1f77bcf86cd799439011';
    }

    // Validate userId
    const mongoose = require('mongoose');
    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ success: false, message: 'Invalid or missing user identity. Please login as a student.' });
    }

    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ success: false, message: 'Course not found' });

    const slipFile = req.file || null;
    const filename = slipFile ? slipFile.filename : null;
    const url = filename ? `${req.protocol}://${req.get('host')}/uploads/${filename}` : null;

    // If request was multipart but file not accepted/attached, return clear error
    const contentType = (req.headers['content-type'] || '').toLowerCase();
    if (contentType.includes('multipart/form-data') && !slipFile) {
      return res.status(400).json({ success: false, message: 'Slip file missing or invalid format. Only images and PDFs are allowed.' });
    }

    const payment = new Payment({
      userId,
      courseId,
      // offline submission has no razorpay order; stub an id for required field
      razorpay_order_id: `offline_${Date.now()}`,
      amount: Number(amount),
      currency: 'INR',
      status: 'pending_offline',
      paymentMethod: 'offline',
      offlineSlipFilename: filename,
      offlineSlipUrl: url,
      offlineNote: note || '',
      uploadedByRole: 'student',
    });

    await payment.save();

    return res.status(201).json({ success: true, payment });
  } catch (err) {
    console.error('offline/submit error:', err);
    res.status(500).json({ success: false, message: 'Failed to submit offline payment', error: err.message });
  }
});

// GET /api/payments/receipt/:id/pdf -> return URL to existing receipt download
router.get('/receipt/:id/pdf', authMiddleware, async (req, res) => {
  try {
    const id = req.params.id;

    // If id corresponds to a Receipt, ensure ownership
    let receipt = await Receipt.findById(id).lean();
    if (receipt) {
      if (receipt.userId.toString() !== req.user.id) return res.status(403).json({ message: 'Forbidden' });
      return res.json({ url: `/api/user/receipt/${id}/download?format=html` });
    }

    // Otherwise, map payment -> find its receipt
    const payment = await Payment.findById(id).lean();
    if (!payment || payment.userId.toString() !== req.user.id) return res.status(404).json({ message: 'Not found' });

    const foundReceipt = await Receipt.findOne({ paymentId: payment._id }).lean();
    if (foundReceipt) return res.json({ url: `/api/user/receipt/${foundReceipt._id}/download?format=html` });

    return res.status(404).json({ message: 'Receipt not found' });
  } catch (err) {
    console.error('receipt/pdf error:', err);
    res.status(500).json({ message: 'Failed to resolve receipt URL' });
  }
});

module.exports = router;
