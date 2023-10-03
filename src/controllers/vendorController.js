const vendorModel = require("../models/vendorModel");
const bankModel = require("../models/bankModel");
const documentModel = require("../models/documentModel");
const { uploadFile } = require("./imageController");
const { generateRandomID, generateRandomAlphaNumericID } = require("../controllers/idGeneratorController");

const { isValid, isValidEmail, isValidMoblie, isValidGST } = require("../utils/utils");
const { roleEnums } = require("../utils/enums");
const brandModel = require("../models/brandModel");
const bcrypt = require("bcrypt");

// ADD VENDOR
const addVendor = async (req, res) => {
    try {
        let data = req.body;
        let {
            firmName,
            brandName,
            gstNo,
            representativeName,
            emailId,
            password,
            mobileNo,
            altMobileNo,
            pickupState,
            pickupCity,
            pickupPincode,
            invoiceAddress,
            pickupAddress,
            acHolderName,
            acNo,
            bankName,
            branch,
            ifsc,
            termsAndConditions,
        } = data;
        if (password) {
            password = await bcrypt.hash(password, 10);
        }
        let isVendor = null;
        if (emailId) {
            isVendor = await vendorModel.findOne({ emailId: emailId });
        }
        if (mobileNo) {
            let x = await vendorModel.findOne({ mobileNo: mobileNo });
            if (x) {
                return res.status(400).send({ message: "Mobile number already exists", status: false });
            }
        }
        if (isVendor) {
            return res.status(400).send({ message: "Email id already exists", status: false });
        }

        let documentData = {};
        if (req.files && req.files.gstRegDoc) {
            documentData.gstRegDoc = await uploadFile(req.files.gstRegDoc);
        }
        if (req.files && req.files.brandRegDoc) {
            documentData.brandRegDoc = await uploadFile(req.files.brandRegDoc);
        }

        let bankData = {
            acHolderName: acHolderName,
            acNo: acNo,
            bankName: bankName,
            branch: branch,
            ifsc: ifsc,
        };
        if (req.files && req.files.cancelledCheque) {
            bankData.cancelledCheque = await uploadFile(req.files.cancelledCheque);
        }
        let brandData = {
            brand_name: brandName,
        };
        if (req.files && req.files.brandLogo) {
            brandData.brandLogo = await uploadFile(req.files.brandLogo);
        }
        let vendorData = {};
        if (firmName) {
            vendorData.firmName = firmName;
        }
        if (gstNo) {
            vendorData.gstNo = gstNo;
        }
        if (representativeName) {
            vendorData.representativeName = representativeName;
        }
        if (emailId) {
            vendorData.emailId = emailId;
        }
        if (password) {
            vendorData.password = password;
        }
        if (mobileNo) {
            vendorData.mobileNo = mobileNo;
        }
        if (altMobileNo) {
            vendorData.altMobileNo = altMobileNo;
        }
        if (pickupState) {
            vendorData.pickupState = pickupState;
        }
        if (pickupCity) {
            vendorData.pickupCity = pickupCity;
        }
        if (pickupPincode) {
            vendorData.pickupPincode = pickupPincode;
        }
        if (invoiceAddress) {
            vendorData.invoiceAddress = invoiceAddress;
        }
        if (termsAndConditions) {
            vendorData.termsAndConditions = termsAndConditions;
        }
        if (pickupAddress) {
            vendorData.pickupAddress = pickupAddress;
        }
        let brand = null;
        if (brandData.brand_name) {
            brand = await brandModel.create(brandData);
            vendorData.brand_id = brand;
        }
        if (bankData.acNo && bankData.acHolderName) {
            let bank = await bankModel.create(bankData);
            vendorData.bank_id = bank;
        }
        if (documentData.gstRegDoc || documentData.brandRegDoc) {
            let document = await documentModel.create(documentData);
            vendorData.document_id = document;
        }

        vendorData.vendor_unique_id = generateRandomID(10);
        vendorData.auth_unique_id = generateRandomID(10);
        vendorData.db_unique_id = generateRandomAlphaNumericID(20);
        vendorData.sharing_unique_id = generateRandomAlphaNumericID(20);
        vendorData.role = ["VENDOR"];

        let vendor = await vendorModel.create(vendorData);
        if (brand) {
            brand.vendor_id = vendor;
            await brand.save();
        }
        return res.status(201).send({ status: true, message: "You have successfully registered" });
    } catch (error) {
        return res.status(500).send({ status: false, message: error.message });
    }
};

