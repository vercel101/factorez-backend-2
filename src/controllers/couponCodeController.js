const couponCodeModel = require("../models/couponCodeModel");
const customerModel = require("../models/customerModel");
const { isValidObjectId } = require("mongoose");
const { isExpiryCoupon } = require("../utils/couponExpireUtil");

// const isExpiryCoupon = (validTill) => {
//     let day = validTill.getDate();
//     let month = validTill.getMonth() + 1;
//     let year = validTill.getFullYear();
//     let expiryDateMS = new Date(`${year}-${month < 10 ? "0" + month : month}-${day < 10 ? "0" + day : day}`).getTime() / 1000;

//     let now = Date.now();
//     // let date = new Date(now + (5.5 * (3600 * 1000))); // Deployment time cases for +5:30 GMT
//     let date = new Date();
//     let dateStr = `${date.getFullYear()}-${date.getMonth() + 1 < 10 ? "0" + (date.getMonth() + 1) : date.getMonth() + 1}-${date.getDate() < 10 ? "0" + date.getDate() : date.getDate()}`;
//     let currentDateMS = new Date(dateStr).getTime() / 1000;

//     return currentDateMS <= expiryDateMS ? false : true;
// };

const generateCoupon = async (req, res) => {
    try {
        let { couponCode, validTill, maxUsers, maxDiscPrice, discountType, discountAmt, minOrderAmt } = req.body;
        if (!couponCode || couponCode === "") {
            return res.status(400).send({ status: false, message: "Coupon code required" });
        }
        if (!validTill || validTill === "") {
            return res.status(400).send({ status: false, message: "Coupon expiry date required" });
        }
        if (!maxUsers || Number(maxUsers) === 0) {
            return res.status(400).send({ status: false, message: "Coupon uses limit is required" });
        }

        if (!discountAmt || Number(discountAmt) === 0) {
            return res.status(400).send({ status: false, message: "Coupon discount amount is required" });
        }
        if (!discountType || discountType === "") {
            return res.status(400).send({ status: false, message: "Coupon discount type is required" });
        }
        if (!minOrderAmt || minOrderAmt === "") {
            return res.status(400).send({ status: false, message: "Minimum order is required" });
        }
        if (discountType === "Percentage") {
            if (!maxDiscPrice || Number(maxDiscPrice) === 0) {
                return res.status(400).send({ status: false, message: "Coupon Maximum discount price is required" });
            }
        }
        let coupon = await couponCodeModel.findOne({ couponCode: couponCode, isDeleted: false });
        if (coupon) {
            return res.status(200).send({ status: false, message: "This coupon code is already created" });
        }
        let newDate = new Date(validTill);
        let createData = {
            couponCode,
            validTill: newDate,
            maxUsers,
            maxDiscPrice,
            discountType,
            discountAmt,
            minOrderAmt,
        };
        if (discountType === "PRICE") {
            createData.maxDiscPrice = discountAmt;
        }
        let createdCoupon = await couponCodeModel.create(createData);
        res.status(201).send({ status: true, message: "Coupon created successfully...", data: createdCoupon });
    } catch (error) {
        return res.status(500).send({ status: false, message: error.message });
    }
};

