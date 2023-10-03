const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");
const { Authentication } = require("../middlewares/auth");
const { AddProductRole } = require("../middlewares/roleAuth");
const { uploadFile } = require("../controllers/imageController");

router.post("/addadmin", Authentication, adminController.addAdmin);
router.get("/getadmin", Authentication, adminController.getAllAdmin);
router.put("/update-admin/:adminid", Authentication, adminController.updateAdminInfo);
router.delete("/delete-admin/:adminid", Authentication, adminController.deleteAdminById);
router.post("/adminlogin", adminController.adminLogin);
router.post("/createsuperadmin/:secretKey", adminController.createSuperAdmin);
router.get("/alladminenums", Authentication, adminController.getAllSubadminEnums);
router.put("/verifyvendor/:vendorId", Authentication, adminController.verifyVendor);
router.put("/changevendorpassword", adminController.changeVendorPassword);
router.delete("/deleteVendor", Authentication, adminController.deleteVendor);

module.exports = router;
