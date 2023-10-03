const express = require("express");
const router = express.Router();
const orderController = require("../controllers/orderController");
const orderStatusTableController = require("../controllers/orderStatusTableController");
const { Authentication, AuthenticationCustomer } = require("../middlewares/auth");
const orderedProductModel = require("../models/orderedProductModel");
const { exportOrderReport } = require("../controllers/excelFileController");

router.get("/orders", Authentication, orderController.getAllOrders);
router.get("/order/:customerId/:orderId", AuthenticationCustomer, orderController.getOrderByOrderId);
router.get("/orders/:customerId", AuthenticationCustomer, orderController.getOrdersByCustomerId);
router.get("/orderedproduct/:orderedproductid", orderController.getOrderedProduct);
router.post("/createorder/:customerId", orderController.createOrder);
router.put("/cancelorder/:orderId", orderController.cancelOrderByOrderId);
router.put("/updateorder/:orderId", Authentication, orderController.updateOrderByOrderId);
router.patch("/patchtrackingid/:orderId", orderController.patchTrackingIdByOrderId);
router.get("/getcancelledorders", Authentication, orderController.getAllCancelledOrder);

router.post("/order-report", Authentication, exportOrderReport);

module.exports = router;
