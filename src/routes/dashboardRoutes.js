const express = require("express");
const { AuthenticationCustomer } = require("../middlewares/auth");
const { getDashboardData, getProductBySlug } = require("../controllers/dashboardController");
const router = express.Router();

router.get("/get-store-info", getDashboardData);
router.get("/get-product-info-by-id/:slug", getProductBySlug);

module.exports = router;
