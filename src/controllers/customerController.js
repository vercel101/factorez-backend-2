const customerModel = require("../models/customerModel");
const cartModel = require("../models/cartModel");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { isValid, isValidMoblie, isValidEmail, isValidPassword } = require("../utils/utils");
const { customerTokenSecretKey } = require("../middlewares/config");
const { isValidObjectId } = require("mongoose");
const customerAddressModel = require("../models/customerAddressModel");

const loginUser = async (req, res) => {
    try {
        let { phone, password } = req.body;

        if (!phone || !password) {
            return res.status(400).send({ status: false, message: "Bad request" });
        }

        let customer = await customerModel.findOne({ phone: phone, isDeleted: false }).populate("cart_id");

        if (!customer) {
            return res.status(404).send({ status: false, message: "Account not found this mobile number, you have to register first" });
        }
        if (customer.isBlocked) {
            return res.status(403).send({ status: false, message: "This account has been blocked, Please Contact us!" });
        }
        // if (!customer.isActivated) {
        //     return res.status(200).send({ status: true, message: "Account is not active, Please fill your information" });
        // }
        bcrypt.compare(password, customer.password, function (err, result) {
            if (err) {
                return res.status(400).send({ status: false, message: err.message });
            }
            hasAccess(result);
        });

        function hasAccess(result) {
            if (result) {
                let date = Date.now();
                let data = {
                    name: customer.name,
                    email: customer.email,
                    customerId: customer._id.toString(),
                    userType: "CUSTOMER",
                    isActivated: customer.isActivated,
                    phone: customer.phone,
                    cartLength: customer.cart_id.products.length,
                };
                if (customer.profileUrl) data.photo = customer.profileUrl;
                if (customer.alternate_phone) data.altMobileNo = customer.alternate_phone;
                if (customer.gstNo) data.gstNo = customer.gstNo;
                if (customer.defaultAddress) data.defaultAddressId = customer.defaultAddress._id.toString();
                let issueTime = Math.floor(date / 1000);
                let token = jwt.sign(
                    {
                        userId: customer._id.toString(),
                        phone: customer.phone,
                        userModel: "CUSTOMER",
                        iat: issueTime,
                    },
                    customerTokenSecretKey,
                    { expiresIn: "24h" }
                );
                data.token = token;
                res.setHeader("Authorization", "Bearer " + token);
                return res.status(200).send({
                    status: true,
                    message: "Login successfully",
                    data: data,
                });
            } else {
                return res.status(401).send({ status: false, message: "Login denied" });
            }
        }
    } catch (error) {
        return res.status(500).send({ status: false, message: error.message });
    }
};

// GET ALL CUSTOMERS
const getAllCustomer = async (req, res) => {
    try {
        let customers = await customerModel.find({ isDeleted: false }).populate("defaultAddress");
        return res.status(200).send({ status: true, data: customers });
    } catch (error) {
        return res.status(500).send({ status: false, message: error.message });
    }
};

// GET CUSTOMER BY CUSTOMER ID
const getCustomerById = async (req, res) => {
    try {
        let customerId = req.params.customerId;
        let customer = await customerModel.findOne({ _id: customerId });
        if (!customer) {
            return res.status(404).send({ status: false, message: "Customer not found" });
        }
        return res.status(200).send({ status: true, data: customer });
    } catch (error) {
        return res.status(500).send({ status: false, message: error.message });
    }
};

// UPDATE CUSTOMER BY CUSTOMER ID
const updateCustomerById = async (req, res) => {
    try {
        let customerId = req.params.customerId;
        if (!isValidObjectId(customerId)) {
            return res.status(400).send({ status: false, message: "Invalid Customer id" });
        }
        let customer = await customerModel.findById(customerId);
        if (!customer) {
            return res.status(404).send({ status: false, message: "Customer not found" });
        }
        let { name, gstNo, alternate_phone, email, password } = req.body;
        if (!name && !gstNo && alternate_phone && email && password) {
            return res.status(400).send({ status: false, message: "At least one field is require to update your information" });
        }
        if (name) {
            customer.name = name;
        }
        if (gstNo) {
            customer.gstNo = gstNo;
        }
        if (alternate_phone) {
            customer.alternate_phone = alternate_phone;
        }
        if (email) {
            customer.email = email;
        }
        if (password) {
            let hashedPassword = await bcrypt.hash(password, 10);
            customer.password = hashedPassword;
        }
        await customer.save();

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
        return res.status(200).send({
            status: true,
            message: "Customer updated successfully",
            data: data,
        });
    } catch (error) {
        return res.status(500).send({ status: false, message: error.message });
    }
};

// DELETE CUSTOMER BY CUSTOMER ID
const deleteCustomerById = async (req, res) => {
    try {
        let customerId = req.params.customerId;
        let customer = await customerModel.findOne({ _id: customerId });

        if (!customer) {
            return res.status(404).send({ status: false, message: "Customer not found" });
        }
        customer.isDeleted = true;
        // customer.isNew = true;
        await customer.save();
        return res.status(200).send({ status: true, message: "Customer deleted successfully" });
    } catch (error) {
        return res.status(500).send({ status: false, message: error.message });
    }
};

const blockCustomerById = async (req, res) => {
    try {
        let customerId = req.params.customerId;
        let customer = await customerModel.findOne({ _id: customerId });
        if (!customer) {
            return res.status(404).send({ status: false, message: "Customer not found" });
        }
        customer.isBlocked = !customer.isBlocked;
        await customer.save();
        let message = customer.isBlocked ? "Customer has been blocked" : "Customer is now Active";
        return res.status(202).send({ status: true, message: message });
    } catch (error) {
        return res.status(500).send({ status: false, message: error.message });
    }
};

const findOrdersByPhone = async (req, res) => {
    try {
        let { userPhone } = req.body;
        let customer = await customerModel.findOne({ phone: userPhone }).populate({
            path: "orders",
            model: "Order",
            populate: [
                { path: "vendorId", model: "Vendor" },
                { path: "order_status_id", model: "Order_Status_Table" },
                { path: "ordered_products", model: "Ordered_Product" },
            ],
        });
        if (!customer) {
            return res.status(404).send({ status: false, message: "Customer not found" });
        }
        let orders = customer.orders;
        return res.status(200).send({ status: true, message: "Order fetch successfully", data: orders });
    } catch (error) {
        return res.status(500).send({ status: false, message: error.message });
    }
};

const setDefaultAddress = async (req, res) => {
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
        if (!address) {
            return res.status(404).send({ status: false, message: "Address not found with this id" });
        }
        if (!customer) {
            return res.status(404).send({ status: false, message: "Customer not found with this id" });
        }
        customer.defaultAddress = address._id;
        await customer.save();
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
        return res.status(200).send({ status: true, data: data, message: "Default address updated" });
    } catch (error) {
        return res.status(500).send({ status: false, message: error.message });
    }
};

module.exports = {
    loginUser,
    getAllCustomer,
    getCustomerById,
    updateCustomerById,
    deleteCustomerById,
    blockCustomerById,
    findOrdersByPhone,
    setDefaultAddress,
};
