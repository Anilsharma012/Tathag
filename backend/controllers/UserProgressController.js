const UserProgress = require("../models/UserProgress");
const { authMiddleware } = require("../middleware/authMiddleware");

// Get user progress for a specific course
exports.getUserProgress = async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.user.id;

    // Special case for admin dev user in development
    if (process.env.NODE_ENV === 'development' && userId === '507f1f77bcf86cd799439011') {
      console.log('🔧 Admin dev user detected, returning empty progress');
      const mockProgress = {
        _id: 'admin-progress-' + courseId,
        userId: '507f1f77bcf86cd799439011',
        courseId,
        lessonProgress: [],
        overallProgress: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      return res.status(200).json({
        success: true,
        progress: mockProgress,
      });
    }

    let progress = await UserProgress.findOne({ userId, courseId });

    if (!progress) {
      // Create new progress record if it doesn't exist
      progress = new UserProgress({
        userId,
        courseId,
        lessonProgress: [],
        overallProgress: 0,
      });
      await progress.save();
    }

    res.status(200).json({
      success: true,
      progress,
    });
  } catch (error) {
    console.error("Error fetching user progress:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch user progress",
    });
  }
};

// Update lesson progress
exports.updateLessonProgress = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { lessonId, lessonType, status, progress, timeSpent } = req.body;
    const userId = req.user.id;

    // Validate required fields
    if (!lessonId || !lessonType) {
      return res.status(400).json({
        success: false,
        message: "lessonId and lessonType are required",
      });
    }

    // Special case for admin dev user in development
    if (process.env.NODE_ENV === 'development' && userId === '507f1f77bcf86cd799439011') {
      console.log('🔧 Admin dev user detected, skipping lesson progress update');
      return res.status(200).json({
        success: true,
        message: "Lesson progress updated (admin dev mode)",
      });
    }

    let userProgress = await UserProgress.findOne({ userId, courseId });

    if (!userProgress) {
      // Create new progress record
      userProgress = new UserProgress({
        userId,
        courseId,
        lessonProgress: [],
        overallProgress: 0,
      });
    }

    // Update lesson progress
    const progressData = {};
    if (status !== undefined) progressData.status = status;
    if (progress !== undefined) progressData.progress = progress;
    if (timeSpent !== undefined) progressData.timeSpent = timeSpent;
    if (status === "completed") progressData.completedAt = new Date();

    userProgress.updateLessonProgress(lessonId, lessonType, progressData);

    // Update total time spent
    if (timeSpent !== undefined) {
      userProgress.totalTimeSpent += timeSpent;
    }

    await userProgress.save();

    res.status(200).json({
      success: true,
      message: "Progress updated successfully",
      progress: userProgress,
    });
  } catch (error) {
    console.error("Error updating lesson progress:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update lesson progress",
    });
  }
};

// Get resume lesson for a course
exports.getResumeLesson = async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.user.id;

    // Special case for admin dev user in development
    if (process.env.NODE_ENV === 'development' && userId === '507f1f77bcf86cd799439011') {
      console.log('🔧 Admin dev user detected, returning no resume lesson');
      return res.status(200).json({
        success: true,
        resumeLesson: null,
      });
    }

    const progress = await UserProgress.findOne({ userId, courseId });

    let resumeLesson = null;
    if (progress) {
      resumeLesson = progress.getResumeLesson();
    }

    res.status(200).json({
      success: true,
      resumeLesson,
    });
  } catch (error) {
    console.error("Error getting resume lesson:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get resume lesson",
    });
  }
};

// Mark lesson as started (update last accessed)
exports.startLesson = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { lessonId, lessonType } = req.body;
    const userId = req.user.id;

    if (!lessonId || !lessonType) {
      return res.status(400).json({
        success: false,
        message: "lessonId and lessonType are required",
      });
    }

    // Special case for admin dev user in development
    if (process.env.NODE_ENV === 'development' && userId === '507f1f77bcf86cd799439011') {
      console.log('🔧 Admin dev user detected, skipping lesson start tracking');
      return res.status(200).json({
        success: true,
        message: "Lesson started (admin dev mode)",
      });
    }

    let userProgress = await UserProgress.findOne({ userId, courseId });

    if (!userProgress) {
      userProgress = new UserProgress({
        userId,
        courseId,
        lessonProgress: [],
        overallProgress: 0,
      });
    }

    // Update lesson progress to "in_progress" if not already completed
    const existingLesson = userProgress.lessonProgress.find(
      (lesson) => lesson.lessonId === lessonId
    );

    const progressData = {
      status: existingLesson?.status === "completed" ? "completed" : "in_progress",
    };

    userProgress.updateLessonProgress(lessonId, lessonType, progressData);
    await userProgress.save();

    res.status(200).json({
      success: true,
      message: "Lesson started successfully",
      progress: userProgress,
    });
  } catch (error) {
    console.error("Error starting lesson:", error);
    res.status(500).json({
      success: false,
      message: "Failed to start lesson",
    });
  }
};

// Get overall course progress summary
exports.getCourseProgressSummary = async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.user.id;

    const progress = await UserProgress.findOne({ userId, courseId });

    if (!progress) {
      return res.status(200).json({
        success: true,
        summary: {
          overallProgress: 0,
          totalLessons: 0,
          completedLessons: 0,
          totalTimeSpent: 0,
          lastAccessedAt: null,
        },
      });
    }

    const completedLessons = progress.lessonProgress.filter(
      (lesson) => lesson.status === "completed"
    ).length;

    const lastAccessedAt = progress.lastAccessedLesson?.accessedAt || progress.updatedAt;

    res.status(200).json({
      success: true,
      summary: {
        overallProgress: progress.overallProgress,
        totalLessons: progress.lessonProgress.length,
        completedLessons,
        totalTimeSpent: progress.totalTimeSpent,
        lastAccessedAt,
      },
    });
  } catch (error) {
    console.error("Error getting course progress summary:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get course progress summary",
    });
  }
};
