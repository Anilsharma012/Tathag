const express = require("express");
const router = express.Router();
const subAdminController = require("../controllers/SubAdminController");
const { adminOnly, adminAuth, permitRoles } = require("../middleware/authMiddleware");

// Create SubAdmin (Admin only)
router.post("/create", adminOnly, subAdminController.createSubAdmin);

// Get all SubAdmins (Admin or SubAdmin allowed) - Using permitRoles example
router.get("/", permitRoles("admin", "subadmin"), subAdminController.getSubAdmins);

// Update SubAdmin info (Admin only)
router.put("/:id", adminOnly, subAdminController.updateSubAdmin);

// Change SubAdmin password (Admin only)
router.put("/change-password/:id", adminOnly, subAdminController.changePassword);

// Delete SubAdmin (Admin only)
router.delete("/:id", adminOnly, subAdminController.deleteSubAdmin);

// SubAdmin login (no auth needed)
router.post("/login", subAdminController.subAdminLogin);

module.exports = router;
