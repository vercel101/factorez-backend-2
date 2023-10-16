const { isValidObjectId } = require("mongoose");
const productModel = require("../models/productModel");
const wishlistModel = require("../models/wishlistModel");
const customerModel = require("../models/customerModel");

const addToWishlist = async (req, res) => {
    try {
        let { productId } = req.body;
        if (!productId) {
            return res.status(400).send({ status: false, message: "bad request" });
        }
        if (!isValidObjectId(productId)) {
            return res.status(400).send({ status: false, message: "invalid product id" });
        }
        let product = await productModel.findById(productId);
        if (!product) {
            return res.status(400).send({ status: false, message: "product not found" });
        }
        let wishlistObj = await wishlistModel.findOne({ productId: productId, userId: req.userId });
        if (wishlistObj) {
            return res.status(200).send({ status: false, message: "Already in wishlist" });
        }
        let customer = await customerModel.findById(req.userId).populate("cart_id");
        await wishlistModel.create({ productId: productId, userId: customer._id });
        let wishlist = await wishlistModel.find({ userId: customer._id });
        let dataX = {
            name: customer.name,
            email: customer.email,
            customerId: customer._id.toString(),
            userType: "CUSTOMER",
            isActivated: customer.isActivated,
            phone: customer.phone,
            cartLength: customer.cart_id.products.length,
            wishlistLength: wishlist.length,
        };
        res.status(201).send({ status: true, data: dataX, message: "Added to wishlist" });
    } catch (error) {
        return res.status(500).send({ status: false, message: error.message });
    }
};

const removeFromWishlist = async (req, res) => {
    try {
        let wishlistId = req.params.wishlistId;
        if (!wishlistId) {
            return res.status(400).send({ status: false, message: "bad request" });
        }
        if (!isValidObjectId(wishlistId)) {
            return res.status(400).send({ status: false, message: "invalid wishlist id" });
        }
        let wishlist = await wishlistModel.findOneAndDelete({ userId: req.userId, productId: wishlistId });
        if (wishlist) {
            res.status(200).send({ status: true, message: "Removed from wishlist" });
        } else {
            return res.status(400).send({ status: false, message: "Bad request" });
        }
    } catch (error) {
        return res.status(500).send({ status: false, message: error.message });
    }
};
const getWishlistProduct = async (req, res) => {
    try {
        let data = await wishlistModel.find({ userId: req.userId }).populate("productId");
        res.status(200).send({ status: true, data: data, message: "Wishlist fetched" });
    } catch (error) {
        return res.status(500).send({ status: false, message: error.message });
    }
};

module.exports = { addToWishlist, removeFromWishlist, getWishlistProduct };
