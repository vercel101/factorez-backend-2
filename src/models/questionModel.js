const mongoose = require("mongoose");
const ObjectId = mongoose.Schema.Types.ObjectId;

const questionSchema = new mongoose.Schema(
    {
        questionFor: {
            type: String,
            enum: ["ADMIN", "CUSTOMER", "VENDOR"],
        },

        question: {
            type: String,
        },
        isDeleted: {
            type: Boolean,
            default: false,
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Question", questionSchema);
