const customerModel = require("../models/customerModel");
const vendorModel = require("../models/vendorModel");
const businessModel = require("../models/businessModel");
const invoiceModel = require("../models/invoiceModel");
const invoiceNoModel = require("../models/invoiceNoModel");
const customerAddressModel = require("../models/customerAddressModel");
const orderedProductModel = require("../models/orderedProductModel");
const { generatePdf } = require("../utils/generatePdf");
const { dateToLocalDateTime } = require("../utils/dateUtils");
const { financialYear } = require("../utils/getFinancialYear");

const generatePurchaseInvoice = async (data) => {
    try {
        let { vendor_id, order_id, gstAmount, totalAmount } = data;
        let vendor = await vendorModel.findById(vendor_id);
        let business = await businessModel.find();
        if (business.length === 0 || !business[0].defaultGST) {
            return { status: false, err: "Default gst not found" };
        }

        let invNo = await invoiceNoModel.findOne({ invoiceNoType: "PURCHASE" });
        let fY = financialYear();
        if (!invNo) {
            invNo = await invoiceNoModel.create({
                invoiceNo: 1,
                invoiceYear: fY,
                invoiceNoLength: 6,
                invoiceNoType: "PURCHASE",
            });
        }
        if (Number(fY) !== invNo.invoiceYear) {
            invNo.invoiceNo = 1;
            invNo.invoiceYear = fY;
        }
        let strInvNumber = "0000000000" + invNo.invoiceNo;
        let invNumber = `FPIN${invNo.invoiceYear}${strInvNumber.substring(strInvNumber.length - invNo.invoiceNoLength)}`;
        invNo.invoiceNo += 1;
        let generateDate = new Date();
        let invData = {
            invoiceNo: invNumber,
            invoiceDate: generateDate,
            vendor_id,
            order_id,
            gstAmount: gstAmount.toFixed(2),
            totalAmount: totalAmount.toFixed(2),
            invoiceType: "PURCHASE",
        };
        if (vendor.gstNo.substring(0, 2) === business[0].defaultGST.gstNo.substring(0, 2)) {
            invData.gstType = "CGST_SGST";
        } else {
            invData.gstType = "IGST";
        }

        invData.soldBy = {
            name: vendor.firmName,
            address: vendor.invoiceAddress,
            phone: vendor.mobileNo,
            gst: vendor.gstNo,
        };

        invData.shippingAddress = {
            name: business[0].business_name,
            address: business[0].defaultGST.pickupAddress,
            phone: business[0].contactNo,
            gst: business[0].defaultGST.gstNo,
        };
        invData.billingAddress = {
            name: business[0].business_name,
            address: business[0].defaultGST.pickupAddress,
            phone: business[0].contactNo,
            gst: business[0].defaultGST.gstNo,
        };
        let invRes = await invoiceModel.create(invData);
        await invNo.save();
        return { status: true, invoice: invRes };
    } catch (err) {
        return { status: false, err: err };
    }
};
const generateSaleInvoice = async (data) => {
    try {
        let { customer_id, order_id, gstAmount, totalAmount, address } = data;
        let customer = await customerModel.findById(customer_id);
        let business = await businessModel.find();
        if (business.length === 0 || !business[0].defaultGST) {
            return { status: false, err: "Default gst not found" };
        }

        let invNo = await invoiceNoModel.findOne({ invoiceNoType: "SALE" });
        let fY = financialYear();
        if (!invNo) {
            invNo = await invoiceNoModel.create({
                invoiceNo: 1,
                invoiceYear: fY,
                invoiceNoLength: 6,
                invoiceNoType: "SALE",
            });
        }
        if (Number(fY) !== invNo.invoiceYear) {
            invNo.invoiceNo = 1;
            invNo.invoiceYear = fY;
        }
        let strInvNumber = "0000000000" + invNo.invoiceNo;
        let invNumber = `FSIN${invNo.invoiceYear}${strInvNumber.substring(strInvNumber.length - invNo.invoiceNoLength)}`;
        invNo.invoiceNo += 1;
        let generateDate = new Date();
        let invData = {
            invoiceNo: invNumber,
            invoiceDate: generateDate,
            customer_id,
            order_id,
            gstAmount: gstAmount.toFixed(2),
            totalAmount: totalAmount.toFixed(2),
            invoiceType: "SALE",
        };

        if (customer.defaultAddress.stateCode === business[0].defaultGST.gstNo.substring(0, 2)) {
            invData.gstType = "CGST_SGST";
        } else {
            invData.gstType = "IGST";
        }
        invData.soldBy = {
            name: business[0].business_name,
            address: business[0].defaultGST.pickupAddress,
            phone: business[0].contactNo,
            gst: business[0].defaultGST.gstNo,
        };
        invData.shippingAddress = {
            name: customer.name,
            address: address.address,
            phone: customer.phone,
            gst: customer.gstNo,
        };
        invData.billingAddress = {
            name: customer.name,
            address: address.address,
            phone: customer.phone,
            gst: customer.gstNo,
        };
        let invRes = await invoiceModel.create(invData);

        await invNo.save();
        return { status: true, invoice: invRes };
    } catch (err) {
        return { status: false, err: err };
    }
};

