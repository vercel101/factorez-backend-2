const express = require('express');
const router = express.Router();
const brandController = require('../controllers/brandController');
const {Authentication} = require("../middlewares/auth");


router.post("/brand", Authentication, brandController.addBrand);
router.get('/brands', Authentication,  brandController.getAllBrands);
router.get("/brands/:vendorId", Authentication, brandController.getAllBrandByVendor);
router.patch("/verifybrand/:brandId", Authentication, brandController.verifyBrandById);

module.exports = router;