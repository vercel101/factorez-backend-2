const paymentModel = require("../models/paymentModel");
const orderModel = require("../models/orderModel");
const cartModel = require("../models/cartModel");
const customerModel = require("../models/customerAddressModel");
const { generateRandomID } = require("./idGeneratorController");

// CREATE PAYMENT
const createPayment = async (order_status, payment_mode, order_sortId, order_id, orderAmt, discountAmt, paymentAmt, customer_id, transaction_id) => {
    try {
        // let orderId = req.params.orderId;
        // let { payment_mode, paymentAmt, customer_id, transaction_id } = req.body;

        if (!payment_mode || !customer_id) {
            return { status: false };
        }
        let paymentData = {
            order_status,
            paymentId: generateRandomID(20),
            customer_id,
            payment_status: "",
            payment_mode,
            order_amount: orderAmt,
            discount_amt: discountAmt,
            balance_amount: 0,
            order_id: {
                orderId: order_id,
                order_custom_id: order_sortId,
            },
        };
        if (payment_mode === "CUSTOM" || payment_mode === "TWENTY_ADV") {
            paymentData.partial_payment = {
                payment_amount: paymentAmt.toFixed(2),
                date: new Date(),
                transactionId: transaction_id,
            };
            paymentData.payment_status = "PARTIAL_PAID";
            if (orderAmt > paymentAmt) {
                paymentData.balance_amount = (orderAmt - paymentAmt - discountAmt).toFixed(2);
            }
        } else if (payment_mode === "PREPAID") {
            paymentData.transactionId = transaction_id;
            paymentData.payment_amount = paymentAmt.toFixed(2);
            paymentData.payment_status = "RECEIVED";
            paymentData.payment_date = new Date();
            paymentData.balance_amount = 0;
        } else if (payment_mode === "COD") {
            paymentData.payment_status = "PENDING";
            paymentData.balance_amount = (orderAmt - paymentAmt - discountAmt).toFixed(2);
        }

        let paymentObj = await paymentModel.create(paymentData);
        return { status: true, paymentId: paymentObj._id };
    } catch (error) {
        return { status: false };
    }
};

// UPDATE PAYMENT API
const updatePaymentStatus = async (req, res) => {
    try {
        let paymentId = req.params.paymentId;
        let { payment_date, payment_amount, payment_status } = req.body;
        console.log(req.body);
        // console.log(paymentId);
        let payment = await paymentModel.findById(paymentId);
        // console.log(payment);
        if (!payment) {
            return res.status(404).send({
                status: false,
                message: "Payment not found with this payment id",
            });
        }

        if (!payment_date || !payment_amount || !payment_status) {
            return res.status(400).send({
                status: false,
                message: "All fields are required",
            });
        }

        payment.payment_date = new Date(payment_date);
        switch (payment_status) {
            case "RECEIVED": {
                if (Number(payment.balance_amount) !== Number(payment_amount)) {
                    return res.status(400).send({
                        status: false,
                        message: "Received amount should be equal to balance amount",
                    });
                } else {
                    payment.payment_amount += Number(payment_amount);
                    payment.cod_received = Number(payment_amount);
                    payment.payment_status = payment_status;
                    payment.balance_amount = 0;
                }
                break;
            }
            case "REFUNDED": {
                if (Number(payment.return_amount) !== Number(payment_amount)) {
                    return res.status(400).send({
                        status: false,
                        message: "Cancelled amount should be equal to refund amount",
                    });
                } else if (payment.order_status === "CANCELLED") {
                    payment.payment_status = "REFUNDED";
                    payment.return_amount = Number(payment_amount);
                    payment.balance_amount = 0;
                } else if (payment.order_status === "PARTIAL_CONFIRMED") {
                    payment.payment_status = "PARTIAL_REFUNDED";
                    payment.return_amount = Number(payment_amount);
                    payment.balance_amount = 0;
                } else {
                    payment.payment_status = "REFUNDED";
                    payment.return_amount = Number(payment_amount);
                    payment.balance_amount = 0;
                }
                break;
            }
            default:
                break;
        }
        await payment.save();
        return res.status(202).send({
            status: true,
            message: "Payment status updated successfully",
            data: payment,
        });
    } catch (error) {
        return res.status(500).send({ status: false, message: error.message });
    }
};

