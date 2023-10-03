const mongoose = require("mongoose");
const ObjectId = mongoose.Schema.Types.ObjectId;

const customerAddressSchema = new mongoose.Schema(
    {
        customerId: {
            type: ObjectId,
            ref: "Customer",
        },

        address: {
            type: String,
            required: true,
        },

        state: {
            type: String,
            required: true,
        },
        city: {
            type: String,
            required: true,
        },
        pincode: {
            type: String,
            required: true,
        },
        stateCode: {
            type: String,
            required: true,
        },

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

module.exports = mongoose.model("CustomerAddress", customerAddressSchema);
