const mongoose = require("mongoose");

const practiceTestSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: "",
    },
    testType: {
      type: String,
      enum: ["Daily", "Weekly"],
      required: true,
    },
    duration: {
      type: Number, // Total duration in minutes
      required: true,
    },
    sectionWiseTiming: {
      type: Boolean,
      default: false, // If true, each section has its own timer
    },
    instructions: {
      type: String,
      default: "",
    },
    sections: [{
      name: {
        type: String,
        enum: ["Quant", "LRDI", "VARC"],
        required: true,
      },
      duration: {
        type: Number, // Duration in minutes for this section
        required: true,
      },
      totalQuestions: {
        type: Number,
        default: 0,
      },
      totalMarks: {
        type: Number,
        default: 0,
      }
    }],
    published: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      required: true,
    },
    totalQuestions: {
      type: Number,
      default: 0,
    },
    totalMarks: {
      type: Number,
      default: 0, // Out of 300 for CAT style
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("PracticeTest", practiceTestSchema);