const getAllSaleInvoice = async (req, res) => {
    try {
        let userType = req.userModel;
        let invoices = null;
        if (userType === "ADMIN") {
            invoices = await invoiceModel.find({ invoiceType: "SALE" });
        } else {
            invoices = await invoiceModel.find({ invoiceType: "PURCHASE" });
        }
        return res.status(200).send({ status: true, message: "Invoice fetched successfully...", data: invoices });
    } catch (error) {
        return res.status(500).send({ status: false, message: error.message });
    }
};
const getAllPurchaseInvoice = async (req, res) => {
    try {
        let invoices = [];
        if (req.userModel === "ADMIN") {
            invoices = await invoiceModel.find({ invoiceType: "PURCHASE" });
        }
        if (req.userModel === "VENDOR") {
            invoices = await invoiceModel.find({ invoiceType: "PURCHASE", vendor_id: req.userId });
        }
        return res.status(200).send({ status: true, message: "Invoice fetched successfully...", data: invoices });
    } catch (error) {
        return res.status(500).send({ status: false, message: error.message });
    }
};

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

const downoadInvoiceByInvoiceNumber = async (req, res) => {
    try {
        let invoiceNumber = req.params.invoicenumber;
        let invoicetype = req.params.invoicetype;

        let invoice = await invoiceModel.findOne({ invoiceNo: invoiceNumber }).populate("order_id");
        if (!invoice) {
            return res.status(400).send({ status: false, message: "Bad request" });
        }
        if (invoicetype === "PURCHASE" && !invoice.vendor_id) {
            return res.status(400).send({ status: false, message: "Bad request" });
        }
        let orderedProduct = await orderedProductModel.findOne({ order_id: invoice.order_id }).populate({ path: "products.product_id", model: "Product" });
        if (!orderedProduct) {
            return res.status(400).send({ status: false, message: "Bad request" });
        }
        let business = await businessModel.find();
        if (business.length === 0) {
            return res.status(400).send({ status: false, message: "Bad request" });
        }
        if (invoicetype === "PURCHASE") {
            let invData = {
                logo: business[0].invoiceLogo,
                brandName: business[0].business_name,
                soldBy: invoice.soldBy.name,
                soldByAddress: invoice.soldBy.address,
                soldByPhone: invoice.soldBy.phone,
                soldByGst: invoice.soldBy.gst,
                invoiceNo: invoiceNumber,
                orderId: invoice.order_id.orderId,
                orderDate: dateToLocalDateTime(invoice.order_id.order_date),
                invoiceDate: dateToLocalDateTime(invoice.invoiceDate),
                billToName: invoice.billingAddress.name,
                billToAddress: invoice.billingAddress.address,
                billToPhone: invoice.billingAddress.phone,
                billToGST: invoice.billingAddress.gst,
                shipToName: invoice.shippingAddress.name,
                shipToAddress: invoice.shippingAddress.address,
                shipToPhone: invoice.shippingAddress.phone,
                shipToGST: invoice.shippingAddress.gst,
                tableRow: [],
                totalAmt: "₹" + invoice.totalAmount,
                totalCGSTAmt: "",
                totalSGSTAmt: "",
                totalIGSTAmt: "",
                taxableAmt: invoice.totalAmount,
                totalTaxAmt: invoice.gstAmount,
                grossTotalAmt: (Number(invoice.gstAmount) + Number(invoice.totalAmount)).toFixed(2),
                discountAmt: "0",
                netPayableAmount: (Number(invoice.gstAmount) + Number(invoice.totalAmount)).toFixed(2),
            };
            if (invoice.soldBy.gst.substring(0, 2) === invoice.billingAddress.gst.substring(0, 2)) {
                invData.totalCGSTAmt = "₹" + (Number(invoice.gstAmount) / 2).toFixed(2);
                invData.totalSGSTAmt = "₹" + (Number(invoice.gstAmount) / 2).toFixed(2);
                let count = 1;
                for (let product of orderedProduct.products) {
                    if (!product.isRemoved) {
                        let trData = {
                            sno: count,
                            productName: "",
                            color: "",
                            sizeSet: "",
                            hsnCode: "",
                            qty: "",
                            rate: "",
                            total: "",
                            cgstPercentage: "",
                            cgstAmount: "",
                            sgstPercentage: "",
                            sgstAmount: "",
                            igstPercentage: "",
                            igstAmount: "",
                        };
                        count += 1;
                        trData.productName = product.product_id.product_name;
                        trData.color = product.color.colorName;
                        trData.sizeSet = product.lotSize;
                        trData.hsnCode = product.hsnCode;
                        trData.qty = product.qty;
                        trData.rate = product.seller_price;
                        trData.total = (Number(product.seller_price) * Number(product.qty)).toFixed(2);
                        trData.cgstPercentage = Number(product.seller_gst) / 2;
                        trData.cgstAmount = ((Number(product.seller_price) * Number(product.qty) * Number(product.seller_gst)) / 100).toFixed(2);
                        trData.sgstPercentage = Number(product.seller_gst) / 2;
                        trData.sgstAmount = ((Number(product.seller_price) * Number(product.qty) * Number(product.seller_gst)) / 100).toFixed(2);
                        trData.igstPercentage = "";
                        trData.igstAmount = "";
                        invData.tableRow.push(trData);
                    }
                }
            } else {
                invData.totalIGSTAmt = invoice.gstAmount;
                let count = 1;
                for (let product of orderedProduct.products) {
                    if (!product.isRemoved) {
                        let trData = {
                            sno: count,
                            productName: "",
                            color: "",
                            sizeSet: "",
                            hsnCode: "",
                            qty: "",
                            rate: "",
                            total: "",
                            cgstPercentage: "",
                            cgstAmount: "",
                            sgstPercentage: "",
                            sgstAmount: "",
                            igstPercentage: "",
                            igstAmount: "",
                        };
                        count += 1;
                        trData.productName = product.product_id.product_name;
                        trData.color = product.color.colorName;
                        trData.sizeSet = product.lotSize;
                        trData.hsnCode = product.hsnCode;
                        trData.qty = product.qty;
                        trData.rate = product.seller_price;
                        trData.total = (Number(product.seller_price) * Number(product.qty)).toFixed(2);
                        trData.cgstPercentage = "";
                        trData.cgstAmount = "";
                        trData.sgstPercentage = "";
                        trData.sgstAmount = "";
                        trData.igstPercentage = product.seller_gst;
                        trData.igstAmount = "₹" + ((Number(product.seller_price) * Number(product.qty) * Number(product.seller_gst)) / 100).toFixed(2);
                        invData.tableRow.push(trData);
                    }
                }
            }
            let pdf = await generatePdf(invData, "factorEz.com");
            res.setHeader("Content-Type", "application/pdf");
            res.setHeader("Content-Disposition", "attachment; invoice.pdf");
            return res.send(pdf);
        } else {
            let customerAddress = await customerAddressModel.findOne({ customerId: invoice.customer_id });
            let invData = {
                logo: business[0].invoiceLogo,
                brandName: business[0].business_name,
                soldBy: invoice.soldBy.name,
                soldByAddress: invoice.soldBy.address,
                soldByGst: invoice.soldBy.gst,
                soldByPhone: invoice.soldBy.phone,
                invoiceNo: invoiceNumber,
                orderId: invoice.order_id.orderId,
                orderDate: dateToLocalDateTime(invoice.order_id.order_date),
                invoiceDate: dateToLocalDateTime(invoice.invoiceDate),
                billToName: invoice.billingAddress.name,
                billToAddress: invoice.billingAddress.address,
                billToPhone: invoice.billingAddress.phone,
                billToGST: invoice.billingAddress.gst,
                shipToName: invoice.shippingAddress.name,
                shipToAddress: invoice.shippingAddress.address,
                shipToPhone: invoice.shippingAddress.phone,
                shipToGST: invoice.shippingAddress.gst,
                totalAmt: "₹" + invoice.totalAmount,
                tableRow: [],
                totalCGSTAmt: "",
                totalSGSTAmt: "",
                totalIGSTAmt: "",
                taxableAmt: invoice.totalAmount,
                totalTaxAmt: invoice.gstAmount,
                grossTotalAmt: (Number(invoice.gstAmount) + Number(invoice.totalAmount)).toFixed(2),
                discountAmt: "",
                netPayableAmount: "",
            };
            if (invoice.billingAddress.gst) {
                if (invoice.soldBy.gst.substring(0, 2) === invoice.billingAddress.gst.substring(0, 2)) {
                    invData.totalCGSTAmt = "₹" + (Number(invoice.gstAmount) / 2).toFixed(2);
                    invData.totalSGSTAmt = "₹" + (Number(invoice.gstAmount) / 2).toFixed(2);
                    let count = 1;
                    for (let product of orderedProduct.products) {
                        if (!product.isRemoved) {
                            let trData = {
                                sno: count,
                                productName: "",
                                color: "",
                                sizeSet: "",
                                hsnCode: "",
                                qty: "",
                                rate: "",
                                total: "",
                                cgstPercentage: "",
                                cgstAmount: "",
                                sgstPercentage: "",
                                sgstAmount: "",
                                igstPercentage: "",
                                igstAmount: "",
                            };
                            count += 1;
                            trData.productName = product.product_id.product_name;
                            trData.color = product.color.colorName;
                            trData.sizeSet = product.lotSize;
                            trData.hsnCode = product.hsnCode;
                            trData.qty = product.qty;
                            trData.rate = product.seller_price;
                            trData.total = (Number(product.seller_price) * Number(product.qty)).toFixed(2);
                            trData.cgstPercentage = Number(product.seller_gst) / 2;
                            trData.cgstAmount = ((Number(product.seller_price) * Number(product.qty) * Number(product.seller_gst)) / 100).toFixed(2);
                            trData.sgstPercentage = Number(product.seller_gst) / 2;
                            trData.sgstAmount = ((Number(product.seller_price) * Number(product.qty) * Number(product.seller_gst)) / 100).toFixed(2);
                            trData.igstPercentage = "";
                            trData.igstAmount = "";
                            invData.tableRow.push(trData);
                        }
                    }
                } else {
                    invData.totalIGSTAmt = invoice.gstAmount;
                    let count = 1;
                    for (let product of orderedProduct.products) {
                        if (!product.isRemoved) {
                            let trData = {
                                sno: count,
                                productName: "",
                                color: "",
                                sizeSet: "",
                                hsnCode: "",
                                qty: "",
                                rate: "",
                                total: "",
                                cgstPercentage: "",
                                cgstAmount: "",
                                sgstPercentage: "",
                                sgstAmount: "",
                                igstPercentage: "",
                                igstAmount: "",
                            };
                            count += 1;
                            trData.productName = product.product_id.product_name;
                            trData.color = product.color.colorName;
                            trData.sizeSet = product.lotSize;
                            trData.hsnCode = product.hsnCode;
                            trData.qty = product.qty;
                            trData.rate = product.seller_price;
                            trData.total = (Number(product.seller_price) * Number(product.qty)).toFixed(2);
                            trData.cgstPercentage = "";
                            trData.cgstAmount = "";
                            trData.sgstPercentage = "";
                            trData.sgstAmount = "";
                            trData.igstPercentage = product.seller_gst;
                            trData.igstAmount = "₹" + ((Number(product.seller_price) * Number(product.qty) * Number(product.seller_gst)) / 100).toFixed(2);
                            invData.tableRow.push(trData);
                        }
                    }
                }
            } else {
                if (invoice.soldBy.gst.substring(0, 2) === customerAddress.stateCode) {
                    invData.totalCGSTAmt = "₹" + (Number(invoice.gstAmount) / 2).toFixed(2);
                    invData.totalSGSTAmt = "₹" + (Number(invoice.gstAmount) / 2).toFixed(2);
                    let count = 1;
                    for (let product of orderedProduct.products) {
                        if (!product.isRemoved) {
                            let trData = {
                                sno: count,
                                productName: "",
                                color: "",
                                sizeSet: "",
                                hsnCode: "",
                                qty: "",
                                rate: "",
                                total: "",
                                cgstPercentage: "",
                                cgstAmount: "",
                                sgstPercentage: "",
                                sgstAmount: "",
                                igstPercentage: "",
                                igstAmount: "",
                            };
                            count += 1;
                            trData.productName = product.product_id.product_name;
                            trData.color = product.color.colorName;
                            trData.sizeSet = product.lotSize;
                            trData.hsnCode = product.hsnCode;
                            trData.qty = product.qty;
                            trData.rate = Number(product.seller_price) + (Number(product.seller_price) * Number(product.margin)) / 100;
                            trData.total = (Number(trData.rate) * Number(product.qty)).toFixed(2);
                            trData.cgstPercentage = Number(product.selling_gst) / 2;
                            let mrginAmt = Number(product.seller_price) * Number(product.qty) + (Number(product.seller_price) * Number(product.qty) * Number(product.margin)) / 100;
                            trData.cgstAmount = ((mrginAmt * Number(product.selling_gst)) / 100).toFixed(2);
                            trData.sgstPercentage = Number(product.selling_gst) / 2;
                            trData.sgstAmount = ((mrginAmt * Number(product.selling_gst)) / 100).toFixed(2);
                            trData.igstPercentage = "";
                            trData.igstAmount = "";
                            invData.tableRow.push(trData);
                        }
                    }
                } else {
                    invData.totalIGSTAmt = invoice.gstAmount;
                    let count = 1;
                    for (let product of orderedProduct.products) {
                        if (!product.isRemoved) {
                            let trData = {
                                sno: count,
                                productName: "",
                                color: "",
                                sizeSet: "",
                                hsnCode: "",
                                qty: "",
                                rate: "",
                                total: "",
                                cgstPercentage: "",
                                cgstAmount: "",
                                sgstPercentage: "",
                                sgstAmount: "",
                                igstPercentage: "",
                                igstAmount: "",
                            };
                            count += 1;
                            trData.productName = product.product_id.product_name;
                            trData.color = product.color.colorName;
                            trData.sizeSet = product.lotSize;
                            trData.hsnCode = product.hsnCode;
                            trData.qty = product.qty;
                            trData.rate = product.seller_price;
                            trData.total = (Number(product.seller_price) * Number(product.qty)).toFixed(2);
                            trData.cgstPercentage = "";
                            trData.cgstAmount = "";
                            trData.sgstPercentage = "";
                            trData.sgstAmount = "";
                            trData.igstPercentage = product.seller_gst;
                            trData.igstAmount = "₹" + ((Number(product.seller_price) * Number(product.qty) * Number(product.seller_gst)) / 100).toFixed(2);
                            invData.tableRow.push(trData);
                        }
                    }
                }
            }
            if (invoice.order_id.discounted_amount) {
                invData.discountAmt = "₹" + invoice.order_id.discounted_amount;
                invData.netPayableAmount = Number(invoice.gstAmount) + Number(invoice.totalAmount) - Number(invoice.order_id.discounted_amount);
            } else {
                invData.discountAmt = 0;
                invData.netPayableAmount = invData.grossTotalAmt;
            }
            let pdf = await generatePdf(invData, "factorEz.com");

            res.setHeader("Content-Type", "application/pdf");
            res.setHeader("Content-Disposition", "attachment; invoice.pdf");
            return res.send(pdf);
        }
    } catch (error) {
        return res.status(500).send({ status: false, message: error.message });
    }
};

module.exports = { generatePurchaseInvoice, generateSaleInvoice, getAllSaleInvoice, getAllPurchaseInvoice, downoadInvoiceByInvoiceNumber };
