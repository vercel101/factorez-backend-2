const express = require('express');
const router = express.Router();
const {Authentication} = require("../middlewares/auth");
const {colorRole} = require("../middlewares/roleAuth");
const {getAllColor, addNewColor, deleteColorById} = require("../controllers/colorController");


router.get('/getallcolors', getAllColor);
router.post("/addnewcolor", Authentication, colorRole, addNewColor);
router.delete("/deletecolorbyid/:colorId", Authentication, colorRole, deleteColorById);

module.exports = router;