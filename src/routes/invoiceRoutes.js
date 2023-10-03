const express = require("express");
const router = express.Router();
const { Authentication, AuthenticationCustomer } = require("../middlewares/auth");
const { getAllPurchaseInvoice, getAllSaleInvoice, downoadInvoiceByInvoiceNumber } = require("../controllers/invoiceController");

router.get("/purchaseinvoice", Authentication, getAllPurchaseInvoice);
router.get("/saleinvoice", Authentication, getAllSaleInvoice);
router.get("/downloadpdf/:invoicenumber/:invoicetype", Authentication, downoadInvoiceByInvoiceNumber);
router.get("/customer-downloadpdf/:invoicenumber/:invoicetype", AuthenticationCustomer, downoadInvoiceByInvoiceNumber);

module.exports = router;
