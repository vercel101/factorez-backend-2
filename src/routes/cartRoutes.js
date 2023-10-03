const express = require("express");
const router = express.Router();
const { addToCart, getAllAbandentCarts, getCartByCustomerId, removeFromCart, qtyIncreaseDecrease } = require("../controllers/cartController");
const { Authentication, AuthenticationCustomer } = require("../middlewares/auth");
const { abandonedOrderRole } = require("../middlewares/roleAuth");

router.post("/addtocart/:customerId", AuthenticationCustomer, addToCart);
router.get("/cart/:customerId", getCartByCustomerId);
router.get("/abandonedcarts", Authentication, abandonedOrderRole, getAllAbandentCarts);
router.put("/removefromcart/:customerId/:index", AuthenticationCustomer, removeFromCart);
router.put("/qty-increase-decrease/:customerId/:index/:qty", AuthenticationCustomer, qtyIncreaseDecrease);

module.exports = router;
