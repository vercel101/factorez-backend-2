const mongoose = require("mongoose");
const ObjectId = mongoose.Schema.Types.ObjectId;

const customerSchema = new mongoose.Schema(
    {
        name: {
            type: String,
        },
        defaultAddress: {
            type: ObjectId,
            ref: "CustomerAddress",
        },
        gstNo: {
            type: String,
        },
        phone: {
            type: String,
            required: true,
        },
        alternate_phone: {
            type: String,
        },
        email: {
            type: String,
        },
        profileUrl: {
            type: String,
            trim: true,
        },
        password: {
            type: String,
        },

        isActivated: {
            type: Boolean,
            default: false,
        },
        isBlocked: {
            type: Boolean,
            default: false,
        },
        cart_id: {
            type: ObjectId,
            ref: "Cart",
        },
        orders: [
            {
                type: ObjectId,
                ref: "Order",
            },
        ],
        isDeleted: {
            type: Boolean,
            default: false,
        },
        deletedAt: {
            type: Date,
            default: null,
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Customer", customerSchema);
