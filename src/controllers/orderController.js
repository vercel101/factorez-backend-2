const orderModel = require("../models/orderModel");
const customerModel = require("../models/customerModel");
const customerAddressModel = require("../models/customerAddressModel");
const vendorModel = require("../models/vendorModel");
const cartModel = require("../models/cartModel");
const productModel = require("../models/productModel");
const paymentModel = require("../models/paymentModel");
const cancelledReasonModel = require("../models/cancelledReasonModel");

const { generateRandomID, generateRandomAlphaNumericID } = require("../controllers/idGeneratorController");

const orderedProductModel = require("../models/orderedProductModel");
const orderStatusTableModel = require("../models/orderStatusTableModel");
const { isValidObjectId } = require("mongoose");
const couponCodeModel = require("../models/couponCodeModel");
const { createPayment } = require("./paymentController");
const { generatePurchaseInvoice, generateSaleInvoice } = require("./invoiceController");
const { isExpiryCoupon } = require("../utils/couponExpireUtil");
// CREATE ORDER
const createOrder = async (req, res) => {
    try {
        let customerId = req.params.customerId;
        let data = req.body;

        let { address_id, payment_mode, couponCode, paymentAmt, transaction_id } = data;
        if (!isValidObjectId(customerId)) {
            return res.status(400).send({ status: false, message: "Invalid Customer id request" });
        }
        if (!isValidObjectId(address_id)) {
            return res.status(400).send({ status: false, message: "Invalid Address id request" });
        }

        if (!payment_mode) {
            return res.status(400).send({ status: false, message: "Bad request" });
        }
        if (payment_mode !== "CUSTOM" && payment_mode !== "TWENTY_ADV" && payment_mode !== "PREPAID" && payment_mode !== "COD") {
            return res.status(400).send({ status: false, message: "Bad request" });
        }

        if ((payment_mode === "CUSTOM" || payment_mode === "TWENTY_ADV" || payment_mode === "PREPAID") && !transaction_id) {
            return res.status(400).send({ status: false, message: "Bad request" });
        }

        let customer = await customerModel.findById(customerId);
        let address = await customerAddressModel.findById(address_id);
        if (!customer || !address) {
            return res.status(400).send({ status: false, message: "Bad request" });
        }
        let cart = await cartModel.findOne({ customer_id: customerId }).populate({
            path: "products.product_id",
            model: "Product",
        });

        let demoObj = {};
        let coupon = null;
        if (couponCode) {
            coupon = await couponCodeModel.findOne({
                couponCode: couponCode,
                isDeleted: false,
                isExpired: false,
            });
            if (!coupon) {
                return res.status(400).send({ status: false, message: "Invalid Coupon Code" });
            }
            if (coupon && isExpiryCoupon(coupon.validTill)) {
                coupon.isExpired = true;
                await coupon.save();
                return res.status(400).send({ status: false, message: "Coupon Code Expired" });
            }
            if (coupon.customer_id.includes(customerId)) {
                return res.status(200).send({ status: false, message: "Coupon Already applied" });
            }
        }

        if (!cart) {
            return res.status(400).send({ status: false, message: "Bad Request" });
        }
        let orderAmt = 0;
        for (let product of cart.products) {
            let mAmt = product.product_id.seller_price + (product.product_id.margin * product.product_id.seller_price) / 100;
            let totalamt = mAmt + (mAmt * product.product_id.sellingGST) / 100;
            orderAmt += product.qty * totalamt;
            let key = product.product_id.vendor_id.toString();
            if (key in demoObj) {
                demoObj[key].push(product);
            } else {
                demoObj[key] = [product];
            }
        }
        if (coupon && coupon.minOrderAmt > orderAmt) {
            return res.status(200).send({ status: false, message: `Coupon not applied, minimum order should be ${coupon.minOrderAmt}` });
        }
        let orders = [];
        let grandTotal = 0;
        for (let vendor of Object.keys(demoObj)) {
            let orderedProduct = null;
            let vendorAmtInfo = {
                grandTotal: 0,
                gstAmt: 0,
                total: 0,
            };
            let total = 0;
            let GST_amount = 0;
            for (let p of demoObj[vendor]) {
                let x = {
                    product_id: "",
                    vendor_id: "",
                    mrp: "",
                    seller_price: "",
                    seller_gst: "",
                    selling_price: "",
                    selling_gst: "",
                    margin: "",
                    lotSize: "",
                    color: {
                        colorName: "",
                        colorHex: "",
                    },
                    hsnCode: "",
                    skuCode: "",
                    qty: "",
                    addedAt: "",
                };
                x.product_id = p.product_id._id;
                x.vendor_id = vendor;
                x.mrp = p.product_id.mrp;
                x.seller_price = p.product_id.seller_price;
                x.seller_gst = p.product_id.gst;
                let marginAmt = (Number(p.product_id.seller_price) * Number(p.product_id.margin)) / 100;
                let sellingGstAmt = ((Number(p.product_id.seller_price) + marginAmt) * Number(p.product_id.sellingGST)) / 100;
                x.selling_price = (Number(p.product_id.seller_price) + marginAmt + sellingGstAmt).toFixed(2);
                x.selling_gst = p.product_id.sellingGST;
                x.lotSize = p.lotSize;
                x.color = {
                    colorName: p.color.colorName,
                    colorHex: p.color.colorHex,
                };
                x.hsnCode = p.product_id.hsn_code;
                x.skuCode = p.product_id.sku_code;
                x.margin = p.product_id.margin;
                x.qty = p.qty;
                x.lotSize = p.lotSize;
                x.addedAt = p.addedAt;
                let currentTotal = (Number(p.product_id.seller_price) + marginAmt) * Number(p.qty);
                total += Number(currentTotal);
                GST_amount += sellingGstAmt * Number(p.qty);

                let vdrAmt = Number(p.product_id.seller_price) * Number(p.qty);
                let vdrGstAmt = (vdrAmt * Number(p.product_id.gst)) / 100;
                vendorAmtInfo.grandTotal += vdrAmt + vdrGstAmt;
                vendorAmtInfo.gstAmt += vdrGstAmt;
                vendorAmtInfo.total += vdrAmt;

                if (orderedProduct === null) {
                    orderedProduct = await orderedProductModel.create({
                        products: [x],
                    });
                } else {
                    orderedProduct.products.push(x);
                }
            }
            await orderedProduct.save();
            let odrObj = {
                orderId: generateRandomID(10, "FZ"),
                vendorId: vendor,
                order_date: new Date(),
                ordered_products: orderedProduct,
                customer_id: customerId,
                address_id: address_id,
                GST_amount: GST_amount.toFixed(2),
                total: total.toFixed(2),
                grand_total: (Number(GST_amount) + Number(total)).toFixed(2),
                vendorAmtInfo: vendorAmtInfo,
            };
            if (coupon !== null) {
                odrObj.couponCode = coupon._id;
            }
            grandTotal += Number(total) + Number(GST_amount);
            let addedOrder = await orderModel.create(odrObj);
            let status = await orderStatusTableModel.create({
                order_id: addedOrder._id,
            });
            addedOrder.order_status_id = status;
            await addedOrder.save();
            orderedProduct.order_id = addedOrder._id;
            await orderedProduct.save();
            orders.push(addedOrder);
        }
        cart.products = [];
        await cart.save();
        if (coupon !== null && coupon.maxDiscPrice < grandTotal) {
            let maxDiscount = 0;
            if (coupon.discountType === "PERCENTAGE") {
                let discAmt = (Number(grandTotal) * Number(coupon.discountAmt)) / 100;
                if (discAmt > coupon.maxDiscPrice) {
                    maxDiscount = coupon.maxDiscPrice;
                } else {
                    maxDiscount = discAmt;
                }
            } else if (coupon.discountType === "PRICE") {
                maxDiscount = coupon.discountAmt;
            }

            if (payment_mode === "PREPAID" && Number(paymentAmt) < Number(grandTotal) - Number(maxDiscount)) {
                return res.status(400).send({ status: false, message: "payment should be equal to grand total amount" });
            }

            for (let singleOrder of orders) {
                let percentage = Number(((Number(singleOrder.grand_total) * 100) / Number(grandTotal)).toFixed(2));
                let discountAmt = Number(((Number(maxDiscount) * Number(percentage)) / 100).toFixed(2));
                let partPayment = 0;
                if (payment_mode === "CUSTOM" || payment_mode === "TWENTY_ADV") {
                    partPayment = Number(((Number(paymentAmt) * Number(percentage)) / 100).toFixed(2));
                }
                if (payment_mode === "PREPAID") {
                    partPayment = Number(singleOrder.grand_total) - Number(discountAmt);
                }
                singleOrder.discounted_amount = discountAmt;
                let payment = await createPayment(
                    singleOrder.order_status_id.status,
                    payment_mode,
                    singleOrder.orderId,
                    singleOrder._id,
                    singleOrder.grand_total,
                    discountAmt,
                    partPayment,
                    customerId,
                    transaction_id
                );
                if (payment.status) {
                    singleOrder.payment_id = payment.paymentId;
                } else {
                    return res.status(400).send({ status: false, message: "Bad request" });
                }
                singleOrder.shipping_address = {
                    stateCode: address.stateCode,
                    state: address.state,
                    address: address.address,
                };
                await singleOrder.save();
                customer.orders.push(singleOrder._id);
            }
            coupon.customer_id.push(customerId);
            await coupon.save();
            await customer.save();
        } else {
            for (let singleOrder of orders) {
                let percentage = Number(((Number(singleOrder.grand_total) * 100) / Number(grandTotal)).toFixed(2));
                let discountAmt = 0;
                let partPayment = 0;
                if (payment_mode === "CUSTOM" || payment_mode === "TWENTY_ADV") {
                    partPayment = Number(((paymentAmt * percentage) / 100).toFixed(2));
                }
                if (payment_mode === "PREPAID") {
                    partPayment = Number(singleOrder.grand_total) - Number(discountAmt);
                }
                let payment = await createPayment(
                    singleOrder.order_status_id.status,
                    payment_mode,
                    singleOrder.orderId,
                    singleOrder._id,
                    singleOrder.grand_total,
                    discountAmt,
                    partPayment,
                    customerId,
                    transaction_id
                );
                if (payment.status) {
                    singleOrder.payment_id = payment.paymentId;
                } else {
                    return res.status(400).send({ status: false, message: "Bad request" });
                }
                singleOrder.shipping_address = {
                    stateCode: address.stateCode,
                    state: address.state,
                    address: address.address,
                };
                await singleOrder.save();
                customer.orders.push(singleOrder._id);
            }
            await customer.save();
        }
        return res.status(200).send({
            status: true,
            message: "Order Created Successfully",
            data: "orders",
        });
    } catch (error) {
        return res.status(500).send({ status: false, message: error.message });
    }
};

