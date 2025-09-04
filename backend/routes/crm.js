const express = require('express');
const router = express.Router();
const CRMLead = require('../models/CRMLead');
const CRMActivity = require('../models/CRMActivity');
const CRMInvoice = require('../models/CRMInvoice');
const User = require('../models/UserSchema');
const nodemailer = require('nodemailer');

// Helper: auth middleware (admin)
const { authMiddleware } = require('../middleware/authMiddleware');
const { checkPermission } = require('../middleware/permissionMiddleware');

const adminOnly = [authMiddleware, checkPermission('admin')];

// Public webhook for Google Form submissions
router.post('/leads/webhook', async (req, res) => {
  try {
    const secret = req.headers['x-webhook-secret'] || req.query.secret;
    const expected = process.env.CRM_WEBHOOK_SECRET || 'dev_webhook_secret';
    if (!secret || secret !== expected) return res.status(401).json({ success: false, message: 'Unauthorized webhook' });

    const { name, mobile, email, courseInterest, owner, score, nextFollowUp, notes, tags } = req.body || {};
    if (!name || !mobile) return res.status(400).json({ success: false, message: 'name and mobile required' });

    const lead = await CRMLead.create({
      name,
      mobile,
      email,
      courseInterest,
      owner: owner || 'Unassigned',
      score: typeof score === 'number' ? score : 0,
      nextFollowUp: nextFollowUp ? new Date(nextFollowUp) : undefined,
      notes,
      tags: Array.isArray(tags) ? tags : (typeof tags === 'string' ? tags.split(',').map(s=>s.trim()).filter(Boolean) : []),
      source: 'google_form',
      stage: 'New',
      meta: { body: req.body, headers: req.headers, ip: req.ip }
    });

    return res.status(201).json({ success: true, lead });
  } catch (e) {
    console.error('Google Form webhook error:', e);
    return res.status(500).json({ success: false, message: e.message });
  }
});

// Summary by stage & hot/cold
router.get('/leads/summary', adminOnly, async (req, res) => {
  try {
    const stages = ['New','Contacted','Demo Scheduled','Negotiation','Won','Lost'];
    const totals = {};
    let total = 0;
    for (const s of stages) { const c = await CRMLead.countDocuments({ stage: s }); totals[s]=c; total+=c; }
    const hot = await CRMLead.countDocuments({ tags: 'hot' });
    const cold = await CRMLead.countDocuments({ tags: 'cold' });
    const percentages = Object.fromEntries(stages.map(s=>[s, total? Math.round((totals[s]/total)*100):0]));
    res.json({ success:true, totals, total, hot, cold, percentages });
  } catch (e) { res.status(500).json({ success:false, message:e.message }); }
});

