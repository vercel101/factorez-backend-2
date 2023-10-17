const express = require("express");
const { Authentication } = require("../middlewares/auth");
const { getDashboardData } = require("../controllers/adminDashboard");
const router = express.Router();

router.get("/admin-dashboard", Authentication, getDashboardData);

module.exports = router;
