const adminModel = require("../models/adminModel");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { listOfRoleEnums, roleEnums } = require("../utils/enums");
const { adminSecretKey, tokenSecretKey } = require("../middlewares/config");
const vendorModel = require("../models/vendorModel");
const documentModel = require("../models/documentModel");
const bankModel = require("../models/bankModel");
const brandModel = require("../models/brandModel");
const { isValid, isValidEmail } = require("../utils/utils");
const productModel = require("../models/productModel");

const addAdmin = async (req, res) => {
    try {
        let { name, email, phone, password, role } = req.body;

        let admins = await adminModel.find({
            $or: [{ email: email }, { phone: phone }],
        });
        if (admins.length > 0) {
            return res.status(400).send({
                message: "Email or Password already exists",
                status: false,
            });
        }
        if (name === "") {
            return res.status(400).send({ message: "Name is required", status: false });
        }
        if (email === "") {
            return res.status(400).send({ message: "Email is required", status: false });
        }
        if (phone === "") {
            return res.status(400).send({ message: "Phone number is required", status: false });
        }
        if (password === "") {
            return res.status(400).send({ message: "Password is required", status: false });
        }
        if (role === "") {
            return res.status(400).send({ message: "Admin Role is required", status: false });
        }
        let hashedPassword = await bcrypt.hash(password, 10);
        password = hashedPassword;
        let data = {
            name,
            email: email.toLowerCase(),
            password,
            role,
            phone,
            isDeleted: false,
        };
        let admin = await adminModel.create(data);
        admin.password = undefined;
        admin.isSuperAdmin = undefined;
        return res.status(201).send({ status: true, message: "Successful", data: admin });
    } catch (error) {
        return res.status(500).send({ status: false, message: error.message });
    }
};

const getAllAdmin = async (req, res) => {
    let admin = await adminModel.find({ isSuperAdmin: false, isDeleted: false }).select(["-password", "-isSuperAdmin"]);
    return res.status(200).send({ status: true, message: "All admins", data: admin });
};

const updateAdminInfo = async (req, res) => {
    try {
        let adminId = req.params.adminid;
        let { phone, password, email, name, role } = req.body;
        let admin = await adminModel.findOne({ _id: adminId, isDeleted: false });
        if (!admin) {
            return res.status(400).send({ status: false, message: "Bad request" });
        }
        if (phone) admin.phone = phone;
        if (email) admin.email = email.toLowerCase();
        if (name) admin.name = name;
        if (role) admin.role = role;
        if (password) {
            let hashedPassword = await bcrypt.hash(password, 10);
            admin.password = hashedPassword;
        }
        await admin.save();
        return res.status(202).send({ status: true, message: "Admin Updated" });
    } catch (error) {
        return res.status(500).send({ status: false, message: error.message });
    }
};

const createSuperAdmin = async (req, res) => {
    try {
        let { name, email, phone, password } = req.body;
        let params = req.params.secretKey;
        if (params === adminSecretKey) {
            let admins = await adminModel.find({
                $or: [{ email: email }, { phone: phone }],
            });
            if (admins.length > 0) {
                return res.status(400).send({
                    message: "Email or Password already exists",
                    status: false,
                });
            }
            if (name === "") {
                return res.status(400).send({ message: "Name is required", status: false });
            }
            if (email === "") {
                return res.status(400).send({ message: "Email is required", status: false });
            }
            if (phone === "") {
                return res.status(400).send({ message: "Phone number is required", status: false });
            }
            if (password === "") {
                return res.status(400).send({ message: "Password is required", status: false });
            }
            let hashedPassword = await bcrypt.hash(password, 10);
            password = hashedPassword;
            let data = {
                name,
                email: email.toLowerCase(),
                password,
                role: ["ADMIN"],
                phone,
                isSuperAdmin: true,
                isDeleted: false,
            };
            let superAdmin = await adminModel.create(data);
            superAdmin.password = undefined;
            superAdmin.isSuperAdmin = undefined;
            return res.status(201).send({ status: true, message: "Successful", data: superAdmin });
        }
        return res.status(401).send({ status: true, message: "Invalid signature" });
    } catch (error) {
        return res.status(500).send({ status: false, message: error.message });
    }
};

