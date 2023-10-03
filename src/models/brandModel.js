const mongoose = require("mongoose");
const ObjectId = mongoose.Schema.Types.ObjectId;

const brandSchema = new mongoose.Schema(
    {
        brand_name: {
            type: String,
            required: true,
        },
        brandLogo: {
            type: String,
        },
        vendor_id: {
            type:ObjectId,
            ref:"Vendor"
        },
        brandStatus:{
            type: String,
            enum: ["Approved", "Rejected", "Pending"],
            default:"Pending",
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
    {timestamps: true}
);

module.exports = mongoose.model("Brand", brandSchema);
