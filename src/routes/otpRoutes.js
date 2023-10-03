const express = require("express");
const { sendOTP, verityOTP, forgetPasswordUsingOtp } = require("../controllers/otpController");
const router = express.Router();

router.get("/sendotp/:phone", sendOTP);
router.get("/verifyotp/:phone/:otpCode", verityOTP);
router.post("/forget-password/:phone/:otpCode", forgetPasswordUsingOtp);

module.exports = router;
