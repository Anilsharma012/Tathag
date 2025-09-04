// Routes/authEmailRoutes.js

const express = require("express");
const router = express.Router();
const authEmailController = require("../controllers/authEmailController");

router.post("/send-email", authEmailController.sendEmailOtp);
router.post("/verify", authEmailController.verifyEmailOtp);

module.exports = router;
