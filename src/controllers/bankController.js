const bankModel = require("../models/bankModel");

const { isValid } = require("../utils/utils");

// ADD BANK DETAILS
const addBankDetails = async (req, res) => {
  try {
    let data = req.body;
    let {
      account_holder_name,
      account_number,
      bank_name,
      branch,
      IFSC_code,
    } = data;

    if (!isValid(account_holder_name)) {
      return res
        .status(400)
        .send({ status: false, message: "Account holder name is required" });
    }

    if (!isValid(account_number)) {
      return res
        .status(400)
        .send({ status: false, message: "Account number is required" });
    }

    if (!isValid(bank_name)) {
      return res
        .status(400)
        .send({ status: false, message: "Bank name is required" });
    }

    if (!isValid(branch)) {
      return res
        .status(400)
        .send({ status: false, message: "Branch name is required" });
    }

    if (!isValid(IFSC_code)) {
      return res
        .status(400)
        .send({ status: false, message: "IFSC code is required" });
    }

  

    let bankDetails = {
      account_holder_name,
      account_number,
      bank_name,
      branch,
      IFSC_code,
    };

    let bankData = await bankModel.create(bankDetails);
    return res
      .status(201)
      .send({ status: true, message: "success", data: bankData });
  } catch (error) {
    return res.status(500).send({ status: false, message: error.message });
  }
};

module.exports = { addBankDetails }