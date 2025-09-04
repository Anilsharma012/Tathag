const mongoose=require("mongoose")
const testSchema = new mongoose.Schema({
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Course",
    required: true
  },
  subject: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Subject",
    required: true
  },
  chapter: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Chapter",
    required: true
  },
  topic: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Topic",
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  duration: {
    type: Number,
    default: 30
  },
  totalMarks: {
    type: Number,
    default: 0
  },
  instructions: {
    type: String,
    default: ""
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

module.exports = mongoose.model("Test", testSchema);
