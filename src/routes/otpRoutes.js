const express = require("express");
const { sendOTP, verityOTP, forgetPasswordUsingOtp } = require("../controllers/otpController");
const { sentOTP, verifyOTP } = require('../controllers/OTP');
const router = express.Router();

// router.get("/sendotp/:phone", sendOTP);
router.get("/verifyotp/:phone/:otpCode", verityOTP);
router.post("/forget-password/:phone/:otpCode", forgetPasswordUsingOtp);

// router.post("/messages", sendSMS);
router.post("/sendOTP", sentOTP);
router.post("/verifyOTP", verifyOTP);

module.exports = router;
