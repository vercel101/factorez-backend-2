const jwt = require("jsonwebtoken");
const { twilioAccSID, twilioAuthToken, twilioVerifySID, tokenSecretKey, customerTokenSecretKey } = require("../middlewares/config");
const customerModel = require("../models/customerModel");
const bcrypt = require("bcrypt");
const accountSid = twilioAccSID;
const authToken = twilioAuthToken;
const verifySid = twilioVerifySID;
const client = require("twilio")(accountSid, authToken);

const sendOTP = async (req, res) => {
    try {
        let phone = req.params.phone;
        // console.log(req.params);
        if (!phone) {
            return res.status(400).send({ status: false, message: "phone number are required" });
        }
        // console.log(phone);
        let isSent = false;
        await client.verify.v2
            .services(verifySid)
            .verifications.create({ to: `+91${phone}`, channel: "sms" })
            .then((verification) => {
                isSent = true;
            })
            .catch((err) => {
                console.log(err);
            });
        if (isSent) {
            return res.status(200).send({ status: true, message: "OTP send successfully" });
        } else {
            return res.status(400).send({ status: false, message: "Otp not send" });
        }
    } catch (error) {
        return res.status(500).send({ status: false, message: error.message });
    }
};

const createAccountAndToken = async (phone) => {
    try {
        let customer = await customerModel.findOne({ phone: phone, isDeleted: false });

        if (!customer) {
            customer = await customerModel.create({ phone });
        }
        if (customer.isBlocked) {
            return { statusCode: 403, status: false, message: "This account has been blocked" };
        }
        if (!customer.isActivated) {
            return { statusCode: 200, status: true, isActivated: false, data: { customerId: customer._id }, message: "Account is not active, Please fill your information" };
        }
        let data = {
            name: customer.name,
            email: customer.email,
            userType: "CUSTOMER",
            customerId: customer._id.toString(),
            phone: customer.phone,
            isActivated: customer.isActivated,
        };
        if (customer.profileUrl) data.photo = customer.profileUrl;
        if (customer.alternate_phone) data.altMobileNo = customer.alternate_phone;

        let date = Date.now();
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
        return { statusCode: 200, status: true, message: "Login successfully", data: data };
    } catch (error) {
        return { statusCode: 500, status: false, message: "something went wrong" };
    }
};

const updatePassword = async (phone, password) => {
    try {
        let customer = await customerModel.findOne({ phone: phone, isDeleted: false });
        if (!customer) {
            customer = await customerModel.create({ phone });
        }
        if (customer.isBlocked) {
            return { statusCode: 403, status: false, message: "This account has been blocked" };
        }
        if (!customer.isActivated) {
            return { statusCode: 200, status: true, isActivated: false, data: { customerId: customer._id }, message: "Account is not active, Please fill your information" };
        }
        let hashedPassword = await bcrypt.hash(password, 10);
        customer.password = hashedPassword;

        await customer.save();
        return { statusCode: 200, status: true, message: "Password updated successfully" };
    } catch (error) {
        return { statusCode: 500, status: false, message: "something went wrong" };
    }
};

const verityOTP = async (req, res) => {
    try {
        let phone = req.params.phone;
        let otpCode = req.params.otpCode;
        if (!phone || !otpCode) {
            return res.status(400).send({ status: false, message: "phone number and otp are required" });
        }
        let isValid = false;
        await client.verify.v2
            .services(verifySid)
            .verificationChecks.create({ to: `+91${phone}`, code: otpCode })
            .then((verification_check) => {
                // console.log("verification_check.status", verification_check.status);
                // console.log("verification_check", verification_check);
                if (verification_check.status === "approved" || verification_check.valid === true) {
                    isValid = true;
                }
            })
            .catch((err) => {});
        if (isValid) {
            let resAcc = await createAccountAndToken(phone);
            // console.log(resAcc);
            if (resAcc.statusCode === 403) {
                return res.status(403).send({ status: false, message: resAcc.message });
            } else if (resAcc.statusCode === 200 && resAcc.isActivated) {
                res.setHeader("Authorization", "Bearer " + resAcc.data.token);
                return res.status(200).send({ status: true, isActivated: true, message: resAcc.message, data: resAcc.data });
            } else if (resAcc.statusCode === 200 && !resAcc.isActivated) {
                return res.status(200).send({ status: true, isActivated: false, message: resAcc.message, data: resAcc.data });
            } else if (resAcc.statusCode === 500) {
                return res.status(500).send({ status: false, message: resAcc.message });
            } else {
                return res.status(400).send({ status: false, message: "Something went wrong..." });
            }
        } else {
            return res.status(403).send({ status: false, message: "otp not verified" });
        }
    } catch (error) {
        return res.status(500).send({ status: false, message: error.message });
    }
};

const forgetPasswordUsingOtp = async (req, res) => {
    try {
        let phone = req.params.phone;
        let otpCode = req.params.otpCode;
        let { password } = req.body;

        if (!phone || !otpCode || !password) {
            return res.status(400).send({ status: false, message: "Phone number, password and otp are required" });
        }

        let isValid = false;
        await client.verify.v2
            .services(verifySid)
            .verificationChecks.create({ to: `+91${phone}`, code: otpCode })
            .then((verification_check) => {
                if (verification_check.status === "approved" || verification_check.valid === true) {
                    isValid = true;
                }
            })
            .catch((err) => {});
        if (isValid) {
            let resAcc = await updatePassword(phone, password);
            return res.status(resAcc.statusCode).send({ status: resAcc.status, message: resAcc.message });
        } else {
            return res.status(403).send({ status: false, message: "OTP not verified" });
        }
    } catch (error) {
        return res.status(500).send({ status: false, message: error.message });
    }
};

module.exports = { sendOTP, verityOTP, forgetPasswordUsingOtp };
