const express = require("express");
const { Authentication } = require("../middlewares/auth");
const { addFeaturedProducts, removeFeaturedProduct, getFeaturedProduct } = require("../controllers/homepageController");
const router = express.Router();

router.post("/bestsellingproducts", Authentication, addFeaturedProducts);
router.post("/removebestsellingproduct", Authentication, removeFeaturedProduct);
router.get("/allbestsellingproduct", Authentication, getFeaturedProduct);

module.exports = router;