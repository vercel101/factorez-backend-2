const excelJs = require("exceljs");
const orderModel = require("../models/orderModel");

const getOrderReport = async (req, res) => {
    try {
        //{ saleInvoice: { $exists: true } }
        let orders = await orderModel.find({ saleInvoice: { $exists: true } }).populate(["payment_id", "order_status_id"]);
        return res.status(200).send({ status: true, message: "Order Report fetched...", data: orders });
    } catch (error) {
        return res.status(500).send({ status: false, message: error.message });
    }
};

const exportSaleReport = async (req, res) => {
    try {
        let { startDate, endDate } = req.body;
        if (!startDate || !endDate) {
            return res.status(400).send({ status: false, message: "Start date end end date are required" });
        }
        let date1 = new Date(startDate).getTime();
        let date2 = new Date(endDate).getTime();
        if (date1 > date2) {
            return res.status(400).send({ status: false, message: "Wrong date range" });
        }
        var workbook = new excelJs.Workbook();
        var worksheet = workbook.addWorksheet("Add Bulk Product");

        let columnData = [
            { header: "Order ID", key: "order_id" },
            { header: "Order Date and Time", key: "order_date" },
            { header: "Invoice No", key: "invoice_no" },
            { header: "Invoice Date", key: "invoice_date" },
            { header: "Order value", key: "order_value" },
            { header: "Order Qty", key: "order_qty" },
            { header: "Invoice value/confirmed value", key: "invoice_value" },
            { header: "Advance", key: "advance" },
            { header: "Discount", key: "discount" },
            { header: "Net Amount", key: "net_amount" },
            { header: "Refund", key: "refund" },
            { header: "Cash on delivery", key: "cash_on_delivery" },
        ];
        var data = {
            order_id: "FZ12345678",
            order_date: "07-08-2023 at 18:37:00",
            invoice_no: "FSIN2312345678",
            invoice_date: "07-08-2023 at 18:37:00",
            order_qty: "4",
            invoice_value: "10000",
            advance: "2000",
            discount: "1200",
            net_amount: "6800",
            refund: "00",
            cash_on_delivery: "6800",
        };
        if (req.userModel === "ADMIN") {
            columnData.unshift({ header: "Buyer name", key: "buyer_name" }, { header: "Buyer No.", key: "buyer_no" });

            data.buyer_name = "SANJEET KUMAR";
            data.buyer_no = 1234567891;
        }
        worksheet.columns = columnData;
        worksheet.addRow(data);
        worksheet.getRow(1).eachCell((cell) => {
            cell.font = { bold: true };
            cell.fill = {
                type: "pattern",
                pattern: "solid",
                fgColor: { argb: "F08080" },
            };
        });

        res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
        res.setHeader("Content-Disposition", `attachment; brandid.xlsx`);

        return workbook.xlsx.write(res).then(() => {
            res.status(200);
        });
        // return res.status(200).send({ status: true, message: "Report exported" });
    } catch (error) {
        return res.status(500).send({ status: false, message: error.message });
    }
};

const exportPurchaseReport = async (req, res) => {
    try {
        let { startDate, endDate } = req.body;
        if (!startDate || !endDate) {
            return res.status(400).send({ status: false, message: "Start date end end date are required" });
        }
        let date1 = new Date(startDate).getTime();
        let date2 = new Date(endDate).getTime();
        if (date1 > date2) {
            return res.status(400).send({ status: false, message: "Wrong date range" });
        }
        var workbook = new excelJs.Workbook();
        var worksheet = workbook.addWorksheet("Add Bulk Product");
        let columnData = [
            { header: "Order ID", key: "order_id" },
            { header: "Order Date and Time", key: "order_date" },
            { header: "Invoice No", key: "invoice_no" },
            { header: "Invoice Date", key: "invoice_date" },
            { header: "Seller name", key: "seller_name" },
            { header: "Seller Phone No.", key: "seller_phone" },
            { header: "Seller GST", key: "seller_gst" },
            { header: "FactorEz GST	", key: "factorez_gst" },
            { header: "Purchase ", key: "purchase" },
            { header: "Invoice value/confirmed value", key: "invoice_value" },
            { header: "GST Percentage", key: "gst_percentage" },
            { header: "Taxable value", key: "taxable_value" },
            { header: "Gst amount", key: "gst_amount" },
            { header: "Quantity", key: "quantity" },
            { header: "Order status", key: "order_status" },
        ];
        var data = {
            order_id: "FZ12345678",
            order_date: "07-08-2023 at 18:37:00",
            invoice_no: "FSIN2312345678",
            invoice_date: "07-08-2023 at 18:37:00",
            seller_name: "Navnit Sekh",
            seller_phone: "1234567891",
            seller_gst: "09ABCDE4455R23",
            factorez_gst: "09ABCDE4455R23",
            purchase: "4000",
            invoice_value: "5000",
            gst_percentage: "18",
            taxable_value: "5000",
            gst_amount: "1000",
            quantity: "3",
            order_status: "pending",
        };
        // if (req.userModel === "ADMIN") {
        //     columnData.unshift({ header: "Buyer name", key: "buyer_name" }, { header: "Buyer No.", key: "buyer_no" });

        //     data.buyer_name = "SANJEET KUMAR";
        //     data.buyer_no = 1234567891;
        // }
        worksheet.columns = columnData;
        worksheet.addRow(data);
        worksheet.getRow(1).eachCell((cell) => {
            cell.font = { bold: true };
            cell.fill = {
                type: "pattern",
                pattern: "solid",
                fgColor: { argb: "F08080" },
            };
        });

        res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
        res.setHeader("Content-Disposition", `attachment; brandid.xlsx`);

        return workbook.xlsx.write(res).then(() => {
            res.status(200);
        });
        // return res.status(200).send({ status: true, message: "Report exported" });
    } catch (error) {
        return res.status(500).send({ status: false, message: error.message });
    }
};

const getPaymentReport = async (req, res) => {
    try {
        let orders = await orderModel.find({ saleInvoice: { $exists: true } }).populate(["vendorId", "payment_id", "order_status_id"]);
        return res.status(200).send({ status: true, message: "Payment report fetched", data: orders });
    } catch (error) {
        return res.status(500).send({ status: false, message: error.message });
    }
};

const updatePaymentReport = async (req, res) => {
    try {
        let orderId = req.params.orderid;
        let { paymentStatus, paidAmount, paymentDate, transactionId, settlementAmt, message } = req.body;
        let data = req.body;
        let order = await orderModel.findById(orderId);
        if (!order) {
            return res.status(400).send({ status: false, message: "Order id not found" });
        }
        if (paymentStatus) order.paymentReportStatus.paymentStatus = paymentStatus;
        if (paidAmount) order.paymentReportStatus.paidAmount = paidAmount;
        if (paymentDate) order.paymentReportStatus.paymentDate = paymentDate;
        if (transactionId) order.paymentReportStatus.transactionId = transactionId;
        if (settlementAmt) order.paymentReportStatus.settlementAmt = settlementAmt;
        if (message) order.paymentReportStatus.message = message;
        data.updateAt = new Date();
        order.paymentReportStatus.logs.push(data);
        await order.save();
        let orders = await orderModel.find({ saleInvoice: { $exists: true } }).populate(["vendorId", "payment_id", "order_status_id"]);
        return res.status(200).send({ status: true, message: "Payment Report Updated", data: orders });
    } catch (error) {
        return res.status(500).send({ status: false, message: error.message });
    }
};

module.exports = { getOrderReport, exportSaleReport, exportPurchaseReport, getPaymentReport, updatePaymentReport };
