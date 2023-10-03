const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');

const { Authentication } = require('../middlewares/auth');


router.post("/addpayment/:orderId", paymentController.createPayment);
router.put("/updatepaymentstatus/:paymentId", paymentController.updatePaymentStatus);
router.post("/createpayment/:orderId", paymentController.addPayment);


module.exports = router;