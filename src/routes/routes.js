const express = require("express");
const app = express();
const path = require("path");
const router = express.Router();
const multer = require("multer");
const csvController = require("../controllers/csvController");
const vendorModel = require("../models/vendorModel");
// const { upload } = require('../controllers/csvController');
const upload1 = multer({ storage: multer.memoryStorage() });

const vendorController = require("../controllers/vendorController");
const productController = require("../controllers/productController");
const logisticsController = require("../controllers/logisticsController");
// const addressController = require('../controllers/addressController');
const bankController = require("../controllers/bankController");
const documentController = require("../controllers/documentController");
const brandController = require("../controllers/brandController");
const cartController = require("../controllers/cartController");
const imageController = require("../controllers/imageController");
const categoryController = require("../controllers/categoryController");
const subcategoryController = require("../controllers/subcategoryController");
const ratingController = require("../controllers/ratingController");
const cartModel = require("../models/cartModel");
const { generatePdf } = require("../utils/generatePdf");

app.use(express.static(path.resolve(__dirname, "public")));

var storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "./public/uploads");
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname);
    },
});

var upload = multer({ storage: storage });

// CSV APIs
router.post("/importcsv", upload.single("file"), csvController.importCSV);
router.get("/exportcsv", csvController.exportCSV);

// VENDOR'S APIs
router.post("/vendor", vendorController.addVendor);

// LOGISTICS APIs
router.post("/logistics", logisticsController.addLogisticsDetails);

// BUSINESS APIs

// ADDRESS APIs
// router.post("/address", addressController.addAddress);

// BANK APIs
router.post("/bank", bankController.addBankDetails);

// DOCUMENT APIs
router.post("/document", documentController.addDocumentDetails);

// BRAND APIs
router.post("/brand", brandController.addBrand);
router.get("/brands", brandController.getAllBrands);

// CART APIs
// router.post("/cart", cartController.createCustomerCart);

// IMAGE API
router.post("/upload", upload1.single("filename"), imageController.uploadImage);

// CATEGORY API
router.post("/category", categoryController.addCategory);
router.get("/categories", categoryController.getAllCategories);
router.get("/category/:categoryId", categoryController.getCategoryById);
router.put("/category/:categoryId", categoryController.updateCategoryById);
router.delete("/category/:categoryId", categoryController.deleteCategoryById);

// SUBCATEGORY API
router.post("/subcategory", subcategoryController.addSubcategory);
router.get("/subcategories", subcategoryController.getAllSubcategories);

// RATING API
router.post("/rating", ratingController.addRating);
router.get("/ratings/:productId", ratingController.getAllRatings);

