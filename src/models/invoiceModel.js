const mongoose = require("mongoose");
const ObjectId = mongoose.Schema.Types.ObjectId;

const invoiceSchema = new mongoose.Schema(
    {
        invoiceNo: {
            type: String,
            required: true,
        },
        invoiceDate: {
            type: Date,
            required: true,
        },
        invoiceType: {
            type: String,
            enum: ["PURCHASE", "SALE"],
            required: true,
        },
        customer_id: {
            type: ObjectId,
            ref: "Customer",
        },
        vendor_id: {
            type: ObjectId,
            ref: "Vendor",
        },
        order_id: {
            type: ObjectId,
            ref: "Order",
        },
        gstAmount: {
            type: Number,
            required: true,
        },
        gstType: {
            type: String,
            enum: ["CGST_SGST", "IGST"],
            required: true,
        },
        totalAmount: {
            type: Number,
            required: true,
        },
        invoiceStatus: {
            type: String,
            enum: ["PAID", "UNPAID", "OVERDUE"],
            default: "UNPAID",
        },
        soldBy: {
            name: { type: String },
            address: { type: String },
            phone: { type: String },
            gst: { type: String },
        },
        shippingAddress: {
            name: {
                type: String,
            },
            address: {
                type: String,
                required: true,
            },
            phone: {
                type: String,
            },
            gst: {
                type: String,
            },
        },
        billingAddress: {
            name: {
                type: String,
            },
            address: {
                type: String,
                required: true,
            },
            phone: {
                type: String,
            },
            gst: {
                type: String,
            },
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Invoice", invoiceSchema);
