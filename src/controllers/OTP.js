const axios = require("axios");
const _ = require("lodash");
const bcrypt = require('bcrypt');
const otpModel = require('../models/otpModel');


// GENERATE RANDOM NUMERIC ID OF GIVEN LENGTH
function generateRandomID(length) {
    let id = '';
    const digits = '0123456789';
  
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * digits.length);
      id += digits[randomIndex];
    }
    return id;
}


// SEND OTP THROUGH KALEYRA SMS API
const sentOTP = async (req, res) => {
    try {
        const apiKey = "A78cd4e6b7179e5439caac3c9f5f75b63";
        const sid = "HXIN1777665894IN";
        const type = "OTP";
        const senderId = "FCTREZ";
        let to = 917042072054;
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
            data: `to=${to}&type=${type}&sender=${senderId}&body=${body}&template_id=${otpTemplateId}`,
        };

        const response = await axios(smsData);
        // console.log("OTP SMS sent successfully!", response.data);

        let hashedOTP = await bcrypt.hash(OTP, 10);
        OTP = hashedOTP;

        // console.log("hashed OTP: ", OTP);

        let otp = new otpModel({ mobile: to, otp: OTP });

        await otp.save();

        return res.status(200).send({ status: true, message: "OTP sent successfully", data: response.data });
    } catch (error) {
        console.log("Error sending SMS:", error.message);
        return res.status(401).send({ status: false, message: error.message });
    }
};


// VERIFY OTP
const verifyOTP = async (req, res) => {
    try {
        let { mobile, OTP } = req.body;

        let otpHolder = await otpModel.find({mobile: mobile});

        if (!otpHolder.length) {
            return res.status(401).send({status: false, message: 'You are using an expired OTP'});
        }

        let validOTP = otpHolder[otpHolder.length - 1];

        let validUser = bcrypt.compare(OTP, validOTP.otp);

        if (validOTP.mobile === mobile && validUser) {
            await otpModel.deleteMany({mobile: validOTP.mobile});

            return res.status(200).send({status: true, message: 'User verified'});
        } else {
            return res.status(401).send({status: false, message: 'Authentication failed'});
        }
    } catch (error) {
        return res.status(500).send({status: false, message: error.message})
    }
}

module.exports = { sentOTP, verifyOTP };