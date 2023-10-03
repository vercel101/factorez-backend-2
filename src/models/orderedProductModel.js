const mongoose = require("mongoose");
const ObjectId = mongoose.Schema.Types.ObjectId;

const orderedProductSchema = new mongoose.Schema(
    {
        products: [
            {
                product_id: {
                    type: ObjectId,
                    ref: "Product",
                    required: true,
                },
                vendor_id: {
                    type: ObjectId,
                    ref: "Vendor",
                    required: true,
                },
                mrp: {
                    type: Number,
                    required: true,
                },
                seller_price: {
                    type: Number,
                    required: true,
                },
                seller_gst: {
                    type: Number,
                    required: true,
                },
                selling_price: {
                    type: Number,
                    required: true,
                },
                selling_gst: {
                    type: Number,
                    required: true,
                },
                margin: {
                    type: Number,
                    required: true,
                },
                lotSize: {
                    type: String,
                },
                color: {
                    colorName: { type: String },
                    colorHex: { type: String },
                },
                hsnCode: {
                    type: String,
                },
                skuCode: {
                    type: String,
                },
                qty: {
                    type: Number,
                    required: true,
                },
                addedAt: {
                    type: String,
                },
                isRemoved: {
                    type: Boolean,
                    default: false,
                },
            },
        ],
        order_id: {
            type: ObjectId,
            ref: "Order",
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Ordered_Product", orderedProductSchema);
