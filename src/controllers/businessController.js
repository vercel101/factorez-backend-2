const businessModel = require("../models/businessModel");
const { isValid } = require("../utils/utils");
const { uploadFile } = require("./imageController");

// ADD BUSINESS DETAILS
const addBusinessInfo = async (req, res) => {
    try {
        let { bName, bEmail, bNumber } = req.body;

        if (!bName || !bEmail || !bNumber) {
            return res.status(400).send({ status: false, message: "All fields are required" });
        }

        let businessData = {
            business_name: bName,
            contactNo: bNumber,
            contactEmail: bEmail,
        };
        console.log(businessData);
        let businessExists = await businessModel.find();
        console.log(businessExists);
        if (businessExists.length > 0) {
            businessExists[0].business_name = bName;
            businessExists[0].contactNo = bNumber;
            businessExists[0].contactEmail = bEmail;
            await businessExists[0].save();
        } else {
            await businessModel.create(businessData);
        }
        return res.status(201).send({ status: true, message: "Success", data: "business" });
    } catch (error) {
        return res.status(500).send({ status: false, message: error.message });
    }
};

const addBusinessGST = async (req, res) => {
    try {
        let { gsts } = req.body;
        if (!gsts || gsts.length === 0) {
            return res.status(400).send({ status: false, message: "Add GST" });
        }

        let businessExists = await businessModel.find();
        if (businessExists.length === 0) {
            return res.status(400).send({ status: false, message: "Add business Name and other fields then add GST" });
        }
        businessExists[0].gsts = gsts;
        businessExists[0].defaultGST = {};
        await businessExists[0].save();
        return res.status(201).send({ status: true, message: "GST updated to business" });
    } catch (error) {
        return res.status(500).send({ status: false, message: error.message });
    }
};
const addBusinessFiles = async (req, res) => {
    try {
        let { bLogo, bInvLogo, bPolicy, bTC } = req.files;
        let business = await businessModel.find();
        if (bLogo) {
            business[0].business_Logo = await uploadFile(bLogo);
        }
        if (bInvLogo) {
            business[0].invoiceLogo = await uploadFile(bInvLogo);
        }
        if (bPolicy) {
            business[0].privacyPolicy = await uploadFile(bPolicy);
        }
        if (bTC) {
            business[0].iAgree = await uploadFile(bTC);
        }
        await business[0].save();
        return res.status(201).send({ status: true, message: "Success", data: "business" });
    } catch (error) {
        return res.status(500).send({ status: false, message: error.message });
    }
};

const getBusinessInfo = async (req, res) => {
    try {
        let business = await businessModel.find();
        if (business.length === 0) {
            return res.status(400).send({ status: false, message: "No record available" });
        }
        return res.status(200).send({ status: true, message: "Record fetched...", data: business[0] });
    } catch (error) {
        return res.status(500).send({ status: false, message: error.message });
    }
};

const setDefaultGst = async (req, res) => {
    try {
        let { gst } = req.body;
        let business = await businessModel.find();
        if (business.length === 0) {
            return res.status(400).send({ status: false, message: "No record available" });
        }

        for (let gstd of business[0].gsts) {
            console.log(gstd);
            if (gstd.gstNo === gst) {
                business[0].defaultGST.gstNo = gstd.gstNo;
                business[0].defaultGST.pickupAddress = gstd.pickupAddress;
                business[0].defaultGST.stateCode = gstd.stateCode;
            }
        }
        await business[0].save();
        console.log(req.body);
        return res.status(200).send({ status: true, message: "Default gst updated..." });
    } catch (error) {
        return res.status(500).send({ status: false, message: error.message });
    }
};

const saveSocialMedia = async (req, res) => {
    try {
        let { facebook, instagram, twitter, youtube, linkedin } = req.body;
        let business = await businessModel.find();
        if (business.length === 0) {
            return res.status(400).send({ status: false, message: "No record available" });
        }
        if (facebook) {
            business[0].socialMedia.facebook = facebook;
        }
        if (instagram) {
            business[0].socialMedia.instagram = instagram;
        }
        if (twitter) {
            business[0].socialMedia.twitter = twitter;
        }
        if (youtube) {
            business[0].socialMedia.youtube = youtube;
        }
        if (linkedin) {
            business[0].socialMedia.linkedin = linkedin;
        }
        await business[0].save();
        return res.status(200).send({ status: true, message: "Social media links added" });
    } catch (error) {
        return res.status(500).send({ status: false, message: error.message });
    }
};

module.exports = {
    addBusinessInfo,
    addBusinessGST,
    getBusinessInfo,
    addBusinessFiles,
    setDefaultGst,
    saveSocialMedia,
};
