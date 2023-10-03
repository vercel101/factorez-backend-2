const mongoose = require("mongoose");
const ObjectId = mongoose.Schema.Types.ObjectId;

const businessSchema = new mongoose.Schema(
    {
        business_name: {
            type: String,
        },
        business_Logo: {
            type: String,
        },
        invoiceLogo: {
            type: String,
        },
        contactNo: {
            type: String,
        },
        contactEmail: {
            type: String,
        },
        socialMedia: {
            facebook: {
                type: String,
            },
            instagram: {
                type: String,
            },
            twitter: {
                type: String,
            },
            linkedin: {
                type: String,
            },
            youtube: {
                type: String,
            },
        },
        privacyPolicy: {
            type: String,
        },
        iAgree: {
            type: String,
        },
        gsts: [
            {
                gstNo: {
                    type: String,
                },
                pickupAddress: {
                    type: String,
                },
                stateCode: {
                    type: String,
                },
            },
        ],
        defaultGST: {
            gstNo: {
                type: String,
            },
            pickupAddress: {
                type: String,
            },
            stateCode: {
                type: String,
            },
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Business", businessSchema);
