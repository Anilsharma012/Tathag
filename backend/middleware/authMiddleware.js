const jwt = require("jsonwebtoken");

// ✅ Helper: Token extract and verify
const verifyToken = (req) => {
  const authHeader = req.headers.authorization || req.header("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new Error("Token missing or malformed");
  }

  const token = authHeader.split(" ")[1];
  // Dev shortcut: accept any token containing 'admin' as admin in non-production
  if (process.env.NODE_ENV !== 'production' && /admin/i.test(token)) {
    // Use a valid ObjectId string for dev tokens to avoid Mongoose cast errors
    return { id: '507f1f77bcf86cd799439011', role: 'admin', email: 'admin@dev.com', name: 'Development Admin' };
  }
  return jwt.verify(token, process.env.JWT_SECRET || 'secret_admin_key');
};

// ✅ 1. Normal user middleware
const authMiddleware = async (req, res, next) => {
  console.log('🔍 Auth Middleware called for:', req.method, req.path);
  console.log('NODE_ENV:', process.env.NODE_ENV);

  try {
    // First, try to verify if there's a valid JWT token (for admin/real users)
    const authHeader = req.headers.authorization || req.header("Authorization");

    if (authHeader && authHeader.startsWith("Bearer ")) {
      try {
        const token = authHeader.split(" ")[1];

        // In development mode, check for admin token shortcut
        if (process.env.NODE_ENV === 'development' && token.includes('admin')) {
          console.log('🔧 Development admin token detected, using admin user');
          req.user = {
            id: '507f1f77bcf86cd799439011',
            role: 'admin',
            email: 'admin@dev.com',
            name: 'Development Admin'
          };
          return next();
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'test_secret_key_for_development');

        // If token is valid, use the decoded user (admin/subadmin/real student)
        req.user = decoded;
        console.log('✅ Valid JWT token found, user role:', decoded.role);
        return next();
      } catch (tokenError) {
        console.log('⚠️ Invalid token provided, falling back to demo user');
      }
    }

    // If no valid token, use demo student user (for student-only routes)
    console.log('🔧 Development mode - using demo student user');
    const User = require("../models/UserSchema");

    const demoEmail = 'demo@test.com';
    let demoUser = await User.findOne({ email: demoEmail });

    // If not found, try by hardcoded ID as fallback
    if (!demoUser) {
      const demoUserId = '507f1f77bcf86cd799439011';
      demoUser = await User.findById(demoUserId);
    }

    if (demoUser) {
      req.user = {
        id: demoUser._id.toString(),
        role: 'student',
        email: demoUser.email || 'demo@test.com',
        name: demoUser.name || 'Demo Student'
      };
      console.log('✅ Demo student user found:', req.user.id);
    } else {
      // Fallback to hardcoded user
      req.user = {
        id: '507f1f77bcf86cd799439011',
        role: 'student',
        email: 'demo@test.com',
        name: 'Demo Student'
      };
      console.log('⚠️ Demo user not found, using hardcoded fallback');
    }

    // Ensure req.user.id is a valid ObjectId string in development to avoid Mongoose cast errors
    try {
      const mongoose = require('mongoose');
      if (!req.user || !req.user.id || !mongoose.Types.ObjectId.isValid(req.user.id)) {
        if (process.env.NODE_ENV !== 'production') {
          console.warn('authMiddleware: req.user.id invalid, normalizing to dev admin id');
          req.user = req.user || {};
          req.user.id = '507f1f77bcf86cd799439011';
          req.user.role = req.user.role || 'admin';
        }
      }
    } catch (e) {
      console.warn('authMiddleware normalization failed', e);
    }

    return next();
  } catch (error) {
    console.error('Error in authMiddleware:', error);
    // Fallback to hardcoded user on error
    req.user = {
      id: '507f1f77bcf86cd799439011',
      role: 'student',
      email: 'demo@test.com',
      name: 'Demo Student'
    };
    return next();
  }
};

// ✅ 2. Admin + Subadmin access middleware
const adminAuth = (req, res, next) => {
  try {
    const decoded = verifyToken(req);
    if (decoded.role !== "admin" && decoded.role !== "subadmin") {
      return res.status(403).json({ message: "❌ Access Denied! Admin/Subadmin only" });
    }
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: "❌ Unauthorized! Invalid Token" });
  }
};



const adminOnly = (req, res, next) => {
  try {
    const decoded = verifyToken(req);
    if (decoded.role !== "admin") {
      return res.status(403).json({ message: "❌ Access Denied! Admin only" });
    }
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: "❌ Unauthorized! Invalid Token" });
  }
};


const permitRoles = (...roles) => (req, res, next) => {
  try {
    const decoded = verifyToken(req);
    if (!roles.includes(decoded.role)) {
      return res.status(403).json({ message: "❌ Access Denied! Insufficient permissions" });
    }
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: "❌ Unauthorized! Invalid Token" });
  }
};


// ✅ Optional auth middleware - sets user if token is valid, but doesn't block request
const optionalAuth = (req, res, next) => {
  try {
    const decoded = verifyToken(req);
    req.user = decoded;
  } catch (error) {
    console.log('ℹ️ Optional Auth: No valid token provided, continuing as guest');
    req.user = null;
  }
  next();
};

module.exports = { authMiddleware, adminAuth, adminOnly, permitRoles, verifyToken, optionalAuth };
