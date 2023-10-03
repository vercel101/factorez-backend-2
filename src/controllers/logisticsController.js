const logisticsModel = require("../models/logisticsModel");
const { isValid, isValidPin } = require("../utils/utils");

// ADD LOGISTICS DETAILS
const addLogisticsDetails = async (req, res) => {
  try {
    let data = req.body;
    let { pincode, zone, city, state, COD, prepaid, reverse } = data;

    if (!isValid(pincode)) {
      return res
        .status(400)
        .send({ status: false, message: "Pin code is required" });
    }

    // if (!isValidPin(pincode)) {
    //   return res
    //     .status(400)
    //     .send({
    //       status: false,
    //       message: "Invalid pin code, please enter a valid pin",
    //     });
    // }

    if (!isValid(zone)) {
      return res
        .status(400)
        .send({ status: false, message: "zone is required" });
    }

    if (!isValid(city)) {
      return res
        .status(400)
        .send({ status: false, message: "city is required" });
    }

    if (!isValid(state)) {
      return res
        .status(400)
        .send({ status: false, message: "state is required" });
    }

    if (!isValid(COD)) {
      return res
        .status(400)
        .send({ status: false, message: "COD option is required" });
    }

    let logisticsData = {
      pincode,
      zone,
      city,
      state,
      COD,
      prepaid,
      reverse,
    };

    let logistics = await logisticsModel.create(logisticsData);
    console.log(logistics)
    return res
      .status(201)
      .send({ status: true, message: "Success", data: logistics });
  } catch (error) {
    return res.status(500).send({ status: false, message: error.message });
  }
};

module.exports = { addLogisticsDetails };