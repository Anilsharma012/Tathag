const Announcement = require('../models/Announcement');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure multer for file uploads (attachments)
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = 'uploads/announcements/';
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(file.originalname);
    cb(null, uniqueName);
  }
});

const fileFilter = (req, file, cb) => {
  // Allow images and documents
  const allowedTypes = /pdf|doc|docx|jpg|jpeg|png|gif/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Only PDF, Word documents, and images are allowed!'));
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: fileFilter
});

// Helper function to format file size
const formatFileSize = (bytes) => {
  if (!bytes) return '0 MB';
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
};

// Create announcement
const createAnnouncement = async (req, res) => {
  try {
    console.log('📢 Creating new announcement:', req.body);
    
    const { 
      title, 
      content, 
      type, 
      priority, 
      targetAudience, 
      isPinned, 
      expiryDate, 
      tags 
    } = req.body;

    // Process attachments if any
    let attachments = [];
    if (req.files && req.files.length > 0) {
      attachments = req.files.map(file => {
        const stats = fs.statSync(file.path);
        return {
          fileName: file.originalname,
          filePath: file.path,
          fileSize: formatFileSize(stats.size)
        };
      });
    }

    const mongoose = require('mongoose');

    // Ensure createdBy is a valid ObjectId; fallback to a dev admin id in non-prod
    let createdById = null;
    if (req.user && req.user.id) {
      if (mongoose.Types.ObjectId.isValid(req.user.id)) {
        createdById = req.user.id;
      } else {
        console.warn('Warning: req.user.id is not a valid ObjectId, using fallback dev admin id');
        createdById = (process.env.NODE_ENV !== 'production') ? '507f1f77bcf86cd799439011' : null;
      }
    }

    const announcement = new Announcement({
      title,
      content,
      type: type || 'general',
      priority: priority || 'medium',
      targetAudience: targetAudience || 'all',
      isPinned: isPinned === 'true' || isPinned === true,
      expiryDate: expiryDate ? new Date(expiryDate) : null,
      createdBy: createdById,
      attachments,
      tags: tags ? tags.split(',').map(tag => tag.trim()) : []
    });

    await announcement.save();

    // Populate creator info
    await announcement.populate('createdBy', 'name email');

    console.log('✅ Announcement created successfully:', announcement._id);
    
    res.status(201).json({
      success: true,
      message: 'Announcement created successfully',
      data: announcement
    });

  } catch (error) {
    console.error('❌ Error creating announcement:', error);
    
    // Delete uploaded files if database save fails
    if (req.files && req.files.length > 0) {
      req.files.forEach(file => {
        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Error creating announcement',
      error: error.message
    });
  }
};

// Get all announcements (admin)
const getAllAnnouncements = async (req, res) => {
  try {
    console.log('📢 Get all announcements request');
    
    const { page = 1, limit = 20, type, priority, targetAudience, search, isActive } = req.query;
    
    let query = {};
    
    if (type && type !== 'all') {
      query.type = type;
    }
    
    if (priority && priority !== 'all') {
      query.priority = priority;
    }
    
    if (targetAudience && targetAudience !== 'all') {
      query.targetAudience = targetAudience;
    }
    
    if (typeof isActive !== 'undefined') {
      query.isActive = isActive === 'true';
    }
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    const announcements = await Announcement.find(query)
      .populate('createdBy', 'name email')
      .sort({ isPinned: -1, createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Announcement.countDocuments(query);

    console.log(`✅ Found ${announcements.length} announcements`);
    
    res.status(200).json({
      success: true,
      data: announcements,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('❌ Error fetching announcements:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching announcements',
      error: error.message
    });
  }
};

// Get announcements for students
const getStudentAnnouncements = async (req, res) => {
  try {
    console.log('👨‍🎓 Get student announcements request');
    
    const { type, limit = 50 } = req.query;
    const userId = req.user ? req.user.id : null;
    
    let query = {
      isActive: true,
      targetAudience: { $in: ['all', 'students'] },
      $or: [
        { expiryDate: null },
        { expiryDate: { $gt: new Date() } }
      ]
    };
    
    if (type && type !== 'all') {
      query.type = type;
    }

    const announcements = await Announcement.find(query)
      .populate('createdBy', 'name')
      .sort({ isPinned: -1, createdAt: -1 })
      .limit(parseInt(limit))
      .select('-readBy'); // Don't send readBy array for performance

    // Add unread status for each announcement if user is logged in
    const announcementsWithReadStatus = announcements.map(announcement => {
      const announcementObj = announcement.toObject();
      
      if (userId) {
        // Check if user has read this announcement
        Announcement.findById(announcement._id).then(fullAnnouncement => {
          announcementObj.isUnread = !fullAnnouncement.isReadBy(userId);
        });
      } else {
        announcementObj.isUnread = true; // Mark as unread for non-logged users
      }
      
      // Add virtual fields
      announcementObj.timeAgo = announcement.timeAgo;
      announcementObj.formattedDate = announcement.formattedDate;
      
      return announcementObj;
    });

    console.log(`✅ Found ${announcements.length} student announcements`);
    
    res.status(200).json({
      success: true,
      data: announcementsWithReadStatus
    });

  } catch (error) {
    console.error('❌ Error fetching student announcements:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching announcements',
      error: error.message
    });
  }
};

// Mark announcement as read
const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    console.log('👁️ Mark announcement as read:', id, 'by user:', userId);
    
    const announcement = await Announcement.findById(id);
    
    if (!announcement) {
      return res.status(404).json({
        success: false,
        message: 'Announcement not found'
      });
    }

    await announcement.markAsRead(userId);
    
    res.status(200).json({
      success: true,
      message: 'Announcement marked as read'
    });

  } catch (error) {
    console.error('❌ Error marking announcement as read:', error);
    res.status(500).json({
      success: false,
      message: 'Error marking announcement as read',
      error: error.message
    });
  }
};

// Update announcement
const updateAnnouncement = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    console.log('📝 Update announcement request for ID:', id);
    
    const announcement = await Announcement.findById(id);
    
    if (!announcement) {
      return res.status(404).json({
        success: false,
        message: 'Announcement not found'
      });
    }

    // Update fields
    Object.keys(updateData).forEach(key => {
      if (key === 'tags' && typeof updateData[key] === 'string') {
        announcement[key] = updateData[key].split(',').map(tag => tag.trim());
      } else if (key === 'isPinned') {
        announcement[key] = updateData[key] === 'true' || updateData[key] === true;
      } else if (key === 'expiryDate') {
        announcement[key] = updateData[key] ? new Date(updateData[key]) : null;
      } else {
        announcement[key] = updateData[key];
      }
    });

    await announcement.save();
    await announcement.populate('createdBy', 'name email');

    console.log('✅ Announcement updated successfully');
    
    res.status(200).json({
      success: true,
      message: 'Announcement updated successfully',
      data: announcement
    });

  } catch (error) {
    console.error('❌ Error updating announcement:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating announcement',
      error: error.message
    });
  }
};