const applyCoupon = async (req, res) => {
    try {
        let customer_id = req.params.customerid;
        let { couponCode, orderAmount } = req.body;
        if (!couponCode || couponCode === "") {
            return res.status(400).send({ status: false, message: "Coupon id required" });
        }
        if (!orderAmount || orderAmount === "") {
            return res.status(400).send({ status: false, message: "Order Amount required" });
        }
        if (!isValidObjectId(customer_id)) {
            return res.status(400).send({ status: false, message: "Invalid Request" });
        }
        let customer = await customerModel.findById(customer_id).populate("cart_id");
        if (!customer) {
            return res.status(400).send({ status: false, message: "Bad request" });
        }
        let coupon = await couponCodeModel.findOne({ couponCode: couponCode, isDeleted: false });
        if (!coupon) {
            return res.status(400).send({ status: false, message: "Invalid Coupon Code" });
        }
        if (coupon.isExpired) {
            return res.status(200).send({ status: false, message: "Coupon code expired" });
        }
        if (coupon.isUsed) {
            return res.status(200).send({ status: false, message: "Coupon code uses has exceed to its maximum limit" });
        }
        if (coupon.minOrderAmt > orderAmount) {
            return res.status(200).send({ status: false, message: `This coupon is applicable for Minimum order amount ${coupon.minOrderAmt}` });
        }

        let day = coupon.validTill.getDate();
        let month = coupon.validTill.getMonth() + 1;
        let year = coupon.validTill.getFullYear();
        let expiryDateMS = new Date(`${year}-${month < 10 ? "0" + month : month}-${day < 10 ? "0" + day : day}`).getTime() / 1000;

        let now = Date.now();
        // let date = new Date(now + (5.5 * (3600 * 1000))); // Deployment time cases for +5:30 GMT
        let date = new Date();
        let dateStr = `${date.getFullYear()}-${date.getMonth() + 1 < 10 ? "0" + (date.getMonth() + 1) : date.getMonth() + 1}-${date.getDate() < 10 ? "0" + date.getDate() : date.getDate()}`;
        let currentDateMS = new Date(dateStr).getTime() / 1000;

        if (currentDateMS <= expiryDateMS) {
            if (coupon.customer_id.includes(customer_id)) {
                return res.status(200).send({ status: false, message: "Coupon Already applied" });
            } else {
                if (coupon.customer_id.length >= coupon.maxUsers && coupon.isUsed === false) {
                    coupon.isUsed = true;
                    await coupon.save();
                    return res.status(200).send({ status: false, message: "Coupon code uses has exceed to its maximum limit" });
                }

                // coupon.customer_id.push(customer_id);
                // if (coupon.customer_id.length === coupon.maxUsers) {
                //     coupon.isUsed = true;
                // }
                // await coupon.save();
                // let couponData = {
                //     couponCode: coupon.couponCode,
                //     minOrderAmt: coupon.minOrderAmt,
                //     discountAmt: coupon.discountAmt,
                // };
                // customer.cart_id.currentCoupon = couponData;
                // await customer.cart_id.save();
                return res.status(202).send({
                    status: true,
                    data: coupon.discountAmt,
                    message: "Coupon applied successfully...",
                });
            }
        } else {
            coupon.isExpired = true;
            await coupon.save();
            return res.status(200).send({ status: false, message: "Coupon code expired" });
        }
    } catch (error) {
        return res.status(500).send({ status: false, message: error.message });
    }
};

const getAllCoupons = async (req, res) => {
    try {
        let coupons = await couponCodeModel.find({ isDeleted: false }).sort({ createdAt: -1 }).populate("customer_id");
        for (let coupon of coupons) {
            if (!coupon.isExpired) {
                if (isExpiryCoupon(coupon.validTill)) {
                    coupon.isExpired = true;
                    await coupon.save();
                }
            }
        }
        res.status(200).send({ status: true, message: "All Coupons fetched successfully...", data: coupons });
    } catch (error) {
        return res.status(500).send({ status: false, message: error.message });
    }
};

const deleteCoupon = async (req, res) => {
    try {
        let couponId = req.params.couponid;
        let coupon = await couponCodeModel.findById(couponId);
        if (!coupon) {
            return res.status(400).send({ status: false, message: "Bad request" });
        }
        coupon.isDeleted = true;
        await coupon.save();
        return res.status(202).send({ status: true, message: "Coupon deleted successfully" });
    } catch (error) {
        return res.status(500).send({ status: false, message: error.message });
    }
};

module.exports = { generateCoupon, applyCoupon, getAllCoupons, deleteCoupon };
