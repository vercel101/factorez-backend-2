const mongoose = require("mongoose");
const { listOfRoleEnums, listOfAccessControll } = require("../utils/enums");
const ObjectId = mongoose.Schema.Types.ObjectId;

const adminSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
            trim: true,
        },
        phone: {
            type: String,
            required: true,
            unique: true,
            trim: true,
        },
        password: {
            type: String,
            required: true,
            trim: true,
        },
        role: [
            {
                type: String,
                enum: listOfAccessControll(),
            },
        ],
        profileUrl: {
            type: String,
            trim: true,
        },
        isSuperAdmin: {
            type: Boolean,
            default: false,
        },
        isDeleted: {
            type: Boolean,
            default: false,
        },
    },
    { timestamps: true }
);
module.exports = mongoose.model("Admin", adminSchema);
