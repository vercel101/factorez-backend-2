const express = require("express");
const { getAllCoupons, generateCoupon, applyCoupon, deleteCoupon } = require("../controllers/couponCodeController");
const router = express.Router();

router.get("/allcoupon", getAllCoupons);
router.post("/generatecoupon", generateCoupon);
router.post("/applycoupon/:customerid", applyCoupon);
router.patch("/deletecoupon/:couponid", deleteCoupon);

module.exports = router;