const data = {
    logo: "",
    brandName: "",
    soldBy: "",
    soldByAddress: "",
    soldByGst: "",
    invoiceNo: "",
    orderId: "",
    orderDate: "",
    invoiceDate: "",
    billToName: "",
    billToAddress: "",
    billToPhone: "",
    billToGST: "",
    shipToName: "",
    shipToAddress: "",
    shipToPhone: "",
    shipToGST: "",
    tableRow: [],
    totalAmt: "",
    totalCGSTAmt: "",
    totalSGSTAmt: "",
    totalIGSTAmt: "",
    taxableAmt: "",
    totalTaxAmt: "",
    grossTotalAmt: "",
    discountAmt: "",
    netPayableAmount: "",
};
data.tableRow = [
    {
        sno: "1",
        productName: "Demo Product 1",
        color: "Black",
        sizeSet: "5/2 7/2 8/2 9/2",
        hsnCode: "123456",
        qty: "5",
        rate: "800",
        total: "4000",
        cgstPercentage: "12",
        cgstAmount: "480",
        sgstPercentage: "12",
        sgstAmount: "480",
        igstPercentage: "",
        igstAmount: "",
    },
    {
        sno: "2",
        productName: "Demo Product 2",
        color: "Blue",
        sizeSet: "8/2 9/2 5/2 7/2",
        hsnCode: "123456",
        qty: "6",
        rate: "910",
        total: "5460",
        cgstPercentage: "12",
        cgstAmount: "655.20",
        sgstPercentage: "12",
        sgstAmount: "655.20",
        igstPercentage: "",
        igstAmount: "",
    },
    {
        sno: "3",
        productName: "Demo Product 2",
        color: "Blue",
        sizeSet: "8/2 9/2 5/2 7/2",
        hsnCode: "123456",
        qty: "6",
        rate: "910",
        total: "5460",
        cgstPercentage: "12",
        cgstAmount: "655.20",
        sgstPercentage: "12",
        sgstAmount: "655.20",
        igstPercentage: "",
        igstAmount: "",
    },
    {
        sno: "4",
        productName: "Demo Product 2",
        color: "Blue",
        sizeSet: "8/2 9/2 5/2 7/2",
        hsnCode: "123456",
        qty: "6",
        rate: "910",
        total: "5460",
        cgstPercentage: "12",
        cgstAmount: "655.20",
        sgstPercentage: "12",
        sgstAmount: "655.20",
        igstPercentage: "",
        igstAmount: "",
    },
    {
        sno: "5",
        productName: "Demo Product 2",
        color: "Blue",
        sizeSet: "8/2 9/2 5/2 7/2",
        hsnCode: "123456",
        qty: "6",
        rate: "910",
        total: "5460",
        cgstPercentage: "12",
        cgstAmount: "655.20",
        sgstPercentage: "12",
        sgstAmount: "655.20",
        igstPercentage: "",
        igstAmount: "",
    },
    {
        sno: "6",
        productName: "Demo Product 2",
        color: "Blue",
        sizeSet: "8/2 9/2 5/2 7/2",
        hsnCode: "123456",
        qty: "6",
        rate: "910",
        total: "5460",
        cgstPercentage: "12",
        cgstAmount: "655.20",
        sgstPercentage: "12",
        sgstAmount: "655.20",
        igstPercentage: "",
        igstAmount: "",
    },
    {
        sno: "7",
        productName: "Demo Product 2",
        color: "Blue",
        sizeSet: "8/2 9/2 5/2 7/2",
        hsnCode: "123456",
        qty: "6",
        rate: "910",
        total: "5460",
        cgstPercentage: "12",
        cgstAmount: "655.20",
        sgstPercentage: "12",
        sgstAmount: "655.20",
        igstPercentage: "",
        igstAmount: "",
    },
    {
        sno: "8",
        productName: "Demo Product 2",
        color: "Blue",
        sizeSet: "8/2 9/2 5/2 7/2",
        hsnCode: "123456",
        qty: "6",
        rate: "910",
        total: "5460",
        cgstPercentage: "12",
        cgstAmount: "655.20",
        sgstPercentage: "12",
        sgstAmount: "655.20",
        igstPercentage: "",
        igstAmount: "",
    },
    {
        sno: "9",
        productName: "Demo Product 2",
        color: "Blue",
        sizeSet: "8/2 9/2 5/2 7/2",
        hsnCode: "123456",
        qty: "6",
        rate: "910",
        total: "5460",
        cgstPercentage: "12",
        cgstAmount: "655.20",
        sgstPercentage: "12",
        sgstAmount: "655.20",
        igstPercentage: "",
        igstAmount: "",
    },
    {
        sno: "10",
        productName: "Demo Product 2",
        color: "Blue",
        sizeSet: "8/2 9/2 5/2 7/2",
        hsnCode: "123456",
        qty: "6",
        rate: "910",
        total: "5460",
        cgstPercentage: "12",
        cgstAmount: "655.20",
        sgstPercentage: "12",
        sgstAmount: "655.20",
        igstPercentage: "",
        igstAmount: "",
    },
    {
        sno: "11",
        productName: "Demo Product 2",
        color: "Blue",
        sizeSet: "8/2 9/2 5/2 7/2",
        hsnCode: "123456",
        qty: "6",
        rate: "910",
        total: "5460",
        cgstPercentage: "12",
        cgstAmount: "655.20",
        sgstPercentage: "12",
        sgstAmount: "655.20",
        igstPercentage: "",
        igstAmount: "",
    },
    {
        sno: "12",
        productName: "Demo Product 2",
        color: "Blue",
        sizeSet: "8/2 9/2 5/2 7/2",
        hsnCode: "123456",
        qty: "6",
        rate: "910",
        total: "5460",
        cgstPercentage: "12",
        cgstAmount: "655.20",
        sgstPercentage: "12",
        sgstAmount: "655.20",
        igstPercentage: "",
        igstAmount: "",
    },
    {
        sno: "13",
        productName: "Demo Product 2",
        color: "Blue",
        sizeSet: "8/2 9/2 5/2 7/2",
        hsnCode: "123456",
        qty: "6",
        rate: "910",
        total: "5460",
        cgstPercentage: "12",
        cgstAmount: "655.20",
        sgstPercentage: "12",
        sgstAmount: "655.20",
        igstPercentage: "",
        igstAmount: "",
    },
    {
        sno: "14",
        productName: "Demo Product 2",
        color: "Blue",
        sizeSet: "8/2 9/2 5/2 7/2",
        hsnCode: "123456",
        qty: "6",
        rate: "910",
        total: "5460",
        cgstPercentage: "12",
        cgstAmount: "655.20",
        sgstPercentage: "12",
        sgstAmount: "655.20",
        igstPercentage: "",
        igstAmount: "",
    },
    {
        sno: "15",
        productName: "Demo Product 2",
        color: "Blue",
        sizeSet: "8/2 9/2 5/2 7/2",
        hsnCode: "123456",
        qty: "6",
        rate: "910",
        total: "5460",
        cgstPercentage: "12",
        cgstAmount: "655.20",
        sgstPercentage: "12",
        sgstAmount: "655.20",
        igstPercentage: "",
        igstAmount: "",
    },
];
data.logo = "https://upload.wikimedia.org/wikipedia/commons/b/b6/Image_created_with_a_mobile_phone.png";
data.brandName = "Shoes House";
data.soldBy = "Mohit Shoes";
data.soldByAddress = "Vinayak logistic Park, Village Hinaura,hasanganj, Unnao-209859, Uttar Pradesh, Lucknow, UTTAR PRADESH, India - 209859, IN-UP";
data.soldByGst = "07AABCU9603R1ZX";
data.invoiceNo = "FSIN2300000007";

router.get("/demopdf", async (req, res) => {
    let pdf = await generatePdf(data, "shoeshouse.com");
    res.setHeader("Content-Type", "application/pdf");
    // res.setHeader("Content-Disposition", "attachment; filename=invoice.pdf");
    res.contentType("application/pdf");
    res.send(pdf);
});

module.exports = router;