// Delete announcement
const deleteAnnouncement = async (req, res) => {
  try {
    const { id } = req.params;
    console.log('🗑️ Delete announcement request for ID:', id);
    
    const announcement = await Announcement.findById(id);
    
    if (!announcement) {
      return res.status(404).json({
        success: false,
        message: 'Announcement not found'
      });
    }

    // Delete associated files
    if (announcement.attachments && announcement.attachments.length > 0) {
      announcement.attachments.forEach(attachment => {
        if (fs.existsSync(attachment.filePath)) {
          fs.unlinkSync(attachment.filePath);
        }
      });
    }

    // Delete from database
    await Announcement.findByIdAndDelete(id);

    console.log('✅ Announcement deleted successfully');
    
    res.status(200).json({
      success: true,
      message: 'Announcement deleted successfully'
    });

  } catch (error) {
    console.error('❌ Error deleting announcement:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting announcement',
      error: error.message
    });
  }
};

// Get announcement by ID
const getAnnouncementById = async (req, res) => {
  try {
    const { id } = req.params;
    console.log('📢 Get announcement by ID:', id);
    
    const announcement = await Announcement.findById(id)
      .populate('createdBy', 'name email');
    
    if (!announcement) {
      return res.status(404).json({
        success: false,
        message: 'Announcement not found'
      });
    }

    console.log('✅ Announcement found');
    
    res.status(200).json({
      success: true,
      data: announcement
    });

  } catch (error) {
    console.error('❌ Error fetching announcement:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching announcement',
      error: error.message
    });
  }
};

// Get announcement statistics
const getAnnouncementStats = async (req, res) => {
  try {
    console.log('📊 Get announcement statistics');
    
    const stats = await Announcement.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          active: { $sum: { $cond: ['$isActive', 1, 0] } },
          pinned: { $sum: { $cond: ['$isPinned', 1, 0] } },
          totalViews: { $sum: '$viewCount' }
        }
      }
    ]);

    const typeStats = await Announcement.aggregate([
      { $group: { _id: '$type', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    const priorityStats = await Announcement.aggregate([
      { $group: { _id: '$priority', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    
    res.status(200).json({
      success: true,
      data: {
        overview: stats[0] || { total: 0, active: 0, pinned: 0, totalViews: 0 },
        byType: typeStats,
        byPriority: priorityStats
      }
    });

  } catch (error) {
    console.error('❌ Error fetching announcement stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching statistics',
      error: error.message
    });
  }
};

module.exports = {
  upload,
  createAnnouncement,
  getAllAnnouncements,
  getStudentAnnouncements,
  markAsRead,
  updateAnnouncement,
  deleteAnnouncement,
  getAnnouncementById,
  getAnnouncementStats
};