const createVendorByAdmin = async (req, res) => {
    try {
        let data = req.body;
        let adminId = req.userId;
        let model = req.userModel;
        let {
            firmName,
            brandName,
            gstNo,
            representativeName,
            emailId,
            password,
            mobileNo,
            altMobileNo,
            pickupState,
            pickupCity,
            pickupPincode,
            invoiceAddress,
            pickupAddress,
            acHolderName,
            acNo,
            bankName,
            branch,
            ifsc,
        } = data;
        if (password === "") {
            return res.status(400).send({ message: "Password is required", status: false });
        }
        let isVendor = await vendorModel.findOne({ emailId: emailId });
        if (isVendor) {
            return res.status(400).send({ message: "Email id already exists", status: false });
        }
        password = await bcrypt.hash(password, 10);
        // console.log(data);
        let gstRegDoc = await uploadFile(req.files.gstRegDoc);
        let brandLogo = await uploadFile(req.files.brandLogo);
        let brandRegDoc = await uploadFile(req.files.brandRegDoc);
        let cancelledCheque = await uploadFile(req.files.cancelledCheque);
        let documentData = {
            brandRegDoc: brandRegDoc,
            gstRegDoc: gstRegDoc,
            actionTakenBy: adminId,
        };

        let bankData = {
            acHolderName: acHolderName,
            acNo: acNo,
            bankName: bankName,
            branch: branch,
            ifsc: ifsc,
            cancelledCheque: cancelledCheque,
            actionTakenBy: adminId,
        };

        let brandData = {
            brand_name: brandName,
            brandLogo: brandLogo,
            brandStatus: "Approved",
        };
        let vendorData = {
            firmName,
            gstNo,
            representativeName,
            emailId,
            password,
            mobileNo,
            altMobileNo,
            pickupState,
            pickupCity,
            pickupPincode,
            invoiceAddress,
            pickupAddress,
            termsAndConditions: true,
        };
        let document = await documentModel.create(documentData);
        let bank = await bankModel.create(bankData);
        let brand = await brandModel.create(brandData);
        vendorData.bank_id = bank;
        vendorData.document_id = document;
        vendorData.brand_id = brand;
        vendorData.vendor_unique_id = generateRandomID(10);
        vendorData.auth_unique_id = generateRandomID(10);
        vendorData.db_unique_id = generateRandomAlphaNumericID(20);
        vendorData.sharing_unique_id = generateRandomAlphaNumericID(20);
        vendorData.role = ["VENDOR"];
        vendorData.actionTakenBy = adminId;
        vendorData.status = "Approved";
        vendorData.basicInfoStatus = "Approved";
        let vendor = await vendorModel.create(vendorData);
        brand.vendor_id = vendor;
        await brand.save();
        return res.status(201).send({ status: true, message: "Success" });
    } catch (error) {
        return res.status(500).send({ status: false, message: error.message });
    }
};

const getAllVendors = async (req, res) => {
    try {
        let vendors = await vendorModel.find({ isDeleted: false }).populate(["bank_id", "document_id", "actionTakenBy", "brand_id"]);
        return res.status(201).send({ status: true, message: "Success", data: vendors });
    } catch (error) {
        return res.status(500).send({ status: false, message: error.message });
    }
};