// GET ALL ORDERS
const getAllOrders = async (req, res) => {
    try {
        let orders = null;
        if (req.userModel === "VENDOR") {
            orders = await orderModel
                .find({ vendorId: req.userId })
                .populate(["vendorId", "order_status_id", "ordered_products", "purchaseInvoice"])
                .select(["-shipping_address", "-couponCode", "-customer_id"])
                .sort({ createdAt: -1 });
            // .populate({ path: "ordered_products", model: "Ordered_Product", populate: { path: "products.product_id", model: "Product" } });
        } else {
            orders = await orderModel
                .find()
                .populate([
                    "vendorId",
                    "payment_id",
                    "order_status_id",
                    "ordered_products",
                    "purchaseInvoice",
                    "saleInvoice",
                    { path: "CouponCode", strictPopulate: false },
                    { path: "customer_id", model: "Customer", populate: { path: "defaultAddress", model: "CustomerAddress" } },
                ])
                .sort({ createdAt: -1 });
            // .select("-vendorAmtInfo")
            // .populate({
            //     path: "ordered_products",
            //     model: "Ordered_Product",
            //     populate: { path: "products.product_id", model: "Product", populate: { path: "product_id.brandId", model: "Brand" } },
            // });
        }
        return res.status(200).send({ status: true, data: orders });
    } catch (error) {
        return res.status(500).send({ status: false, message: error.message });
    }
};

