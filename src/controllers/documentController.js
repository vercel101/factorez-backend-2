const documentModel = require("../models/documentModel");

const { isValid } = require("../utils/utils");

// ADD DOCUMENT DETAILS
const addDocumentDetails = async (req, res) => {
  try {
    let data = req.body;

    let { business_certificate, gst_certificate } = data;

    if (!isValid(business_certificate)) {
      return res
        .status(400)
        .send({ status: false, message: "Business certificate url is required" });
    }

    if (!isValid(gst_certificate)) {
      return res
        .status(400)
        .send({ status: false, message: "GST certificate url is required" });
    }
    let documentData = {
        business_certificate, 
        gst_certificate, 
    };

    let document = await documentModel.create(documentData);

    return res
      .status(201)
      .send({ status: true, message: "success", data: document });
  } catch (error) {
    return res.status(500).send({ status: false, message: error.message });
  }
};

module.exports = { addDocumentDetails };