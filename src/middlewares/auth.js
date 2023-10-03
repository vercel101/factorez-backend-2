const adminModel = require("../models/adminModel");
const vendorModel = require("../models/vendorModel");
const customerModel = require("../models/customerModel");
const jwt = require("jsonwebtoken");
const { tokenSecretKey, customerTokenSecretKey } = require("../middlewares/config");
const { isValidObjectId } = require("mongoose");

// AUTHENTICATION
const Authentication = async (req, res, next) => {
    try {
        let tokenWithBearer = req.headers.authorization;

        if (!tokenWithBearer) {
            return res.status(400).send({ status: false, message: "token is required" });
        }

        let tokenArray = tokenWithBearer.split(" ");

        let token = tokenArray[1];

        if (!token) {
            return res.status(401).send({ status: false, message: "Invalid token" });
        }

        jwt.verify(token, tokenSecretKey, function (err, decode) {
            if (err) {
                return res.status(400).send({ status: false, message: err.message });
            } else {
                req.userId = decode.userId;
                req.userModel = decode.userModel;
                req.userPhone = decode.phone ? decode.phone : ""; //'ADMIN': 'VENDOR'
                next();
            }
        });
    } catch (error) {
        return res.status(500).send({ status: false, message: error.message });
    }
};
const AuthenticationCustomer = async (req, res, next) => {
    try {
        let tokenWithBearer = req.headers.authorization;
        
        if (!tokenWithBearer) {
            return res.status(400).send({ status: false, message: "token is required" });
        }

        let tokenArray = tokenWithBearer.split(" ");

        let token = tokenArray[1];

        if (!token) {
            return res.status(401).send({ status: false, message: "Invalid token" });
        }

        jwt.verify(token, customerTokenSecretKey, function (err, decode) {
            if (err) {
                return res.status(400).send({ status: false, message: err.message });
            } else {
                req.userId = decode.userId;
                req.userModel = decode.userModel;
                req.userPhone = decode.phone ? decode.phone : ""; //'ADMIN': 'VENDOR':"CUSTOMER"
                next();
            }
        });
    } catch (error) {
        return res.status(500).send({ status: false, message: error.message });
    }
};

// AUTHORIZATION
const Authorization = async (req, res, next) => {
    try {
        let tokenId = req.userId;
        let UserId = req.params.userId;

        if (!isValidObjectId(UserId)) {
            return res.status(400).send({ status: false, message: "Invalid admin id" });
        }

        let admin = await adminModel.findById(UserId);

        if (!admin) {
            return res.status(404).send({ status: false, message: "Admin not found" });
        }

        let adminId = admin._id;

        if (adminId.toString() !== tokenId.toString()) {
            return res.status(403).send({ status: false, message: "authorization failed" });
        }
        next();
    } catch (error) {
        return res.status(500).send({ status: false, message: error.message });
    }
};

module.exports = { Authentication, Authorization, AuthenticationCustomer };
