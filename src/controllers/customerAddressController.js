const { isValidObjectId } = require("mongoose");
const customerAddressModel = require("../models/customerAddressModel");
const customerModel = require("../models/customerModel");
const { isValidRequestBody, isValid } = require("../utils/utils");
const { stateAndCode } = require("../utils/stateNameAndCode");
const cartModel = require("../models/cartModel");
const bcrypt = require("bcrypt");
// ADD ADDRESS
const addCustomerInformation = async (req, res) => {
    try {
        let data = req.body;
        let customerId = req.params.customerid;
        let { name, alternate_phone, gstNo, email, pincode, password, address, state, city } = data;

        if (!isValid(customerId)) {
            return res.status(400).send({ status: false, message: "Bad request" });
        }
        if (!isValidObjectId(customerId)) {
            return res.status(400).send({ status: false, message: "Bad request" });
        }
        if (!state || !name || !pincode || !city || !password || !address) {
            return res.status(400).send({ status: false, message: "Please provide all required fields" });
        }
        let addressData = {
            customerId,
            address,
            state,
            pincode,
            city,
        };
        if (Object.keys(stateAndCode).includes(state)) {
            addressData.stateCode = stateAndCode[state];
        } else {
            return res.status(400).send({ status: false, message: "Invalid State" });
        }

        let customer = await customerModel.findOne({ _id: customerId, isDeleted: false, isBlocked: false });
        if (!customer) {
            return res.status(400).send({ status: false, message: "Bad request" });
        }

        let hashedPassword = await bcrypt.hash(password, 10);
        customer.name = name;
        customer.password = hashedPassword;
        if (gstNo) {
            customer.gstNo = gstNo;
        }
        if (alternate_phone) {
            customer.alternate_phone = alternate_phone;
        }
        if (email) {
            customer.email = email;
        }

        if (customer.isActivated === true) {
            return res.status(400).send({ status: false, message: "Account is already active" });
        }

        let cart = await cartModel.create({ customer_id: customer._id });
        if (!cart) {
            return res.status(500).send({ status: false, message: "Internal Server Error" });
        }
        customer.cart_id = cart;
        customer.isActivated = true;
        addressData.customerId = customer;
        let newAddress = await customerAddressModel.create(addressData);
        customer.defaultAddress = newAddress._id;
        await customer.save();
        return res.status(201).send({ status: true, message: "Successfully registered" });
    } catch (error) {
        return res.status(500).send({ status: false, message: error.message });
    }
};

// GET ALL ADDRESSES BY CUSTOMER ID
const getAllAddresses = async (req, res) => {
    try {
        let customerId = req.params.customerId;
        if (!customerId) {
            return res.status(400).send({ status: false, message: "Customer id is required in params" });
        }
        let address = await customerAddressModel.find({ customerId: customerId, isDeleted: false });
        return res.status(200).send({ status: true, data: address });
    } catch (error) {
        return res.status(500).send({ status: false, message: error.message });
    }
};

// UPDATE ADDRESS BY CUSTOMER ID
const updateAddressByCustomerId = async (req, res) => {
    try {
        let customerId = req.params.customerId;
        if (!customerId) {
            return res.status(400).send({
                status: false,
                message: "Please provide the customerId in params",
            });
        }
        let customer = await customerAddressModel.findOne({
            customerId: customerId,
        });
        if (!customer) {
            return res.status(404).send({ status: false, message: "Customer not found" });
        }

        let body = req.body;

        if (!isValidRequestBody(body)) {
            return res.status(400).send({ status: false, message: "Please enter data in body" });
        }

        if ("address" in body) {
            for (let i = 0; i < customer.address.length; i++) {
                customer.address[i] = body.address[i];
            }
        }
        await customer.save();

        return res.status(200).send({
            status: true,
            message: "Address updated successfully",
            data: customer,
        });
    } catch (error) {
        return res.status(500).send({ status: false, message: error.message });
    }
};

// DELETE CUSTOMER ADDRESS BY CUSTOMER ID
const deleteAddressById = async (req, res) => {
    try {
        let customerId = req.params.customerId;
        let addressId = req.params.addressId;
        if (!isValidObjectId(customerId)) {
            return res.status(400).send({ status: false, message: "Invalid Customer id" });
        }
        if (!isValidObjectId(addressId)) {
            return res.status(400).send({ status: false, message: "Invalid address id" });
        }
        let address = await customerAddressModel.findById(addressId);
        let customer = await customerModel.findById(customerId);
        if (!customer) {
            return res.status(404).send({ status: false, message: "customer not found with this id" });
        }
        if (!address) {
            return res.status(404).send({ status: false, message: "address not found with this id" });
        }
        address.isDeleted = true;
        await address.save();
        if (customer.defaultAddress.toString() === addressId) {
            customer.defaultAddress = undefined;
            customer.save();
        }
        let data = {
            name: customer.name,
            email: customer.email,
            customerId: customer._id.toString(),
            userType: "CUSTOMER",
            isActivated: customer.isActivated,
            phone: customer.phone,
        };
        if (customer.profileUrl) data.photo = customer.profileUrl;
        if (customer.alternate_phone) data.altMobileNo = customer.alternate_phone;
        if (customer.gstNo) data.gstNo = customer.gstNo;
        if (customer.defaultAddress) data.defaultAddressId = customer.defaultAddress._id.toString();
        return res.status(200).send({ status: true, data: data, message: "Address deleted successfully" });
    } catch (error) {
        return res.status(500).send({ status: false, message: error.message });
    }
};

const addAddress = async (req, res) => {
    try {
        let { address, state, city, pincode, stateCode } = req.body;
        let customerId = req.params.customerId;
        if (!isValidObjectId(customerId)) {
            return res.status(400).send({ status: false, message: "Bad request" });
        }
        if (!address || !state || !city || !pincode || !stateCode) {
            return res.status(400).send({ status: false, message: "All fields are requited" });
        }
        let customer = await customerModel.findById(customerId);
        if (!customer) {
            return res.status(400).send({ status: false, message: "Customer not found" });
        }
        let addressObj = await customerAddressModel.create({ customerId, address, state, city, pincode, stateCode });

        return res.status(201).send({ status: true, message: "Address created" });
    } catch (error) {
        return res.status(500).send({ status: false, message: error.message });
    }
};
module.exports = {
    addCustomerInformation,
    getAllAddresses,
    updateAddressByCustomerId,
    deleteAddressById,
    addAddress,
};
