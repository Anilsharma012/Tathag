const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    // Razorpay transaction details
    razorpay_order_id: {
      type: String,
      required: true,
    },
    razorpay_payment_id: {
      type: String,
      default: null,
    },
    razorpay_signature: {
      type: String,
      default: null,
    },
    // Payment details
    amount: {
      type: Number,
      required: true, // Amount in paise
    },
    currency: {
      type: String,
      default: "INR",
    },
    status: {
      type: String,
      enum: ["created", "paid", "failed", "refunded", "pending_offline", "rejected"],
      default: "created",
    },
    // Receipt details
    receiptNumber: {
      type: String,
      unique: true,
      sparse: true, // Only for successful payments
    },
    paymentMethod: {
      type: String,
      enum: ["razorpay", "offline", "manual"],
      default: "razorpay",
    },
    // Metadata
    validityPeriod: {
      type: Number,
      default: 365, // Days
    },
    validityStartDate: {
      type: Date,
      default: Date.now,
    },
    validityEndDate: {
      type: Date,
    },
    // Discounts/Coupons
    originalAmount: {
      type: Number,
    },
    discountAmount: {
      type: Number,
      default: 0,
    },
    couponCode: {
      type: String,
      default: null,
    },
    // Additional details
    notes: {
      type: String,
      default: "",
    },
    isDemo: {
      type: Boolean,
      default: false,
    },
    // Offline payment fields
    offlineSlipFilename: {
      type: String,
      default: null,
    },
    offlineSlipUrl: {
      type: String,
      default: null,
    },
    offlineNote: {
      type: String,
      default: "",
    },
    offlineReviewedAt: {
      type: Date,
    },
    offlineReviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
    },
    uploadedByRole: {
      type: String,
      enum: ["student", "admin", "system"],
      default: "student",
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt
  }
);

// Pre-save middleware to set validity end date and receipt number
paymentSchema.pre("save", function (next) {
  // Set validity end date if not set
  if (!this.validityEndDate && this.validityPeriod) {
    this.validityEndDate = new Date(
      this.validityStartDate.getTime() + this.validityPeriod * 24 * 60 * 60 * 1000
    );
  }

  // Generate receipt number for successful payments
  if (this.status === "paid" && !this.receiptNumber) {
    const timestamp = Date.now();
    this.receiptNumber = `RCP${timestamp}${Math.random().toString(36).substr(2, 4).toUpperCase()}`;
  }

  next();
});

// Instance methods
paymentSchema.methods.isExpired = function() {
  return this.validityEndDate && new Date() > this.validityEndDate;
};

paymentSchema.methods.getDaysRemaining = function() {
  if (!this.validityEndDate) return null;
  const today = new Date();
  const diffTime = this.validityEndDate - today;
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

// Static methods
paymentSchema.statics.getUserPayments = function(userId) {
  return this.find({ userId })
    .populate('courseId', 'name description price thumbnail')
    .sort({ createdAt: -1 });
};

paymentSchema.statics.getCoursePayments = function(courseId) {
  return this.find({ courseId, status: 'paid' })
    .populate('userId', 'name email phone')
    .sort({ createdAt: -1 });
};

// Indexes for better performance
paymentSchema.index({ userId: 1, courseId: 1 });
paymentSchema.index({ razorpay_order_id: 1 });
paymentSchema.index({ receiptNumber: 1 });
paymentSchema.index({ status: 1 });
paymentSchema.index({ createdAt: -1 });

module.exports = mongoose.model("Payment", paymentSchema);
