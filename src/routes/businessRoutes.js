const express = require("express");
const router = express.Router();
const {
    addBusinessInfo,
    saveSocialMedia,
    addBusinessGST,
    getBusinessInfo,
    addBusinessFiles,
    setDefaultGst,
    bannerForClientPage,
    getBannerForClientPage,
    bannerDeleteById,
} = require("../controllers/businessController");
const { Authentication, AuthenticationCustomer } = require("../middlewares/auth");

router.post("/addbusinessinfo", Authentication, addBusinessInfo);
router.post("/addbusinessgst", Authentication, addBusinessGST);
router.get("/getbusinessinfo", Authentication, getBusinessInfo);
router.post("/addbusinessfiles", Authentication, addBusinessFiles);
router.patch("/updatedefgst", Authentication, setDefaultGst);
router.post("/savesocialmedia", Authentication, saveSocialMedia);
router.post("/bannerupload", Authentication, bannerForClientPage);
router.get("/bannerimages", Authentication, getBannerForClientPage);
router.get("/bannerimagesforclient", AuthenticationCustomer, getBannerForClientPage);
router.delete("/deletebanner/:bannerId", Authentication, bannerDeleteById);

module.exports = router;