// GET ORDER BY ORDER ID
const getOrderByOrderId = async (req, res) => {
    try {
        let orderId = req.params.orderId;
        let customerId = req.params.customerId;
        if (!isValidObjectId(customerId)) {
            return res.status(400).send({ status: false, message: "Invalid Customer id" });
        }
        let order = await orderModel
            .findOne({ customer_id: customerId, orderId: orderId })
            .populate([
                "payment_id",
                "order_status_id",
                { path: "ordered_products", model: "Ordered_Product", populate: { path: "products.product_id", model: "Product" } },
                "saleInvoice",
                { path: "CouponCode", strictPopulate: false },
            ])
            .select("-purchaseInvoice");
        if (!order) {
            return res.status(404).send({ status: false, message: "Order not found" });
        }
        return res.status(200).send({ status: true, data: order });
    } catch (error) {
        return res.status(500).send({ status: false, message: error.message });
    }
};

// GET ALL ORDERS OF A CUSTOMER
const getOrdersByCustomerId = async (req, res) => {
    try {
        let customerId = req.params.customerId;
        let customerOrders = await orderModel.find({ customer_id: customerId }).populate(["vendorId", "customer_id", "payment_id", "order_status_id", "ordered_products"]);

        return res.status(200).send({ status: true, data: customerOrders });
    } catch (error) {
        return res.status(500).send({ status: false, message: error.message });
    }
};

