const express = require("express");
const router = express.Router();
const { Authentication } = require("../middlewares/auth");
const { updateProfile, changePassword } = require("../controllers/profileController");

router.put("/update-userprofile", Authentication, updateProfile);
router.post("/changePassword", changePassword);

module.exports = router;