// CREATE PAYMENT
const addPayment = async (req, res) => {
    try {
        let orderId = req.params.orderId;
        let data = req.body;
        let payment = 856.8;

        let { payment_mode } = data;

        let order = await orderModel.findOne({ _id: orderId });

        if (!order) {
            return res.status(404).send({ status: false, message: "Order not found" });
        }

        if (payment > order.grand_total) {
            return res.status(400).send({
                status: false,
                message: "Paid amount can not be greater than the Grand Total",
            });
        }

        let paymentDetails = {
            paymentId: generateRandomID(10),
            order_id: order._id,
            customer_id: order.customer_id,
            payment_status: "Pending",
            payment_mode,
            transactionId: generateRandomID(25),
            payment_amount: payment,
            payment_date: new Date().toLocaleString(),
            partial_mode: null,
        };

        if (payment_mode === "TEN_ADV") {
            let ten_percent_amount = order.grand_total * 0.1;
            let partialPaymentDetails = {
                payment_mode: "TEN_ADV",
                amount: ten_percent_amount,
                date: new Date(),
                transactionId: generateRandomID(25),
            };

            // paymentDetailsData.push(partialPaymentDetails);

            let firstPartialPayment = await partialPaymentModel.findOne({});

            if (firstPartialPayment) {
                let partialPaymentDetails = {
                    payment_mode: "TEN_ADV",
                    amount: order.grand_total - ten_percent_amount,
                    date: new Date(),
                    transactionId: generateRandomID(25),
                };
                firstPartialPayment.paymentDetails.push(partialPaymentDetails);

                await firstPartialPayment.save();
            }

            let partialPaymentData = {
                paymentDetails: partialPaymentDetails,
                remaining_amount: order.grand_total - partialPaymentDetails.amount,
            };

            newPartialPayment = await partialPaymentModel.create(partialPaymentData);

            paymentDetails.partial_mode = newPartialPayment._id;

            paymentDetails.payment_status = "Pending";
            paymentDetails.payment_amount = ten_percent_amount;

            paymentDetails.paymentDetails = [partialPaymentDetails];

            let newPayment = await paymentModel.create(paymentDetails);

            return res.status(200).send({
                status: true,
                message: "Success",
                data: {
                    partialPaymentData: newPartialPayment,
                    paymentData: newPayment,
                },
            });
        } else if (payment_mode === "TWENTY_ADV") {
            let twenty_percent_amount = order.grand_total * 0.2;
            let partialPaymentDetails = {
                payment_mode: "TWENTY_ADV",
                amount: twenty_percent_amount,
                date: new Date(),
                transactionId: generateRandomID(25),
            };

            let firstPartialPayment = await partialPaymentModel.findOne({
                payment_mode: "TWENTY_ADV",
            });

            if (firstPartialPayment) {
                let partialPaymentDetails = {
                    payment_mode: "TWENTY_ADV",
                    amount: order.grand_total - twenty_percent_amount,
                    date: new Date(),
                    transactionId: generateRandomID(25),
                };
                firstPartialPayment.paymentDetails.push(partialPaymentDetails);

                await firstPartialPayment.save();
            }

            let partialPaymentData = {
                paymentDetails: partialPaymentDetails,
                remaining_amount: order.grand_total - partialPaymentDetails.amount,
            };

            newPartialPayment = await partialPaymentModel.create(partialPaymentData);

            paymentDetails.partial_mode = newPartialPayment._id;
            paymentDetails.payment_status = "PENDING";
            paymentDetails.payment_amount = twenty_percent_amount;

            paymentDetails.paymentDetails = [partialPaymentDetails];

            let newPayment = await paymentModel.create(paymentDetails);

            return res.status(200).send({
                status: true,
                message: "Success",
                data: {
                    partialPaymentData: newPartialPayment,
                    paymentData: newPayment,
                },
            });
        } else if (payment_mode === "COD") {
            if (payment < order.grand_total) {
                let partialPaymentDetails = {
                    payment_mode: "COD",
                    amount: payment,
                    date: new Date(),
                    transactionId: generateRandomID(25),
                };

                // Update the existing Partial_Payment or create a new one
                let partialPaymentData = await partialPaymentModel.findOne({
                    payment_mode: "COD",
                });

                if (partialPaymentData) {
                    partialPaymentData.paymentDetails.push(partialPaymentDetails);
                    partialPaymentData.remaining_amount = order.grand_total - payment - partialPaymentData.paymentDetails.reduce((sum, item) => sum + item.amount, 0);

                    await partialPaymentData.save();

                    paymentDetails.partial_mode = partialPaymentData._id;
                } else {
                    partialPaymentData = await partialPaymentModel.create({
                        paymentDetails: [partialPaymentDetails],
                        remaining_amount: order.grand_total - payment,
                        payment_mode: "COD",
                    });

                    const newPartialPayment = await partialPaymentData.save();
                    paymentDetails.partial_mode = newPartialPayment._id;
                }

                // let partialPaymentData = {
                //   paymentDetails: partialPaymentDetails,
                //   remaining_amount: order.grand_total - partialPaymentDetails.amount,
                // };

                newPartialPayment = await partialPaymentModel.create(partialPaymentData);

                paymentDetails.partial_mode = newPartialPayment._id;
                paymentDetails.payment_status = "PENDING";
                let newPayment = await paymentModel.create(paymentDetails);

                return res.status(200).send({
                    status: true,
                    message: "Success",
                    data: {
                        partialPaymentData: newPartialPayment,
                        paymentData: newPayment,
                    },
                });
            } else {
                paymentDetails.payment_status = "RECEIVED";
                let newPayment = await paymentModel.create(paymentDetails);

                return res.status(200).send({
                    status: true,
                    message: "Success",
                    data: {
                        paymentData: newPayment,
                    },
                });
            }
        } else {
            if (payment === order.grand_total) {
                paymentDetails.payment_status = "RECEIVED";
                let newPayment = await paymentModel.create(paymentDetails);

                return res.status(200).send({ status: true, message: "Success", data: newPayment });
            } else {
                return res.status(400).send({
                    status: false,
                    message: "Paid amount should be equal to Grand Total",
                });
            }
        }
    } catch (error) {
        return res.status(500).send({ status: false, message: error.message });
    }
};

module.exports = { createPayment, updatePaymentStatus, addPayment };
