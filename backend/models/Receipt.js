const mongoose = require("mongoose");

const receiptSchema = new mongoose.Schema(
  {
    paymentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Payment",
      required: true,
    },
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
    receiptNumber: {
      type: String,
      required: true,
      unique: true,
    },
    // Receipt details
    amount: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      default: "INR",
    },
    taxAmount: {
      type: Number,
      default: 0,
    },
    totalAmount: {
      type: Number,
      required: true,
    },
    // Customer details at time of purchase
    customerDetails: {
      name: {
        type: String,
        required: true,
      },
      email: {
        type: String,
        required: true,
      },
      phone: {
        type: String,
      },
      address: {
        type: String,
      },
    },
    // Course details at time of purchase
    courseDetails: {
      name: {
        type: String,
        required: true,
      },
      description: {
        type: String,
      },
      price: {
        type: Number,
        required: true,
      },
    },
    // Company details
    companyDetails: {
      name: {
        type: String,
        default: "Your Education Platform",
      },
      address: {
        type: String,
        default: "Education Center, Learning City",
      },
      phone: {
        type: String,
        default: "+91 9999999999",
      },
      email: {
        type: String,
        default: "contact@youreducation.com",
      },
      gstin: {
        type: String,
        default: "GST123456789",
      },
    },
    // Receipt metadata
    receiptType: {
      type: String,
      enum: ["course_purchase", "subscription", "refund"],
      default: "course_purchase",
    },
    status: {
      type: String,
      enum: ["generated", "sent", "downloaded"],
      default: "generated",
    },
    generatedAt: {
      type: Date,
      default: Date.now,
    },
    downloadCount: {
      type: Number,
      default: 0,
    },
    lastDownloadedAt: {
      type: Date,
    },
    // PDF storage
    pdfPath: {
      type: String, // Path to stored PDF file
    },
    pdfUrl: {
      type: String, // URL to access PDF
    },
  },
  {
    timestamps: true,
  }
);

// Instance methods
receiptSchema.methods.markAsDownloaded = function() {
  this.downloadCount += 1;
  this.lastDownloadedAt = new Date();
  if (this.status === 'generated') {
    this.status = 'downloaded';
  }
  return this.save();
};

receiptSchema.methods.getReceiptData = function() {
  return {
    receiptNumber: this.receiptNumber,
    date: this.generatedAt,
    customer: this.customerDetails,
    course: this.courseDetails,
    company: this.companyDetails,
    amount: this.amount,
    taxAmount: this.taxAmount,
    totalAmount: this.totalAmount,
    currency: this.currency,
  };
};

// Static methods
receiptSchema.statics.getUserReceipts = function(userId) {
  return this.find({ userId })
    .populate('paymentId')
    .populate('courseId', 'name description price')
    .sort({ createdAt: -1 });
};

receiptSchema.statics.generateReceiptNumber = function() {
  const timestamp = Date.now();
  const randomStr = Math.random().toString(36).substr(2, 6).toUpperCase();
  return `RCP-${new Date().getFullYear()}-${timestamp}-${randomStr}`;
};

// Indexes
receiptSchema.index({ receiptNumber: 1 });
receiptSchema.index({ userId: 1 });
receiptSchema.index({ paymentId: 1 });
receiptSchema.index({ createdAt: -1 });

module.exports = mongoose.model("Receipt", receiptSchema);
