const mongoose = require("mongoose");
const ObjectId = mongoose.Schema.Types.ObjectId;

const bankSchema = new mongoose.Schema(
    {
        acHolderName: {
            type: String,
            trim: true,
        },

        acNo: {
            type: String,
            trim: true,
        },

        bankName: {
            type: String,
            trim: true,
        },

        branch: {
            type: String,
            trim: true,
        },

        ifsc: {
            type: String,
            trim: true,
        },
        cancelledCheque: {
            type: String,
        },
        actionTakenBy: {
            type: ObjectId,
            ref: "Admin",
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Bank", bankSchema);
