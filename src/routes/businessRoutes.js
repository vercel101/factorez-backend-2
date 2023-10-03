const express = require("express");
const router = express.Router();
const { addBusinessInfo, saveSocialMedia, addBusinessGST, getBusinessInfo, addBusinessFiles, setDefaultGst } = require("../controllers/businessController");
const { Authentication } = require("../middlewares/auth");

router.post("/addbusinessinfo", Authentication, addBusinessInfo);
router.post("/addbusinessgst", Authentication, addBusinessGST);
router.get("/getbusinessinfo", Authentication, getBusinessInfo);
router.post("/addbusinessfiles", Authentication, addBusinessFiles);
router.patch("/updatedefgst", Authentication, setDefaultGst);
router.post("/savesocialmedia", Authentication, saveSocialMedia);

module.exports = router;