// List leads with search/filters
router.get('/leads', adminOnly, async (req, res) => {
  try {
    const { search, stage, source, owner, from, to, hot, page = 1, limit = 20 } = req.query;
    const query = {};

    if (search) {
      const s = new RegExp(search.trim(), 'i');
      query.$or = [{ name: s }, { email: s }, { mobile: s }, { courseInterest: s }];
    }
    if (stage && stage !== 'all') query.stage = stage;
    if (source) query.source = source;
    if (owner) query.owner = owner;
    if (hot === 'hot') query.tags = 'hot';
    if (hot === 'cold') query.tags = 'cold';
    if (from || to) {
      query.createdAt = {};
      if (from) query.createdAt.$gte = new Date(from);
      if (to) query.createdAt.$lte = new Date(to);
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [items, total] = await Promise.all([
      CRMLead.find(query).sort({ updatedAt: -1 }).skip(skip).limit(parseInt(limit)),
      CRMLead.countDocuments(query)
    ]);

    res.json({ success: true, items, total, page: parseInt(page), pages: Math.ceil(total / limit) });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

// Create lead
router.post('/leads', adminOnly, async (req, res) => {
  try {
    const lead = await CRMLead.create(req.body);
    res.status(201).json({ success: true, lead });
  } catch (e) {
    res.status(400).json({ success: false, message: e.message });
  }
});

// Bulk actions
router.post('/leads/bulk', adminOnly, async (req, res) => {
  try {
    const { ids = [], action, payload } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) return res.status(400).json({ success: false, message: 'No ids provided' });

    if (action === 'delete') {
      await CRMLead.deleteMany({ _id: { $in: ids } });
      return res.json({ success: true, message: 'Deleted' });
    }
    if (action === 'update_stage') {
      await CRMLead.updateMany({ _id: { $in: ids } }, { $set: { stage: payload?.stage || 'New' } });
      return res.json({ success: true, message: 'Stage updated' });
    }

    res.status(400).json({ success: false, message: 'Unknown action' });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

// Get lead
router.get('/leads/:id', adminOnly, async (req, res) => {
  try {
    const lead = await CRMLead.findById(req.params.id);
    if (!lead) return res.status(404).json({ success: false, message: 'Lead not found' });
    const activities = await CRMActivity.find({ leadId: lead._id }).sort({ createdAt: -1 });
    const invoices = await CRMInvoice.find({ leadId: lead._id }).sort({ createdAt: -1 });
    res.json({ success: true, lead, activities, invoices });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

// Update lead
router.put('/leads/:id', adminOnly, async (req, res) => {
  try {
    const lead = await CRMLead.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!lead) return res.status(404).json({ success: false, message: 'Lead not found' });
    res.json({ success: true, lead });
  } catch (e) {
    res.status(400).json({ success: false, message: e.message });
  }
});

// Delete lead
router.delete('/leads/:id', adminOnly, async (req, res) => {
  try {
    await CRMLead.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

// Activities
router.get('/leads/:id/activities', adminOnly, async (req, res) => {
  const items = await CRMActivity.find({ leadId: req.params.id }).sort({ createdAt: -1 });
  res.json({ success: true, items });
});

router.post('/leads/:id/activities', adminOnly, async (req, res) => {
  try {
    const activity = await CRMActivity.create({ ...req.body, leadId: req.params.id });
    await CRMLead.findByIdAndUpdate(req.params.id, { lastActivity: new Date() });
    res.status(201).json({ success: true, activity });
  } catch (e) {
    res.status(400).json({ success: false, message: e.message });
  }
});

// Pipeline
router.get('/pipeline', adminOnly, async (req, res) => {
  const stages = ['New', 'Contacted', 'Demo Scheduled', 'Negotiation', 'Won', 'Lost'];
  const result = {};
  for (const s of stages) {
    result[s] = await CRMLead.find({ stage: s }).sort({ order: 1, updatedAt: -1 });
  }
  res.json({ success: true, stages: result });
});

router.put('/pipeline/move', adminOnly, async (req, res) => {
  try {
    const { leadId, toStage, order = 0 } = req.body;
    const lead = await CRMLead.findByIdAndUpdate(leadId, { stage: toStage, order }, { new: true });
    res.json({ success: true, lead });
  } catch (e) {
    res.status(400).json({ success: false, message: e.message });
  }
});

// Convert to student
router.post('/leads/:id/convert', adminOnly, async (req, res) => {
  try {
    const lead = await CRMLead.findById(req.params.id);
    if (!lead) return res.status(404).json({ success: false, message: 'Lead not found' });

    // find or create student
    let user = null;
    if (lead.email) user = await User.findOne({ email: lead.email });
    if (!user && lead.mobile) user = await User.findOne({ phoneNumber: lead.mobile });

    if (!user) {
      user = await User.create({
        name: lead.name,
        email: lead.email || undefined,
        phoneNumber: lead.mobile || undefined,
        role: 'student',
        isEmailVerified: !!lead.email,
        isPhoneVerified: !!lead.mobile,
      });
    }

    lead.stage = 'Won';
    lead.convertedToStudent = user._id;
    await lead.save();

    res.json({ success: true, student: user, lead });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

// Invoices
router.get('/invoices', adminOnly, async (req, res) => {
  try {
    const { status, leadId } = req.query;
    const query = {};
    if (status && status !== 'all') query.status = status;
    if (leadId) query.leadId = leadId;
    const items = await CRMInvoice.find(query).sort({ createdAt: -1 });
    res.json({ success: true, items });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

// Invoice summary for leads - latest invoice per lead
router.get('/invoices/summary', adminOnly, async (req, res) => {
  try {
    const leadIdsParam = req.query.leadIds || '';
    const ids = leadIdsParam.split(',').map(s => s.trim()).filter(Boolean);
    if (!ids.length) return res.json({ success: true, summaries: {} });
    const { default: mongoose } = await import('mongoose');
    const objIds = ids.map(id => new mongoose.Types.ObjectId(id));
    const invoices = await CRMInvoice.aggregate([
      { $match: { leadId: { $in: objIds } } },
      { $sort: { createdAt: -1 } },
      { $group: { _id: '$leadId', latest: { $first: '$$ROOT' } } }
    ]);
    const summaries = {};
    for (const it of invoices) {
      const inv = it.latest;
      const total = inv.total || 0;
      const paid = inv.amountPaid || 0;
      let badge = 'Pending';
      if (paid >= total && total > 0) badge = 'Paid';
      else if (paid > 0 && paid < total) badge = 'Partial';
      summaries[String(it._id)] = { invoiceId: String(inv._id), number: inv.number || null, total, amountPaid: paid, status: badge };
    }
    res.json({ success: true, summaries });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

// Invoice PDF - simple HTML stream
router.get('/invoices/:id/pdf', adminOnly, async (req, res) => {
  try {
    const inv = await CRMInvoice.findById(req.params.id).populate('leadId');
    if (!inv) return res.status(404).send('Not found');
    const html = `<!doctype html><html><head><meta charset="utf-8"><title>${inv.number}</title></head><body>
      <h2>Invoice ${inv.number}</h2>
      <p>Status: ${inv.status}</p>
      <p>Lead: ${inv.leadId ? inv.leadId.name : ''} (${inv.leadId ? inv.leadId.email || '' : ''})</p>
      <table border="1" cellspacing="0" cellpadding="6">
        <thead><tr><th>Description</th><th>Qty</th><th>Price</th><th>Total</th></tr></thead>
        <tbody>
          ${inv.items.map(i => `<tr><td>${i.description}</td><td>${i.quantity}</td><td>${i.unitPrice}</td><td>${i.total}</td></tr>`).join('')}
        </tbody>
      </table>
      <p>Subtotal: ${inv.subtotal}</p>
      <p>GST (${inv.gstRate}%): ${inv.gstAmount}</p>
      <p>Total: ${inv.total}</p>
      <p>Paid: ${inv.amountPaid || 0}</p>
      <p>Due: ${(inv.total || 0) - (inv.amountPaid || 0)}</p>
    </body></html>`;
    res.setHeader('Content-Type', 'text/html');
    res.setHeader('Content-Disposition', `inline; filename="${inv.number}.html"`);
    return res.send(html);
  } catch (e) {
    res.status(500).send('Failed to render');
  }
});

router.post('/invoices', adminOnly, async (req, res) => {
  try {
    const invoice = await CRMInvoice.create(req.body);
    res.status(201).json({ success: true, invoice });
  } catch (e) {
    res.status(400).json({ success: false, message: e.message });
  }
});

router.put('/invoices/:id', adminOnly, async (req, res) => {
  try {
    const invoice = await CRMInvoice.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    res.json({ success: true, invoice });
  } catch (e) {
    res.status(400).json({ success: false, message: e.message });
  }
});

router.delete('/invoices/:id', adminOnly, async (req, res) => {
  try {
    await CRMInvoice.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

router.post('/invoices/:id/send', adminOnly, async (req, res) => {
  try {
    const invoice = await CRMInvoice.findById(req.params.id);
    if (!invoice) return res.status(404).json({ success: false, message: 'Invoice not found' });

    const lead = invoice.leadId ? await CRMLead.findById(invoice.leadId) : null;
    const toEmail = req.body.email || lead?.email;
    if (!toEmail) return res.status(400).json({ success: false, message: 'No recipient email' });

    const transporter = await nodemailer.createTestAccount().then((acc) => nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      auth: { user: acc.user, pass: acc.pass },
    }));

    const html = `
      <h2>Invoice ${invoice.number}</h2>
      <p>Status: ${invoice.status}</p>
      <table border="1" cellspacing="0" cellpadding="6">
        <thead><tr><th>Description</th><th>Qty</th><th>Price</th><th>Total</th></tr></thead>
        <tbody>
          ${invoice.items.map(i => `<tr><td>${i.description}</td><td>${i.quantity}</td><td>${i.unitPrice}</td><td>${i.total}</td></tr>`).join('')}
        </tbody>
      </table>
      <p>Subtotal: ${invoice.subtotal}</p>
      <p>Discount: ${invoice.discount || 0}</p>
      <p>GST (${invoice.gstRate}%): ${invoice.gstAmount}</p>
      <h3>Total: ${invoice.total}</h3>
    `;

    const info = await transporter.sendMail({
      from: 'invoices@tathagat.com',
      to: toEmail,
      subject: `Invoice ${invoice.number}`,
      html,
    });

    invoice.status = invoice.status === 'Draft' ? 'Sent' : invoice.status;
    invoice.sentAt = new Date();
    await invoice.save();

    res.json({ success: true, message: 'Email sent', info });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

module.exports = router;
