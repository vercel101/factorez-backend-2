const mongoose = require("mongoose");
const ObjectId = mongoose.Schema.Types.ObjectId;

const wishlistSchema = new mongoose.Schema(
    {
        productId: {
            type: ObjectId,
            ref: "Product",
            required: true,
        },
        userId: {
            type: ObjectId,
            ref: "Customer",
            required: true,
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Wishlist", wishlistSchema);
