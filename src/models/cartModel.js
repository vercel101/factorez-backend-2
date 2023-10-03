const mongoose = require("mongoose");
const ObjectId = mongoose.Schema.Types.ObjectId;

const cartSchema = new mongoose.Schema(
    {
        products: [
            {
                product_id: {
                    type: ObjectId,
                    ref: "Product",
                },
                qty: {
                    type: Number,
                },
                lotSize: {
                    type: String,
                },
                color: {
                    colorName: { type: String },
                    colorHex: { type: String },
                },
                addedAt: {
                    type: String,
                },
            },
        ],
        customer_id: {
            type: ObjectId,
            ref: "Customer",
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Cart", cartSchema);
