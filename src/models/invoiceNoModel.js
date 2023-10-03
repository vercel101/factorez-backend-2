const mongoose = require("mongoose");
const ObjectId = mongoose.Schema.Types.ObjectId;

const invoiceNoSchema = new mongoose.Schema(
    {
        invoiceNo: {
            type: Number,
            default: 0,
            required: true,
        },
        invoiceYear: {
            type: Number,
            default: 23,
            required: true,
        },
        invoiceNoLength: {
            type: Number,
            default: 9,
            required: true,
        },
        invoiceNoType:{
            type: String,
            enum: ["PURCHASE", "SALE"],
            required: true,
        }
    },
    { timestamps: true }
);

module.exports = mongoose.model("InvoiceNo", invoiceNoSchema);
