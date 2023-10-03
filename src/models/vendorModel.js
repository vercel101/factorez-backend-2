const mongoose = require("mongoose");
const { listOfRoleEnums, listOfAccessControll } = require("../utils/enums");
const ObjectId = mongoose.Schema.Types.ObjectId;

const vendorSchema = new mongoose.Schema(
    {
        firmName: {
            type: String,
            required: true,
            trim: true,
        },

        gstNo: {
            type: String,
            trim: true,
        },
        representativeName: {
            type: String,
            required: true,
            trim: true,
        },
        profileUrl: {
            type: String,
            trim: true,
        },
        emailId: {
            type: String,
            trim: true,
        },
        password: {
            type: String,
            trim: true,
        },
        mobileNo: {
            type: String,
            required: true,
            unique: true,
            trim: true,
        },

        altMobileNo: {
            type: String,
            trim: true,
        },
        pickupState: {
            type: String,
            trim: true,
        },
        pickupCity: {
            type: String,
            trim: true,
        },
        pickupPincode: {
            type: String,
            trim: true,
        },
        invoiceAddress: {
            type: String,
            trim: true,
        },
        pickupAddress: {
            type: String,
            trim: true,
        },
        termsAndConditions: {
            type: Boolean,
            required: true,
        },
        bank_id: {
            type: ObjectId,
            ref: "Bank",
        },
        document_id: {
            type: ObjectId,
            ref: "Document",
        },

        brand_id: [
            {
                type: ObjectId,
                ref: "Brand",
            },
        ],

        vendor_unique_id: {
            type: String,
            unique: true,
            trim: true,
        },

        auth_unique_id: {
            type: String,
            unique: true,
            trim: true,
        },

        db_unique_id: {
            type: String,
            unique: true,
            trim: true,
        },

        sharing_unique_id: {
            type: String,
            unique: true,
            trim: true,
        },

        basicInfoStatus: {
            type: String,
            enum: ["Approved", "Rejected", "Pending"],
            default: "Pending",
        },
        products: [
            {
                type: ObjectId,
                ref: "Product",
            },
        ],

        orders: [
            {
                type: ObjectId,
                ref: "Order",
            },
        ],

        order_success: [
            {
                type: ObjectId,
                ref: "Order_Success",
            },
        ],

        order_canclled: [
            {
                type: ObjectId,
                ref: "Order_Cancelled",
            },
        ],

        order_pending: [
            {
                type: ObjectId,
                ref: "Order_Pending",
            },
        ],

        order_inprogress: [
            {
                type: ObjectId,
                ref: "Order_Inprogress",
            },
        ],

        logistics_id: {
            type: ObjectId,
            ref: "Logistics",
        },

        business_id: {
            type: ObjectId,
            ref: "Business",
        },
        status: {
            type: String,
            enum: ["Pending", "Rejected", "Inprogress", "Approved"],
            default: "Pending",
        },
        isActive: {
            type: String,
            enum: ["Active", "Inactive", "Blocked"],
            default: "Active",
        },
        actionTakenBy: {
            type: ObjectId,
            ref: "Admin",
        },
        marginInPercentage: {
            type: Number,
        },
        isDeleted: {
            type: Boolean,
            default: false,
        },
        role: [
            {
                type: String,
                enum: "VENDOR",
            },
        ],
    },
    { timestamps: true }
);

module.exports = mongoose.model("Vendor", vendorSchema);
