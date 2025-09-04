const StudyMaterial = require('../models/StudyMaterial');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = 'uploads/study-materials/';
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
  // Allow PDF, Word docs, images, and video files
  const allowedTypes = /pdf|doc|docx|jpg|jpeg|png|mp4|avi|mov|wmv/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Only PDF, Word documents, images, and video files are allowed!'));
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 100 * 1024 * 1024 // 100MB limit
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

// Helper function to determine file type from extension
const getFileType = (filename) => {
  const ext = path.extname(filename).toLowerCase();
  if (['.pdf'].includes(ext)) return 'PDF';
  if (['.doc', '.docx'].includes(ext)) return 'Notes';
  if (['.mp4', '.avi', '.mov', '.wmv'].includes(ext)) return 'Video';
  if (['.jpg', '.jpeg', '.png'].includes(ext)) return 'Other';
  return 'Other';
};

// Upload study material
const uploadStudyMaterial = async (req, res) => {
  try {
    console.log('📚 Upload study material request:', req.body);
    
    const { title, description, subject, tags, courseId } = req.body;
    
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    // Get file stats for size
    const stats = fs.statSync(req.file.path);
    const fileSize = formatFileSize(stats.size);
    const fileType = req.body.type || getFileType(req.file.originalname);

    const studyMaterial = new StudyMaterial({
      title,
      description,
      subject,
      type: fileType,
      fileName: req.file.originalname,
      filePath: req.file.path,
      fileSize,
      uploadedBy: req.user.id, // From auth middleware
      tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
      courseId: courseId || null
    });

    await studyMaterial.save();

    console.log('✅ Study material uploaded successfully:', studyMaterial._id);
    
    res.status(201).json({
      success: true,
      message: 'Study material uploaded successfully',
      data: studyMaterial
    });

  } catch (error) {
    console.error('❌ Error uploading study material:', error);
    
    // Delete uploaded file if database save fails
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    
    res.status(500).json({
      success: false,
      message: 'Error uploading study material',
      error: error.message
    });
  }
};

// Get all study materials (for admin)
const getAllStudyMaterials = async (req, res) => {
  try {
    console.log('📚 Get all study materials request');
    
    const { page = 1, limit = 20, subject, type, search } = req.query;
    
    let query = {};
    
    if (subject && subject !== 'All Subjects') {
      query.subject = subject;
    }
    
    if (type && type !== 'All Types') {
      query.type = type;
    }
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    const materials = await StudyMaterial.find(query)
      .populate('uploadedBy', 'name email')
      .populate('courseId', 'name')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await StudyMaterial.countDocuments(query);

    console.log(`✅ Found ${materials.length} study materials`);
    
    res.status(200).json({
      success: true,
      data: materials,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('❌ Error fetching study materials:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching study materials',
      error: error.message
    });
  }
};

// Get study materials for students (only active)
const getStudentStudyMaterials = async (req, res) => {
  try {
    console.log('👨‍🎓 Get student study materials request');
    
    const { subject, type } = req.query;
    
    let query = { isActive: true };
    
    if (subject && subject !== 'All Subjects') {
      query.subject = subject;
    }
    
    if (type && type !== 'All Types') {
      query.type = type;
    }

    const materials = await StudyMaterial.find(query)
      .populate('uploadedBy', 'name')
      .select('-filePath') // Don't expose file path to students
      .sort({ createdAt: -1 });

    console.log(`✅ Found ${materials.length} study materials for students`);
    
    res.status(200).json({
      success: true,
      data: materials
    });

  } catch (error) {
    console.error('❌ Error fetching student study materials:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching study materials',
      error: error.message
    });
  }
};

// Download study material
const downloadStudyMaterial = async (req, res) => {
  try {
    const { id } = req.params;
    console.log('📥 Download study material request for ID:', id);
    
    const material = await StudyMaterial.findById(id);
    
    if (!material) {
      return res.status(404).json({
        success: false,
        message: 'Study material not found'
      });
    }

    if (!material.isActive) {
      return res.status(403).json({
        success: false,
        message: 'This study material is no longer available'
      });
    }

    // Check if file exists
    if (!fs.existsSync(material.filePath)) {
      return res.status(404).json({
        success: false,
        message: 'File not found on server'
      });
    }

    // Increment download count
    await material.incrementDownload();
    
    console.log('✅ Serving file for download:', material.fileName);
    
    // Set headers for file download
    res.setHeader('Content-Disposition', `attachment; filename="${material.fileName}"`);
    res.setHeader('Content-Type', 'application/octet-stream');
    
    // Stream the file
    const fileStream = fs.createReadStream(material.filePath);
    fileStream.pipe(res);

  } catch (error) {
    console.error('❌ Error downloading study material:', error);
    res.status(500).json({
      success: false,
      message: 'Error downloading study material',
      error: error.message
    });
  }
};

// Update study material
const updateStudyMaterial = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, subject, type, tags, isActive } = req.body;
    
    console.log('📝 Update study material request for ID:', id);
    
    const material = await StudyMaterial.findById(id);
    
    if (!material) {
      return res.status(404).json({
        success: false,
        message: 'Study material not found'
      });
    }

    // Update fields
    if (title) material.title = title;
    if (description) material.description = description;
    if (subject) material.subject = subject;
    if (type) material.type = type;
    if (tags) material.tags = tags.split(',').map(tag => tag.trim());
    if (typeof isActive !== 'undefined') material.isActive = isActive;

    await material.save();

    console.log('✅ Study material updated successfully');
    
    res.status(200).json({
      success: true,
      message: 'Study material updated successfully',
      data: material
    });

  } catch (error) {
    console.error('❌ Error updating study material:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating study material',
      error: error.message
    });
  }
};

// Delete study material
const deleteStudyMaterial = async (req, res) => {
  try {
    const { id } = req.params;
    console.log('🗑️ Delete study material request for ID:', id);
    
    const material = await StudyMaterial.findById(id);
    
    if (!material) {
      return res.status(404).json({
        success: false,
        message: 'Study material not found'
      });
    }

    // Delete file from filesystem
    if (fs.existsSync(material.filePath)) {
      fs.unlinkSync(material.filePath);
    }

    // Delete from database
    await StudyMaterial.findByIdAndDelete(id);

    console.log('✅ Study material deleted successfully');
    
    res.status(200).json({
      success: true,
      message: 'Study material deleted successfully'
    });

  } catch (error) {
    console.error('❌ Error deleting study material:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting study material',
      error: error.message
    });
  }
};

// Get study material by ID
const getStudyMaterialById = async (req, res) => {
  try {
    const { id } = req.params;
    console.log('📚 Get study material by ID:', id);
    
    const material = await StudyMaterial.findById(id)
      .populate('uploadedBy', 'name email')
      .populate('courseId', 'name');
    
    if (!material) {
      return res.status(404).json({
        success: false,
        message: 'Study material not found'
      });
    }

    console.log('✅ Study material found');
    
    res.status(200).json({
      success: true,
      data: material
    });

  } catch (error) {
    console.error('❌ Error fetching study material:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching study material',
      error: error.message
    });
  }
};

module.exports = {
  upload,
  uploadStudyMaterial,
  getAllStudyMaterials,
  getStudentStudyMaterials,
  downloadStudyMaterial,
  updateStudyMaterial,
  deleteStudyMaterial,
  getStudyMaterialById
};
