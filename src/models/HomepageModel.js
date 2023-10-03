const mongoose = require("mongoose");
const ObjectId = mongoose.Schema.Types.ObjectId;

const homepageSchema = new mongoose.Schema(
    {
        featuredProduct: [
            {
                type: ObjectId,
                ref: "Product",
            },
        ],
        newArrival: [
            {
                type: ObjectId,
                ref: "Product",
            },
        ],
        bestSelling: [
            {
                type: ObjectId,
                ref: "Product",
            },
        ],
    },
    { timestamps: true }
);

module.exports = mongoose.model("Homepage", homepageSchema);
