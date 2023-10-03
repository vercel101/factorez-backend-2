const mongoose = require("mongoose");
const ObjectId = mongoose.Schema.Types.ObjectId;

const orderSchema = new mongoose.Schema(
    {
        orderId: {
            type: String,
        },

        vendorId: {
            type: ObjectId,
            ref: "Vendor",
        },
        vendorAmtInfo: {
            grandTotal: { type: Number },
            gstAmt: { type: Number },
            total: { type: Number },
        },

        transaction_id: {
            type: String,
        },

        shipping_charges: {
            type: Number,
        },

        grand_total: {
            type: Number,
            default: 0,
        },

        total: {
            type: Number,
            default: 0,
        },

        total_pairs: {
            type: Number,
        },

        GST_amount: {
            type: Number,
        },
        discounted_amount: {
            type: Number,
            default: 0,
        },
        order_date: {
            type: Date,
        },

        tracking_id: {
            type: String,
        },

        transport_bilty: {
            type: String,
        },

        ordered_products: {
            type: ObjectId,
            ref: "Ordered_Product",
        },

        order_status_id: {
            type: ObjectId,
            ref: "Order_Status_Table",
        },

        payment_id: {
            type: ObjectId,
            ref: "Payment",
        },

        customer_id: {
            type: ObjectId,
            ref: "Customer",
        },

        shipping_address: {
            stateCode: { type: String },
            state: { type: String },
            address: { type: String },
        },
        couponCode: {
            type: ObjectId,
            ref: "CouponCode",
        },
        saleInvoice: {
            type: ObjectId,
            ref: "Invoice",
        },
        purchaseInvoice: {
            type: ObjectId,
            ref: "Invoice",
        },
        paymentReportStatus: {
            paymentStatus: {
                type: String,
                enum: ["PENDING", "DUE", "PARTIAL_PAID", "FULL_PAID", "SETTLED_PAID"],
                default: "PENDING",
            },
            paidAmount: {
                type: Number,
            },
            paymentDate: {
                type: Date,
            },
            transactionId: {
                type: String,
            },
            settlementAmt: {
                type: Number,
            },
            message: {
                type: String,
            },
            logs: [],
        },
        partialCancelOrderInfo: {
            orderedAmtInfo: {
                grand_total: {
                    type: Number,
                },

                total: {
                    type: Number,
                },

                GST_amount: {
                    type: Number,
                },
            },
            orderedProductAmtInfo: {
                productQty: {
                    type: Number,
                },
                grand_total: {
                    type: Number,
                },
                total: {
                    type: Number,
                },
                GST_amount: {
                    type: Number,
                },
            },
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);
