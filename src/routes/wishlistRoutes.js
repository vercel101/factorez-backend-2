const express = require("express");
const { addToWishlist, removeFromWishlist, getWishlistProduct } = require("../controllers/wishlistController");
const { AuthenticationCustomer } = require("../middlewares/auth");
const router = express.Router();

router.post("/add-to-wishlist", AuthenticationCustomer, addToWishlist);
router.delete("/remove-from-wishlist/:wishlistId", AuthenticationCustomer, removeFromWishlist);
router.get("/get-wishlist", AuthenticationCustomer, getWishlistProduct);
module.exports = router;
