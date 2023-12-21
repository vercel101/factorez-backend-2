const axios = require("axios");
const _ = require("lodash");
const bcrypt = require("bcrypt");
const otpModel = require("../models/otpModel");
const customerModel = require("../models/customerModel");

// GENERATE RANDOM NUMERIC ID OF GIVEN LENGTH
function generateRandomID(length) {
    let id = "";
    const digits = "0123456789";

    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * digits.length);
        id += digits[randomIndex];
    }
    return id;
}

// SEND OTP THROUGH KALEYRA SMS API
const sentOTP = async (req, res) => {
    try {
        let { mobile } = req.body;
        const apiKey = "A78cd4e6b7179e5439caac3c9f5f75b63";
        const sid = "HXIN1777665894IN";
        const type = "OTP";
        const senderId = "FCTREZ";
        // let to = 917042072054;
        let OTP = generateRandomID(4);
        const otpTemplateId = "1007482403267557324";
        // const { to, OTP } = req.body;
        // console.log("mobile: ", to);
        const body = `Your OTP Code for registration on factorez is ${OTP}. Thank you for Signup on FactorEz.com`;
        const smsData = {
            method: "POST",
            url: `https://api.kaleyra.io/v1/${sid}/messages`,
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                "api-key": apiKey,
            },
            data: `to=91${mobile}&type=${type}&sender=${senderId}&body=${body}&template_id=${otpTemplateId}`,
        };

        const response = await axios(smsData);
        // console.log("OTP SMS sent successfully!", response.data);

        let hashedOTP = await bcrypt.hash(OTP, 10);
        OTP = hashedOTP;

        let otp = await otpModel.findOne({ mobile: mobile });
        if (otp) {
            otp.otp = OTP;
        } else {
            otp = new otpModel({ mobile: mobile, otp: OTP });
        }

        await otp.save();
        return res.status(200).send({ status: true, message: "OTP sent successfully", data: response.data });
    } catch (error) {
        console.log("Error sending SMS:", error.message);
        return res.status(401).send({ status: false, message: error.message });
    }
};

const forgetOTP = async (req, res) => {
    try {
        let { mobile } = req.body;
        const apiKey = "A78cd4e6b7179e5439caac3c9f5f75b63";
        const sid = "HXIN1777665894IN";
        const type = "OTP";
        const senderId = "FCTREZ";
        // let to = 917042072054;
        let OTP = generateRandomID(4);
        const otpTemplateId = "1007051288684950055";

        const body = `OTP for reset your password on FactorEz is ${OTP} - factorez.com`;
        const smsData = {
            method: "POST",
            url: `https://api.kaleyra.io/v1/${sid}/messages`,
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                "api-key": apiKey,
            },
            data: `to=91${mobile}&type=${type}&sender=${senderId}&body=${body}&template_id=${otpTemplateId}`,
        };

        const response = await axios(smsData);
        // console.log("OTP SMS sent successfully!", response.data);

        let hashedOTP = await bcrypt.hash(OTP, 10);
        OTP = hashedOTP;

        // console.log("hashed OTP: ", OTP);

        let otp = await otpModel.findOne({ mobile: mobile });
        if (otp) {
            otp.otp = OTP;
        } else {
            otp = new otpModel({ mobile: mobile, otp: OTP });
        }

        await otp.save();

        return res.status(200).send({ status: true, message: "OTP sent successfully", data: response.data });
    } catch (error) {
        console.log("Error sending SMS:", error.message);
        return res.status(401).send({ status: false, message: error.message });
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
// VERIFY OTP
const verifyOTP = async (req, res) => {
    try {
        let { mobile, OTP } = req.body;

        let otpHolder = await otpModel.findOne({ mobile: mobile });

        if (!otpHolder) {
            return res.status(401).send({ status: false, message: "Please send OTP" });
        }
        let validUser = bcrypt.compare(OTP, otpHolder.otp);

        if (otpHolder.mobile === mobile && validUser) {
            await otpModel.deleteOne({ mobile: otpHolder.mobile });

            let resAcc = await createAccountAndToken(mobile);
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
            // return res.status(200).send({ status: true, message: "OTP verified successfully" });
        } else {
            return res.status(403).send({ status: false, message: "Authentication failed" });
        }
    } catch (error) {
        return res.status(500).send({ status: false, message: error.message });
    }
};

const verifyResetOTP = async (req, res) => {
    try {
        let { mobile, OTP, password } = req.body;
        if (!mobile || !OTP || !password) {
            return res.status(400).send({ status: false, message: "Phone number, password and otp are required" });
        }
        let otpHolder = await otpModel.findOne({ mobile: mobile });

        if (!otpHolder) {
            return res.status(401).send({ status: false, message: "Please send OTP" });
        }
        let validUser = bcrypt.compare(OTP, otpHolder.otp);

        if (otpHolder.mobile === mobile && validUser) {
            await otpModel.deleteOne({ mobile: otpHolder.mobile });
            let resAcc = await updatePassword(mobile, password);
            return res.status(resAcc.statusCode).send({ status: resAcc.status, message: resAcc.message });
        } else {
            return res.status(403).send({ status: false, message: "Authentication failed" });
        }
    } catch (error) {
        return res.status(500).send({ status: false, message: error.message });
    }
};

module.exports = { sentOTP, verifyOTP, forgetOTP, verifyResetOTP };
