const mongoose = require("mongoose");
const ObjectId = mongoose.Schema.Types.ObjectId;

const orderStatusTableSchema = new mongoose.Schema(
    {
        order_id: {
            type: ObjectId,
            ref: "Order",
            required: true,
        },

        status: {
            type: String,
            enum: ["PENDING", "CONFIRMED", "PARTIAL_CONFIRMED", "READY_TO_DISPATCH", "PICKUP_ALIGNED", "PICKUP_DONE", "RETURNED","RETURNED_RTO","RETURNED_RTO_DELIVERED", "DELIVERED", "CANCELLED", "OUT_FOR_DELIVERY"],
            default: "PENDING",
        },

        isCompleted: {
            type: Boolean,
            default: false,
        },

        statusList: [
            {
                status: {
                    type: String,
                    enum: ["CONFIRMED", "PARTIAL_CONFIRMED", "READY_TO_DISPATCH", "PICKUP_ALIGNED", "PICKUP_DONE", "RETURNED","RETURNED_RTO","RETURNED_RTO_DELIVERED", "DELIVERED", "OUT_FOR_DELIVERY"],
                },
                updatedBy: {
                    vendor: { type: ObjectId, ref: "Vendor" },
                    admin: { type: ObjectId, ref: "Admin" },
                },
                updatedAt: {
                    type: Date,
                },
                description: {
                    type: String,
                },
            },
        ],
        cancelled: {
            cancelledBy: {
                type: String,
                enum: ["Super_Admin", "Vendor", "Customer"],
            },

            userId: {
                vendor: { type: ObjectId, ref: "Vendor" },
                admin: { type: ObjectId, ref: "Admin" },
                customer: { type: ObjectId, ref: "Customer" },
            },

            question: {
                type: ObjectId,
                ref: "Question",
            },
            description: {
                type: String,
            },
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Order_Status_Table", orderStatusTableSchema);
