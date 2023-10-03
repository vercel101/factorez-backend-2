const express = require("express");
const { getOrderReport, exportSaleReport, exportPurchaseReport, getPaymentReport, updatePaymentReport } = require("../controllers/reportController");
const { Authentication } = require("../middlewares/auth");
const router = express.Router();

router.get("/order-report", Authentication, getOrderReport);
router.post("/export-sale-report", Authentication, exportSaleReport);
router.post("/export-purchase-report", Authentication, exportPurchaseReport);
router.get("/payment-report", Authentication, getPaymentReport);
router.put("/update-payment-report/:orderid", Authentication, updatePaymentReport)

module.exports = router;
