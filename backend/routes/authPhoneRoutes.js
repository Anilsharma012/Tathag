const express = require("express");
const router = express.Router();
const authPhoneController = require("../controllers/authPhoneController");

router.post("/send-otp", authPhoneController.sendPhoneOtp);
router.post("/mobileVerify-otp", authPhoneController.verifyPhoneOtp);
router.post("/login-phone", authPhoneController.loginWithPhone);

module.exports = router;
