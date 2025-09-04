const mongoose = require("mongoose");

const userProgressSchema = new mongoose.Schema(
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
    lessonProgress: [
      {
        lessonId: {
          type: String, // Can be testId, materialId, etc.
          required: true,
        },
        lessonType: {
          type: String,
          enum: ["test", "video", "pdf", "notes"],
          required: true,
        },
        status: {
          type: String,
          enum: ["not_started", "in_progress", "completed"],
          default: "not_started",
        },
        progress: {
          type: Number, // Percentage (0-100)
          default: 0,
        },
        lastAccessedAt: {
          type: Date,
          default: Date.now,
        },
        completedAt: {
          type: Date,
          default: null,
        },
        timeSpent: {
          type: Number, // in seconds
          default: 0,
        },
      },
    ],
    lastAccessedLesson: {
      lessonId: String,
      lessonType: String,
      accessedAt: {
        type: Date,
        default: Date.now,
      },
    },
    overallProgress: {
      type: Number, // Percentage (0-100)
      default: 0,
    },
    totalTimeSpent: {
      type: Number, // Total time spent in seconds
      default: 0,
    },
  },
  { timestamps: true }
);

// Compound index for efficient queries
userProgressSchema.index({ userId: 1, courseId: 1 }, { unique: true });

// Method to update lesson progress
userProgressSchema.methods.updateLessonProgress = function(lessonId, lessonType, progressData) {
  const existingLesson = this.lessonProgress.find(
    (lesson) => lesson.lessonId === lessonId
  );

  if (existingLesson) {
    // Update existing lesson progress
    Object.assign(existingLesson, progressData, {
      lastAccessedAt: new Date(),
    });
  } else {
    // Add new lesson progress
    this.lessonProgress.push({
      lessonId,
      lessonType,
      ...progressData,
      lastAccessedAt: new Date(),
    });
  }

  // Update last accessed lesson
  this.lastAccessedLesson = {
    lessonId,
    lessonType,
    accessedAt: new Date(),
  };

  // Recalculate overall progress
  this.calculateOverallProgress();
};

// Method to calculate overall progress
userProgressSchema.methods.calculateOverallProgress = function() {
  if (this.lessonProgress.length === 0) {
    this.overallProgress = 0;
    return;
  }

  const totalProgress = this.lessonProgress.reduce(
    (sum, lesson) => sum + lesson.progress,
    0
  );
  this.overallProgress = Math.round(totalProgress / this.lessonProgress.length);
};

// Method to get resume lesson (last accessed or first incomplete)
userProgressSchema.methods.getResumeLesson = function() {
  // If there's a last accessed lesson, return it
  if (this.lastAccessedLesson && this.lastAccessedLesson.lessonId) {
    return this.lastAccessedLesson;
  }

  // Otherwise, find first incomplete lesson
  const incompleteLesson = this.lessonProgress.find(
    (lesson) => lesson.status !== "completed"
  );

  if (incompleteLesson) {
    return {
      lessonId: incompleteLesson.lessonId,
      lessonType: incompleteLesson.lessonType,
    };
  }

  return null;
};

module.exports = mongoose.model("UserProgress", userProgressSchema);
