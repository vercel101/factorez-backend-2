const express = require('express');
const router = express.Router();

const categoryController = require('../controllers/categoryController');



router.post("/category", categoryController.addCategory);
router.get('/categories', categoryController.getAllCategories);
// router.get('/category/:categoryId', productController.getProductById);
router.put('/category/:categoryId', categoryController.updateCategoryById);
// router.delete('/category/:categoryId', productController.addProduct);


module.exports = router;