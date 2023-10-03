const express = require("express");
const router = express.Router();
const vendorController = require("../controllers/vendorController");
const { Authentication } = require("../middlewares/auth");

router.post("/addvendor", vendorController.addVendor);
router.get("/allvendors", vendorController.getAllVendors);
router.post("/create-vendor-by-admin", Authentication, vendorController.createVendorByAdmin);
router.put("/update-vendor-by-admin/:vendorId", Authentication, vendorController.updateVendor);

module.exports = router;
