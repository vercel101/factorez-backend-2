const mongoose = require("mongoose");
const ObjectId = mongoose.Schema.Types.ObjectId;

const bannerSchema = new mongoose.Schema(
    {
        bannerUrl: {
            type: String,
            required: true,
        },
        type: {
            type: String,
            enum: ["SINGLE", "MULTIPLE"],
            required: true,
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Banner", bannerSchema);
