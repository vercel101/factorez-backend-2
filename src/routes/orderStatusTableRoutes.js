const express = require("express");
const router = express.Router();
const orderStatusTableController = require("../controllers/orderStatusTableController");

const { Authentication } = require("../middlewares/auth");

router.post("/change-order-status/:orderId", Authentication, orderStatusTableController.updateOrderStatusByOrderId);
router.post("/change-bulk-order-status", Authentication, orderStatusTableController.bulkOrderProcess);
router.post("/return-order-status/:orderId", Authentication, orderStatusTableController.cancelOrderReturnById);

module.exports = router;
