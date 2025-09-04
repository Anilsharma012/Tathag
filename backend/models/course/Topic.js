 const mongoose=require("mongoose")

const topicSchema = new mongoose.Schema({
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
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    default: ""
  },
  order: {
    type: Number,
    default: 0
  },
  isFullTestSection: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });


module.exports = mongoose.model("Topic", topicSchema);