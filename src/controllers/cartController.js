const { isValidObjectId } = require("mongoose");
const cartModel = require("../models/cartModel");
const productModel = require("../models/productModel");
const { isValid } = require("../utils/utils");
const colorModel = require("../models/colorModel");
const customerModel = require("../models/customerModel");

// ADD TO CART
const addToCart = async (req, res) => {
    try {
        let customerId = req.params.customerId;
        let { product_id, qty, lotSize, colorId } = req.body;
        // Find the cart for the customer
        if (!isValidObjectId(customerId)) {
            return res.status(400).send({ status: false, message: "Invalid Customer ID" });
        }
        if (!isValidObjectId(colorId)) {
            return res.status(400).send({ status: false, message: "Invalid Color ID" });
        }
        let cart = await cartModel.findOne({ customer_id: customerId });
        let customer = await customerModel.findById(customerId);
        let color = await colorModel.findById(colorId);

        let isProductExists = await productModel.findOne({
            _id: product_id,
            status: "Approved",
        });

        if (!isProductExists) {
            return res.status(404).send({ status: false, message: "Product not found" });
        }

        let data = {
            product_id: product_id,
            qty: Number(qty),
            lotSize: lotSize,
            color: {
                colorName: color.colorName,
                colorHex: color.colorHex,
            },
        };
        if (!cart) {
            return res.status(400).send({ status: false, message: "Server Error" });
        } else {
            data.addedAt = new Date().toLocaleString();
            cart.products.push(data);
        }
        await cart.save();

        let dataX = {
            name: customer.name,
            email: customer.email,
            customerId: customer._id.toString(),
            userType: "CUSTOMER",
            isActivated: customer.isActivated,
            phone: customer.phone,
            cartLength: cart.products.length,
        };

        res.status(201).send({ status: true, message: "Cart updated successfully", data: dataX });
    } catch (error) {
        return res.status(500).send({ status: false, message: error.message });
    }
};

const priceCal = (price, margin, gst) => {
    let marginAmt = Number(price) + (Number(price) * Number(margin)) / 100;
    let gstAmt = (Number(marginAmt) * Number(gst)) / 100;
    return (gstAmt + marginAmt).toFixed(2);
};
const totalPriceCalc = (products) => {
    let totalPrice = 0;
    products.forEach((element) => {
        let { seller_price, margin, sellingGST } = element.product_id;
        totalPrice += Number(element.qty) * Number(priceCal(seller_price, margin, sellingGST));
    });
    return totalPrice.toFixed(2);
};

const qtyIncreaseDecrease = async (req, res) => {
    try {
        let customerId = req.params.customerId;
        let index = req.params.index;
        let qty = req.params.qty;
        let cart = await cartModel.findOne({ customer_id: customerId }).populate("products.product_id");
        if (!cart) {
            return res.status(400).send({ status: false, message: "Bad request" });
        }

        if (cart.products.length > 0) {
            cart.products[index].qty = qty;
            let cartAmt_current = totalPriceCalc(cart.products);
            console.log(cartAmt_current);
            if (cart.currentCoupon && cartAmt_current < cart.currentCoupon.minOrderAmt) {
                console.log("hell");
                cart.currentCoupon = undefined;
            }
            await cart.save();
        } else {
            return res.status(400).send({ status: false, message: "Bad request" });
        }
        return res.status(201).json({ message: "Quantity updated" });
    } catch (error) {
        return res.status(500).send({ status: false, message: error.message });
    }
};

const removeFromCart = async (req, res) => {
    try {
        let customerId = req.params.customerId;
        let index = req.params.index;
        let cart = await cartModel.findOne({ customer_id: customerId });

        if (!cart) {
            return res.status(400).send({ status: false, message: "Bad request" });
        }
        if (cart.products.length > 0) {
            let arr = cart.products;
            arr.splice(index, 1);
            cart.products = arr;
            await cart.save();
        }
        res.status(201).json({ message: "Product removed successfully" });
    } catch (error) {
        return res.status(500).send({ status: false, message: error.message });
    }
};

// GET ALL CARTS
const getAllAbandentCarts = async (req, res) => {
    try {
        let carts = await cartModel.find({ products: { $gte: [{ $size: 0 }] } }).populate(["customer_id", { path: "products.product_id", model: "Product" }]);
        return res.status(200).send({ status: true, data: carts });
    } catch (error) {
        return res.status(500).send({ status: false, message: error.message });
    }
};

// GET CART BY CUSTOMER ID
const getCartByCustomerId = async (req, res) => {
    try {
        let customerId = req.params.customerId;
        let cart = await cartModel.findOne({ customer_id: customerId }).populate({ path: "products.product_id", model: "Product", populate: { path: "brandId", model: "Brand" } });

        if (!cart) {
            return res.status(404).send({ status: false, message: "No cart found with this customer" });
        }
        let customer = await customerModel.findById(customerId);
        let data = {
            name: customer.name,
            email: customer.email,
            customerId: customer._id.toString(),
            userType: "CUSTOMER",
            isActivated: customer.isActivated,
            phone: customer.phone,
            cartLength: cart.products.length,
        };
        return res.status(200).send({ status: true, data: cart, customerData: data });
    } catch (error) {
        return res.status(500).send({ status: false, message: error.message });
    }
};

module.exports = {
    addToCart,
    getAllAbandentCarts,
    getCartByCustomerId,
    removeFromCart,
    qtyIncreaseDecrease,
};
