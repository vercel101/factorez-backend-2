const express = require("express");
const router = express.Router();
const orderStatusTableController = require("../controllers/orderStatusTableController");

const { Authentication } = require("../middlewares/auth");

router.post(
    "/change-order-status/:orderId",
    Authentication,
    orderStatusTableController.updateOrderStatusByOrderId
);

module.exports = router;