// CANCEL ORDER BY ORDER ID
const cancelOrderByOrderId = async (req, res) => {
    try {
        let orderId = req.params.orderId;
        if (!isValidObjectId(orderId)) {
            return res.status(400).send({ status: false, message: "Invalid Order Id" });
        }

        let order = await orderModel.findOne({ _id: orderId });

        if (!order) {
            return res.status(404).send({
                status: false,
                message: "Order not found with this order id",
            });
        }

        let data = req.body;

        let { Status } = data;

        if (order.Status === "Cancelled") {
            return res.status(400).send({ status: false, message: "Order is already cancelled" });
        }

        let orderStatus = await orderModel.findOneAndUpdate({ _id: orderId }, { $set: { Status: "Cancelled" } }, { new: true });

        await order.save();

        return res.status(202).send({ status: true, message: "Order Cancelled Successfully" });
    } catch (error) {
        return res.status(500).send({ status: false, message: error.message });
    }
};

// UPDATE ORDER BY ORDER ID
const updateOrderByOrderId = async (req, res) => {
    try {
        //CONFIRM, PARTIAL, CANCEL
        let orderId = req.params.orderId;
        let { orderType, cancelMessage, questionId, removedProductIds } = req.body;
        if (!orderType || !orderId) {
            return res.status(400).send({ status: false, message: "Bad request" });
        }
        let order = await orderModel.findOne({ orderId: orderId }).populate(["ordered_products", "order_status_id"]);
        if (!order) {
            return res.status(400).send({ status: false, message: "Bad request" });
        }

        if (order.order_status_id.status !== "PENDING" && req.userModel === "VENDOR") {
            return res.status(400).send({ status: false, message: "Bad request" });
        }

        let payment = await paymentModel.findById(order.payment_id._id);
        if (!payment) {
            return res.status(400).send({ status: false, message: "Bad request" });
        }

        if (orderType === "PARTIAL_CONFIRMED") {
            let orderedProduct = order.ordered_products;
            let partialCanceledAmt = 0;
            let partialCanceledGstAmt = 0;
            let orderedProductAmtInfo = {
                productQty: 0,
                total: 0,
                GST_amount: 0,
                grand_total: 0,
            };
            let orderedAmtInfo = {
                grand_total: 0,
                total: 0,
                GST_amount: 0,
                discounted_amount: 0,
            };
            for (let s_product of orderedProduct.products) {
                if (s_product.isRemoved === false && removedProductIds.includes(s_product._id.toString())) {
                    s_product.isRemoved = true;
                    let canceledAmt = Number(s_product.seller_price) * Number(s_product.qty);
                    partialCanceledAmt += canceledAmt;
                    partialCanceledGstAmt += Number(((canceledAmt * Number(s_product.seller_gst)) / 100).toFixed(2));
                    let adminCancelledAmt = canceledAmt + (canceledAmt * s_product.margin) / 100;
                    orderedProductAmtInfo.productQty += 1;
                    orderedProductAmtInfo.total += Number(adminCancelledAmt.toFixed(2));
                    orderedProductAmtInfo.GST_amount += Number(((adminCancelledAmt * s_product.selling_gst) / 100).toFixed(2));
                    orderedProductAmtInfo.grand_total += adminCancelledAmt + Number(((adminCancelledAmt * s_product.selling_gst) / 100).toFixed(2));
                }
            }
            order.order_status_id.status = orderType;
            payment.order_status = "PARTIAL_CONFIRMED";
            let updatedByObj = {};
            if (req.userModel === "VENDOR") {
                updatedByObj.vendor = req.userId;
            } else if (req.userModel === "ADMIN") {
                updatedByObj.admin = req.userId;
            }
            let statusObj = {
                status: orderType,
                updatedBy: updatedByObj,
                updatedAt: new Date(),
                description: cancelMessage,
            };
            order.order_status_id.statusList.push(statusObj);
            order.vendorAmtInfo.gstAmt -= partialCanceledGstAmt;
            order.vendorAmtInfo.total -= partialCanceledAmt;
            order.vendorAmtInfo.grandTotal -= partialCanceledGstAmt + partialCanceledAmt;
            orderedAmtInfo.GST_amount = order.GST_amount;
            orderedAmtInfo.total = order.total;
            orderedAmtInfo.grand_total = order.grand_total;
            order.GST_amount -= orderedProductAmtInfo.GST_amount;
            order.total -= orderedProductAmtInfo.total;
            order.grand_total -= orderedProductAmtInfo.grand_total;
            order.partialCancelOrderInfo = {
                orderedAmtInfo,
                orderedProductAmtInfo,
            };
            await orderedProduct.save();
            await order.order_status_id.save();
            let purchaseGstAmount = 0;
            let purchaseTotalAmount = 0;
            for (let singleOrderProduct of order.ordered_products.products) {
                purchaseGstAmount += (singleOrderProduct.seller_price * singleOrderProduct.qty * singleOrderProduct.seller_gst) / 100;
                purchaseTotalAmount += singleOrderProduct.seller_price * singleOrderProduct.qty;
            }

            let invDataPurchase = {
                vendor_id: order.vendorId,
                order_id: order._id,
                gstAmount: purchaseGstAmount,
                totalAmount: purchaseTotalAmount,
            };
            let invDataSale = {
                customer_id: order.customer_id,
                order_id: order._id,
                gstAmount: order.GST_amount,
                totalAmount: order.total,
                address: order.shipping_address,
            };
            if ((payment.payment_mode === "CUSTOM" || payment.payment_mode === "TWENTY_ADV") && payment.partial_payment.payment_amount >= Number(order.grand_total) - Number(order.discounted_amount)) {
                payment.return_amount = (Number(payment.partial_payment.payment_amount) - (Number(order.grand_total) - Number(order.discounted_amount))).toFixed(2);
                payment.balance_amount = 0;
            } else if ((payment.payment_mode === "CUSTOM" || payment.payment_mode === "TWENTY_ADV") && payment.partial_payment.payment_amount < order.grand_total) {
                payment.return_amount = 0;
                let x = Number(order.grand_total) - Number(order.discounted_amount);
                payment.balance_amount = x - Number(payment.partial_payment.payment_amount).toFixed(2);
            } else if (payment.payment_mode === "PREPAID" && payment.payment_amount >= Number(order.grand_total) - Number(order.discounted_amount)) {
                payment.return_amount = (Number(payment.payment_amount) - (Number(order.grand_total) - Number(order.discounted_amount))).toFixed(2);
                payment.balance_amount = 0;
            } else if (payment.payment_mode === "COD") {
                payment.return_amount = 0;
                payment.balance_amount = Number(order.grand_total) - Number(order.discounted_amount);
            }
            payment.order_amount = order.grand_total;
            let resData = await generatePurchaseInvoice(invDataPurchase);
            let resData2 = await generateSaleInvoice(invDataSale);
            if (resData.status) {
                order.purchaseInvoice = resData.invoice._id;
            }
            if (resData2.status) {
                order.saleInvoice = resData2.invoice._id;
            }
        }
        if (orderType === "CANCEL") {
            order.order_status_id.status = "CANCELLED";
            payment.order_status = "CANCELLED";
            let updatedByObj = {};
            if (req.userModel === "VENDOR") {
                updatedByObj.vendor = req.userId;
            } else if (req.userModel === "ADMIN") {
                updatedByObj.admin = req.userId;
            } else {
                updatedByObj.customer = req.userId;
            }
            order.order_status_id.cancelled.userId = updatedByObj;
            order.order_status_id.cancelled.question = questionId;
            order.order_status_id.cancelled.description = cancelMessage;
            if (payment.payment_mode === "CUSTOM" || payment.payment_mode === "PREPAID" || payment.payment_mode === "TWENTY_ADV") {
                if (payment.payment_mode === "CUSTOM") {
                    payment.return_amount = Number(payment.partial_payment.payment_amount) + Number(payment.cod_received);
                    payment.balance_amount = 0;
                } else if (payment.payment_mode === "PREPAID") {
                    payment.return_amount = payment.payment_amount;
                    payment.balance_amount = 0;
                } else if (payment.payment_mode === "TWENTY_ADV") {
                    payment.return_amount = payment.partial_payment.payment_amount + Number(payment.cod_received);
                    payment.balance_amount = 0;
                }
            } else if (payment.payment_mode === "COD") {
                payment.return_amount = Number(payment.cod_received);
                payment.balance_amount = 0;
            }
            await order.order_status_id.save();
        }
        if (orderType === "CONFIRMED") {
            order.order_status_id.status = orderType;
            payment.order_status = "CONFIRMED";
            let updatedByObj = {};
            if (req.userModel === "VENDOR") {
                updatedByObj.vendor = req.userId;
            } else if (req.userModel === "ADMIN") {
                updatedByObj.admin = req.userId;
            }
            let statusObj = {
                status: orderType,
                updatedBy: updatedByObj,
                updatedAt: new Date(),
            };
            order.order_status_id.statusList.push(statusObj);
            await order.order_status_id.save();
            let purchaseGstAmount = 0;
            let purchaseTotalAmount = 0;
            for (let singleOrderProduct of order.ordered_products.products) {
                purchaseGstAmount += (singleOrderProduct.seller_price * singleOrderProduct.qty * singleOrderProduct.seller_gst) / 100;
                purchaseTotalAmount += singleOrderProduct.seller_price * singleOrderProduct.qty;
            }

            let invDataPurchase = {
                vendor_id: order.vendorId,
                order_id: order._id,
                gstAmount: purchaseGstAmount,
                totalAmount: purchaseTotalAmount,
            };
            let invDataSale = {
                customer_id: order.customer_id,
                order_id: order._id,
                gstAmount: order.GST_amount,
                totalAmount: order.total,
                address: order.shipping_address,
            };
            let resData = await generatePurchaseInvoice(invDataPurchase);
            let resData2 = await generateSaleInvoice(invDataSale);
            if (resData.status) {
                order.purchaseInvoice = resData.invoice._id;
            } else {
                return res.status(400).send({
                    status: false,
                    message: resData.err,
                });
            }
            if (resData2.status) {
                order.saleInvoice = resData2.invoice._id;
            } else {
                return res.status(400).send({
                    status: false,
                    message: resData2.err,
                });
            }
        }
        await payment.save();
        await order.save();
        return res.status(202).send({
            status: true,
            message: "Order updated successfully",
            data: order,
        });
    } catch (error) {
        return res.status(500).send({ status: false, message: error.message });
    }
};

