const mongoose = require("mongoose");
const ObjectId = mongoose.Schema.Types.ObjectId;

const paymentSchema = new mongoose.Schema(
    {
        paymentId: {
            type: String,
            required: true,
        },
        order_id: {
            orderId: {
                type: ObjectId,
                ref: "Order",
            },
            order_custom_id: {
                type: String,
            },
        },
        customer_id: {
            type: ObjectId,
            ref: "Customer",
        },
        order_status: {
            type: String,
            enum: [
                "PENDING",
                "CONFIRMED",
                "PARTIAL_CONFIRMED",
                "READY_TO_DISPATCH",
                "PICKUP_ALIGNED",
                "PICKUP_DONE",
                "RETURNED",
                "RETURNED_RTO",
                "RETURNED_RTO_DELIVERED",
                "DELIVERED",
                "CANCELLED",
                "OUT_FOR_DELIVERY",
            ],
            default: "PENDING",
        },
        payment_status: {
            type: String,
            enum: ["PENDING", "PARTIAL_PAID", "RECEIVED", "FAILED", "PARTIAL_REFUNDED", "REFUNDED"],
        },

        payment_mode: {
            type: String,
            enum: ["COD", "CUSTOM", "TWENTY_ADV", "PREPAID"],
        },

        transactionId: {
            type: String,
        },

        payment_amount: {
            type: Number,
            default: 0,
        },
        return_amount: {
            type: Number,
            default: 0,
        },
        cod_received: {
            type: Number,
            default: 0,
        },
        payment_date: {
            type: Date, // when final payment will received, we'll put payment date
        },
        partial_payment: {
            payment_amount: {
                type: Number,
            },
            date: {
                type: Date,
            },
            transactionId: {
                type: String,
            },
        },
        order_amount: {
            type: Number,
            default: 0,
        },
        discount_amt: {
            type: Number,
            default: 0,
        },
        balance_amount: {
            type: Number,
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Payment", paymentSchema);
