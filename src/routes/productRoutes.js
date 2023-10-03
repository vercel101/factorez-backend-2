const express = require("express");
const app = express();
const router = express.Router();

const productController = require("../controllers/productController");
const { Authentication, AuthenticationCustomer } = require("../middlewares/auth");
const { AddProductRole, AllProductRole, verifyProudct, outOfStockProduct } = require("../middlewares/roleAuth");
const { exportIDs, exportProductAddDemoSheet, csvToJson } = require("../controllers/excelFileController");

// PRODUCT ROUTES
router.post("/product", Authentication, productController.addProduct);
router.get("/products", Authentication, AllProductRole, productController.getAllProducts);
router.get("/allproducts", Authentication, productController.getAllProductsForFilter);
router.get("/dashboardproduct", AuthenticationCustomer, productController.getAllProductsForDashboard);
router.get("/product/:productId", productController.getProductById);
router.patch("/changeproductstatus/:productId", Authentication, verifyProudct, productController.changeProductStatus);
router.patch("/changeproductstockstatus/:productId", Authentication, outOfStockProduct, productController.changeProductStockStatus);
router.put("/updateproduct/:productId", Authentication, productController.updateProduct);

// router.post("/csvupload", productController.csvProduct);
router.get("/downloadDependencies", Authentication, exportIDs);
router.get("/downloadprodctxlsx", Authentication, exportProductAddDemoSheet);
router.post("/bulkproductupload", Authentication, csvToJson);

module.exports = router;