const updateVendor = async (req, res) => {
    try {
        let {
            firmName,
            gstNo,
            representativeName,
            emailId,
            password,
            mobileNo,
            altMobileNo,
            pickupState,
            pickupCity,
            pickupPincode,
            invoiceAddress,
            pickupAddress,
            brand_id,
            brand_name,
            bank_id,
            acHolderName,
            acNo,
            bankName,
            branch,
            ifsc,
        } = req.body;
        let vendorObjId = req.params.vendorId;
        let vendor = await vendorModel.findById(vendorObjId).populate(["bank_id", "document_id", "brand_id"]);
        if (firmName) {
            vendor.firmName = firmName;
        }
        if (gstNo) {
            vendor.gstNo = gstNo;
        }
        if (representativeName) {
            vendor.representativeName = representativeName;
        }
        if (emailId) {
            vendor.emailId = emailId;
        }
        if (password) {
            vendor.password = await bcrypt.hash(password, 10);
        }
        if (mobileNo) {
            vendor.mobileNo = mobileNo;
        }
        if (altMobileNo) {
            vendor.altMobileNo = altMobileNo;
        }
        if (pickupState) {
            vendor.pickupState = pickupState;
        }
        if (pickupState) {
            vendor.pickupState = pickupState;
        }
        if (pickupCity) {
            vendor.pickupCity = pickupCity;
        }
        if (pickupPincode) {
            vendor.pickupPincode = pickupPincode;
        }
        if (invoiceAddress) {
            vendor.invoiceAddress = invoiceAddress;
        }
        if (pickupAddress) {
            vendor.pickupAddress = pickupAddress;
        }
        if (brand_id) {
            for (let brandX of vendor.brand_id) {
                console.log(brandX);
                if (brandX._id.toString() === brand_id) {
                    brandX.brand_name = brand_name;
                    await brandX.save();
                }
            }
        }
        if (acHolderName && acNo) {
            if (!bank_id) {
                let bank = await bankModel.create({ acNo, acHolderName });
                if (bankName) {
                    bank.bankName = bankName;
                }
                if (branch) {
                    bank.branch = branch;
                }
                if (ifsc) {
                    bank.ifsc = ifsc;
                }
                vendor.bank_id = bank._id;
                await bank.save();
            } else {
                if (bankName) {
                    vendor.bank_id.bankName = bankName;
                }
                if (acHolderName) {
                    vendor.bank_id.acHolderName = acHolderName;
                }
                if (acNo) {
                    vendor.bank_id.acNo = acNo;
                }
                if (branch) {
                    vendor.bank_id.branch = branch;
                }
                if (ifsc) {
                    vendor.bank_id.ifsc = ifsc;
                }
                await vendor.bank_id.save();
            }
        }
        if (bank_id) {
            if (bankName) {
                vendor.bank_id.bankName = bankName;
            }
            if (acHolderName) {
                vendor.bank_id.acHolderName = acHolderName;
            }
            if (acNo) {
                vendor.bank_id.acNo = acNo;
            }
            if (branch) {
                vendor.bank_id.branch = branch;
            }
            if (ifsc) {
                vendor.bank_id.ifsc = ifsc;
            }
            await vendor.bank_id.save();
        }

        if (req.files) {
            let { cancelledCheque, gstRegDoc, brandRegDoc } = req.files;
            if (cancelledCheque) {
                vendor.bank_id.cancelledCheque = await uploadFile(cancelledCheque);
            }
            if (gstRegDoc) {
                vendor.document_id.gstRegDoc = await uploadFile(gstRegDoc);
            }
            if (brandRegDoc) {
                vendor.document_id.brandRegDoc = await uploadFile(brandRegDoc);
            }
            await vendor.document_id.save();
        }
        await vendor.save();
        res.status(201).send({ status: true, message: "successfully", data: vendor });
    } catch (error) {
        return res.status(500).send({ status: false, message: error.message });
    }
};

module.exports = { getAllVendors, addVendor, createVendorByAdmin, updateVendor };
