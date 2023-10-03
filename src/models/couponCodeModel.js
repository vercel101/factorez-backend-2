const mongoose = require("mongoose");
const ObjectId = mongoose.Schema.Types.ObjectId;

const couponCodeSchema = new mongoose.Schema(
    {
        customer_id: [
            {
                type: ObjectId,
                ref: "Customer",
            },
        ],
        couponCode: {
            type: String,
            required: true,
        },
        validTill: {
            type: Date,
            required: true,
        },
        maxUsers: {
            type: Number,
            required: true,
        },
        minOrderAmt: {
            type: Number,
            required: true,
        },
        isUsed: {
            type: Boolean,
            default: false,
        },
        isExpired: {
            type: Boolean,
            default: false,
        },
        isDeleted: {
            type: Boolean,
            default: false,
        },
        generatedBy: {
            type: ObjectId,
            ref: "Admin",
        },
        maxDiscPrice: {
            type: Number,
            required: true,
        },
        discountType: {
            type: String,
            enum: ["PRICE", "PERCENTAGE"],
            required: true,
        },
        discountAmt: {
            type: Number,
            required: true,
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("CouponCode", couponCodeSchema);