const getOrderedProduct = async (req, res) => {
    try {
        let id = req.params.orderedproductid;
        let obj = await orderedProductModel.findById(id).populate("products.product_id");
        return res.status(200).send({
            status: true,
            message: "details fetched successfully...",
            data: obj,
        });
    } catch (error) {
        return res.status(500).send({ status: false, message: error.message });
    }
};
const patchTrackingIdByOrderId = async (req, res) => {
    try {
        let id = req.params.orderId;
        let { t_id } = req.body;
        if (!id || !t_id) {
            return res.status(400).send({ status: false, message: "Bad request" });
        }
        let obj = await orderModel.findOne({ orderId: id }).populate("order_status_id");
        if (!obj) {
            return res.status(400).send({ status: false, message: "Bad request" });
        }
        if (obj.order_status_id.status === "PENDING") {
            return res.status(400).send({ status: false, message: "Bad request" });
        }
        obj.tracking_id = t_id;
        await obj.save();
        return res.status(200).send({
            status: true,
            message: "Tracking ID Updated successfully...",
        });
    } catch (error) {
        return res.status(500).send({ status: false, message: error.message });
    }
};

const getAllCancelledOrder = async (req, res) => {
    try {
        let userModel = req.userModel;
        let userId = req.userId;
        let orders = null;
        if (userModel === "VENDOR") {
            orders = await orderModel
                .find({ vendorId: req.userId })
                .populate(["vendorId", "order_status_id", "ordered_products"])
                .select(["-shipping_address", "-couponCode", "-customer_id"])
                .sort({ createdAt: -1 });
        } else {
            orders = await orderModel.find().populate(["vendorId", "customer_id", "payment_id", "order_status_id", "ordered_products"]).sort({ createdAt: -1 });
        }

        if (!orders) {
            return res.status(400).send({ status: false, message: "Bad request" });
        }
        let cancelledOrders = [];
        for (let order of orders) {
            if (order.order_status_id.status === "CANCELLED") {
                cancelledOrders.push(order);
            }
        }
        return res.status(200).send({
            status: true,
            message: "Cancelled orders fetched...",
            data: cancelledOrders,
        });
    } catch (error) {
        return res.status(500).send({ status: false, message: error.message });
    }
};

const bulkOrderProcess = async (req, res) => {
    try {
        let { orderIds } = req.body;
        // let const records = await Model.find({ '_id': { $in: ids } });
        let orders = await orderModel.find({ _id: { $in: orderIds } }).populate(["ordered_products", "order_status_id"]);
        res.status(202).send({ status: true, data: orders, message: "Orders Processed" });
    } catch (error) {
        return res.status(500).send({ status: false, message: error.message });
    }
};

module.exports = {
    createOrder,
    getAllOrders,
    getOrderByOrderId,
    getOrdersByCustomerId,
    cancelOrderByOrderId,
    updateOrderByOrderId,
    getOrderedProduct,
    patchTrackingIdByOrderId,
    getAllCancelledOrder,
    bulkOrderProcess,
};
