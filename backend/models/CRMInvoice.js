const mongoose = require('mongoose');

const ItemSchema = new mongoose.Schema({
  description: { type: String, required: true },
  quantity: { type: Number, required: true, min: 1 },
  unitPrice: { type: Number, required: true, min: 0 },
  total: { type: Number, default: 0 },
});

const CRMInvoiceSchema = new mongoose.Schema({
  leadId: { type: mongoose.Schema.Types.ObjectId, ref: 'CRMLead', index: true },
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  number: { type: String, unique: true },
  status: { type: String, enum: ['Draft', 'Sent', 'Paid', 'Overdue'], default: 'Draft', index: true },
  currency: { type: String, default: 'INR' },
  items: [ItemSchema],
  subtotal: { type: Number, default: 0 },
  gstRate: { type: Number, default: 18 },
  gstAmount: { type: Number, default: 0 },
  discount: { type: Number, default: 0 },
  total: { type: Number, default: 0 },
  amountPaid: { type: Number, default: 0 },
  notes: { type: String },
  sentAt: { type: Date },
  paidAt: { type: Date },
}, { timestamps: true });

CRMInvoiceSchema.pre('save', function(next) {
  // compute totals
  this.items = this.items || [];
  this.items.forEach(it => { it.total = (it.quantity || 0) * (it.unitPrice || 0); });
  this.subtotal = this.items.reduce((s, it) => s + (it.total || 0), 0);
  const discountAmount = this.discount || 0;
  const taxable = Math.max(this.subtotal - discountAmount, 0);
  this.gstAmount = Math.round(((this.gstRate || 0) / 100) * taxable * 100) / 100;
  this.total = Math.round((taxable + this.gstAmount) * 100) / 100;
  if (!this.number) {
    const ts = Date.now();
    this.number = `INV-${ts}`;
  }
  next();
});

module.exports = mongoose.models.CRMInvoice || mongoose.model('CRMInvoice', CRMInvoiceSchema);
