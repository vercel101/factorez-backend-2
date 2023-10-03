const cancelledReasonModel = require("../models/cancelledReasonModel");
const questionModel = require("../models/questionModel");
const orderModel = require("../models/orderModel");
const { isValidObjectId } = require("mongoose");

// CANCEL ORDER BY ORDER ID
const addCancelledReason = async (req, res) => {
  try {
    
    let data = req.body;

    let { questions, customerAnswer } = data;

    let cancelledReasonData = {
      questions,
      customerAnswer,
    };

    let newCancelledReason = await cancelledReasonModel.create(
      cancelledReasonData
    );

    return res
      .status(201)
      .send({ status: true, message: "Success", data: newCancelledReason });
  } catch (error) {
    return res.status(500).send({ status: false, message: error.message });
  }
};

module.exports = { addCancelledReason }