const adminLogin = async (req, res) => {
    try {
        let { email, password } = req.body;
        if (!isValid(email)) {
            return res.status(400).send({ status: false, message: "Email or USER Id is required" });
        }

        if (email.includes("@")) {
            if (!isValidEmail(email)) {
                return res.status(400).send({ status: false, message: "Invalid email" });
            }
        }
        if (!isValid(password)) {
            return res.status(400).send({ status: false, message: "password is required" });
        }
        // const EmailRegex = /^\w+([\.]?\w+)*@\w+([\.]?\w+)*(\.\w{2,3})+$/;
        // const UserIDReges = /^[0-9]{8,14}$/;
        // const PasswordRegex = /^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{10,20}$/;

        // if ((!EmailRegex.test(email) && !UserIDReges.test(email)) || !PasswordRegex.test(password)) {
        //     return res.status(400).send({ status: false, message: "Please provide valid Credentials" });
        // }
        let user = null;
        if (email.includes("@")) {
            user = await adminModel.findOne({ email: email.toLowerCase(), isDeleted: false });
            if (!user) {
                user = await vendorModel.findOne({ emailId: email.toLowerCase() });
            }
        } else {
            user = await vendorModel.findOne({ vendor_unique_id: email });
        }
        if (!user) {
            return res.status(400).send({ status: false, message: "Invalid Email id or Username" });
        }
        bcrypt.compare(password, user.password, function (err, result) {
            if (err) {
                return res.status(400).send({ status: false, message: err.message });
            }
            hasAccess(result);
        });

        function hasAccess(result) {
            if (result) {
                let date = Date.now();
                let data = {};
                let userFlag = "isSuperAdmin" in user;
                if (!userFlag) {
                    if (user.status === "Pending" || user.status === "Inprogress") {
                        return res.status(401).send({ status: false, message: "Account is under review" });
                    }
                    if (user.status === "Rejected") {
                        return res.status(401).send({ status: false, message: "Account has been Rejected, Please contact us." });
                    }
                }
                if (!userFlag) {
                    data.name = user.representativeName;
                    data.email = user.emailId;
                    data.userType = "Seller";
                    data.role = user.role;
                    data.altMobileNo = user.altMobileNo;
                    data.phone = user.mobileNo;
                    data.photo = user.profileUrl;
                    data.vendorId = user.vendor_unique_id;
                } else {
                    data.name = user.name;
                    data.email = user.email;
                    data.userType = user.isSuperAdmin ? "Super Admin" : "Admin";
                    data.role = user.role;
                    data.phone = user.phone;
                    data.photo = user.profileUrl;
                    data.vendorId = null;
                }

                let issueTime = Math.floor(date / 1000);
                let token = jwt.sign(
                    {
                        email: data.email,
                        userId: user._id.toString(),
                        userModel: userFlag ? "ADMIN" : "VENDOR",
                        iat: issueTime,
                    },
                    tokenSecretKey,
                    { expiresIn: "12h" }
                );
                data.token = token;

                res.setHeader("Authorization", "Bearer", token);
                return res.status(200).send({
                    status: false,
                    message: "Successfully logged in",
                    data: data,
                });
            } else {
                return res.status(401).send({ status: false, message: "Incorrect Password" });
            }
        }
    } catch (error) {
        return res.status(500).send({ status: false, message: error.message });
    }
};
const getAllSubadminEnums = async (req, res) => {
    try {
        return res.status(200).send({ status: true, message: "Data Accessed", data: roleEnums });
    } catch (error) {
        return res.status(500).send({ status: false, message: error.message });
    }
};

const verifyVendor = async (req, res) => {
    try {
        let { vendorMargin, vendorStatus } = req.body;
        let vendorObj = await vendorModel.findById(req.params.vendorId);
        if (vendorStatus === "Approved") {
            if (vendorMargin) {
                vendorObj.marginInPercentage = vendorMargin;
            }
            vendorObj.status = vendorStatus;
            vendorObj.actionTakenBy = req.userId;
            await productModel.updateMany({ vendor_id: vendorObj._id }, { $set: { margin: vendorMargin } });
            await vendorObj.save();
        } else if (vendorStatus === "Rejected") {
            vendorObj.status = vendorStatus;
            vendorObj.actionTakenBy = req.userId;
            await vendorObj.save();
        } else {
            if (vendorMargin) {
                await productModel.updateMany({ vendor_id: vendorObj._id }, { $set: { margin: vendorMargin } });
                vendorObj.marginInPercentage = vendorMargin;
            }
            await vendorObj.save();
        }
        return res.status(200).send({ status: true, message: "Vendor Updated", data: "Updated" });
    } catch (error) {
        return res.status(500).send({ status: false, message: error.message });
    }
};
const deleteVendor = async (req, res) => {
    try {
        let { vendorId } = req.body;
        if (!vendorId) {
            return res.status(400).send({ status: false, message: "bad request" });
        }
        let vendor = await vendorModel.findById(vendorId);
        if (!vendor) {
            return res.status(400).send({ status: false, message: "vendor not found" });
        }
        vendor.isDeleted = true;
        await vendor.save();
        return res.status(202).send({ status: true, message: "vendor deleted successfully" });
    } catch (error) {
        return res.status(500).send({ status: false, message: error.message });
    }
};

const changeVendorPassword = async (req, res) => {
    try {
        let { vendorId, newPassword } = req.body;

        let vendor = await vendorModel.findOne({ _id: vendorId });
        if (!vendor) {
            return res.status(404).send({ status: false, message: "Vendor Not Found" });
        }
        if (newPassword === "") {
            return res.status(400).send({ message: "Password is required", status: false });
        }
        let hashedPassword = await bcrypt.hash(newPassword, 10);

        vendor.password = hashedPassword;
        await vendor.save();
        return res.status(201).send({ message: "Password updated", status: true });
    } catch (error) {
        return res.status(500).send({ status: false, message: error.message });
    }
};

const deleteAdminById = async (req, res) => {
    try {
        let adminId = req.params.adminid;
        let admin = await adminModel.findById(adminId);
        if (!admin) {
            return res.status(400).send({ status: false, message: "Bad request" });
        }
        admin.isDeleted = true;
        await admin.save();
        return res.status(202).send({ status: true, message: "Admin Deleted" });
    } catch (error) {
        return res.status(500).send({ status: false, message: error.message });
    }
};

module.exports = {
    addAdmin,
    getAllAdmin,
    createSuperAdmin,
    adminLogin,
    getAllSubadminEnums,
    verifyVendor,
    deleteVendor,
    changeVendorPassword,
    updateAdminInfo,
    deleteAdminById,
};
