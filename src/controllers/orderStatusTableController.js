const orderStatusTableModel = require("../models/orderStatusTableModel");
const orderModel = require("../models/orderModel");
const cancelledReasonModel = require("../models/cancelledReasonModel");
const { isValidObjectId } = require("mongoose");

// CREATE ORDER STATUS TABLE
const createOrderStatusTable = async (req, res) => {
    try {
        let orderId = req.params.orderId;
        if (!isValidObjectId(orderId)) {
            return res
                .status(400)
                .send({ status: false, message: "Invalid Order Id" });
        }

        let order = await orderModel.findOne({ _id: orderId });

        if (!order) {
            return res.status(404).send({
                status: false,
                message: "Order not found with this order id",
            });
        }

        let data = req.body;

        let { questions, customerAnswer } = data;

        let orderStatus = await orderModel.findOneAndUpdate(
            { _id: orderId },
            { $set: { Status: "Cancelled" } },
            { new: true }
        );

        await order.save();

        let cancelledReasonData = {
            questions,
            customerAnswer,
        };

        let newCancelledReason = await cancelledReasonModel.create(
            cancelledReasonData
        );

        let cancelledObj = {
            cancelledBy: req.body.cancelledBy,
            userId: req.body.userId,
            reason: newCancelledReason._id,
        };

        let orderStatusTableData = await orderStatusTableModel.create({
            order_id: order._id,
            status: "Cancelled",
            isCompleted: false,
            cancelled: cancelledObj,
        });

        return res.status(201).send({
            status: true,
            message: "Success",
            data: {
                OrderStatusTableData: orderStatusTableData,
                cancelledReasonData: newCancelledReason,
            },
        });
    } catch (error) {
        return res.status(500).send({ status: false, message: error.message });
    }
};

// GET ALL ORDER STATUS TABLES
const getAllOrderStatusTables = async (req, res) => {
    try {
        let allOrderStatusTables = await orderStatusTableModel.find();
        return res
            .status(200)
            .send({ status: true, data: allOrderStatusTables });
    } catch (error) {
        return res.status(500).send({ status: false, message: error.message });
    }
};

// GET ORDER STATUS TABLE BY ID
const getOrderStatusTableById = async (req, res) => {
    try {
        let orderStatusTableId = req.params.orderStatusTableId;

        if (!isValidObjectId(orderStatusTableId)) {
            return res.status(400).send({
                status: false,
                message: "Invalid order status table id",
            });
        }

        let orderStatusTable = await orderStatusTableModel.findOne({
            _id: orderStatusTableId,
        });

        if (!orderStatusTable) {
            return res.status(404).send({
                status: false,
                message: "Order Status Table not found",
            });
        }

        return res.status(200).send({ status: true, data: orderStatusTable });
    } catch (error) {
        return res.status(500).send({ status: false, message: error.message });
    }
};

// UPDATE ORDER STATUS TABLE BY ORDER ID
const updateOrderStatusByOrderId = async (req, res) => {
    try {
        let orderId = req.params.orderId;
        let { status } = req.body;
        if (!isValidObjectId(orderId)) {
            return res
                .status(400)
                .send({ status: false, message: "Invalid order id" });
        }

        let orderStatusTable = await orderStatusTableModel.findOne({
            order_id: orderId,
        });

        if (!orderStatusTable) {
            return res.status(404).send({
                status: false,
                message: "Order status table not found",
            });
        }
        if (!status) {
            return res
                .status(400)
                .send({ status: false, message: "Bad request" });
        }
        orderStatusTable.status = status;

        let updatedByObj = {};
        if (req.userModel === "VENDOR") {
            updatedByObj.vendor = req.userId;
        } else if (req.userModel === "ADMIN") {
            updatedByObj.admin = req.userId;
        }
        let statusObj = {
            status: status,
            updatedBy: updatedByObj,
            updatedAt: new Date(),
        };
        orderStatusTable.statusList.push(statusObj);
        await orderStatusTable.save();
        return res
            .status(202)
            .send({ status: true, message: "Success", data: orderStatusTable });
    } catch (error) {
        return res.status(500).send({ status: false, message: error.message });
    }
};

module.exports = {
    createOrderStatusTable,
    getAllOrderStatusTables,
    getOrderStatusTableById,
    updateOrderStatusByOrderId,
};
