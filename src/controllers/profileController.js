const adminModel = require("../models/adminModel");
const vendorModel = require("../models/vendorModel");
const { uploadFile } = require("./imageController");
const bcrypt = require("bcrypt");

const changePassword = async (req, res) => {
    let vendor = await vendorModel.findById(req.body.userid);
    vendor.password = await bcrypt.hash(req.body.password, 10);
    vendor.save();
    res.status(200).send({
        status: true,
        message: "password changed successfully",
    });
};

const updateProfile = async (req, res) => {
    try {
        let userId = req.userId;
        let userType = req.userModel;
        let { fullName, emailID, phone, altPhone, newPass, oldPass } = req.body;
        if (userType === "ADMIN") {
            let admin = await adminModel.findById(userId);
            if (oldPass && newPass) {
                bcrypt.compare(oldPass, admin.password, function (err, result) {
                    if (err) {
                    }
                    hasAccess(result, admin);
                });
                async function hasAccess(result, admin) {
                    if (result) {
                        admin.password = await bcrypt.hash(newPass, 10);
                        if (fullName) admin.name = fullName;
                        if (emailID) admin.email = emailID;
                        if (phone && emailID) {
                            let x = await adminModel.find({
                                $or: [{ email: emailID }, { phone: phone }],
                            });
                            if (x.length > 0) {
                                return res.status(400).send({
                                    status: false,
                                    message:
                                        "Mobile and Email number already exists",
                                });
                            }
                            admin.phone = phone;
                            admin.email = emailID;
                        } else if (phone) {
                            let x = await adminModel.find({ phone: phone });
                            if (x.length > 0) {
                                return res.status(400).send({
                                    status: false,
                                    message: "Mobile number already exists",
                                });
                            }
                            admin.phone = phone;
                        } else if (emailID) {
                            let x = await adminModel.find({ email: emailID });
                            if (x.length > 0) {
                                return res.status(400).send({
                                    status: false,
                                    message: "Email id already exists",
                                });
                            }
                            admin.email = emailID;
                        }

                        if (req.files) {
                            let { profileImg } = req.files;
                            let imgRes = await uploadFile(profileImg);
                            admin.profileUrl = imgRes;
                        }
                        let y = await admin.save();
                        let data = {};
                        data.name = y.name;
                        data.email = y.email;
                        data.userType = y.isSuperAdmin
                            ? "Super Admin"
                            : "Admin";
                        data.role = y.role;
                        data.phone = y.phone;
                        data.photo = y.profileUrl;
                        // console.log(vendor);
                        return res.status(202).send({
                            status: true,
                            message: "Profile updated successfully",
                            data: data,
                        });
                    } else {
                        return res.status(401).send({
                            status: true,
                            message: "Invalid Password",
                        });
                    }
                }
            } else {
                if (fullName) admin.name = fullName;
                if (emailID) admin.email = emailID;
                if (phone && emailID) {
                    let x = await adminModel.find({
                        $or: [{ email: emailID }, { phone: phone }],
                    });
                    if (x.length > 0) {
                        return res.status(400).send({
                            status: false,
                            message: "Mobile and Email number already exists",
                        });
                    }
                    admin.phone = phone;
                    admin.email = emailID;
                } else if (phone) {
                    let x = await adminModel.find({ phone: phone });
                    if (x.length > 0) {
                        return res.status(400).send({
                            status: false,
                            message: "Mobile number already exists",
                        });
                    }
                    admin.phone = phone;
                } else if (emailID) {
                    let x = await adminModel.find({ email: emailID });
                    if (x.length > 0) {
                        return res.status(400).send({
                            status: false,
                            message: "Email id already exists",
                        });
                    }
                    admin.email = emailID;
                }

                if (req.files) {
                    let { profileImg } = req.files;
                    let imgRes = await uploadFile(profileImg);
                    admin.profileUrl = imgRes;
                }
                let y = await admin.save();
                let data = {};
                data.name = y.name;
                data.email = y.email;
                data.userType = y.isSuperAdmin ? "Super Admin" : "Admin";
                data.role = y.role;
                data.phone = y.phone;
                data.photo = y.profileUrl;
                // console.log(vendor);
                return res.status(202).send({
                    status: true,
                    message: "Profile updated successfully",
                    data: data,
                });
            }
        } else {
            let vendor = await vendorModel.findById(userId);
            if (oldPass && newPass) {
                bcrypt.compare(
                    oldPass,
                    vendor.password,
                    function (err, result) {
                        if (err) {
                        }
                        hasAccess(result, vendor);
                    }
                );
                async function hasAccess(result, vendor) {
                    if (result) {
                        console.log(result);
                        vendor.password = await bcrypt.hash(newPass, 10);
                        if (fullName) vendor.representativeName = fullName;
                        if (altPhone) vendor.altMobileNo = altPhone;
                        if (req.files) {
                            let { profileImg } = req.files;
                            let imgRes = await uploadFile(profileImg);
                            vendor.profileUrl = imgRes;
                        }
                        if (phone && emailID) {
                            let x = await vendorModel.find({
                                $or: [
                                    { emailId: emailID },
                                    { mobileNo: phone },
                                ],
                            });
                            if (x.length > 0) {
                                return res.status(400).send({
                                    status: false,
                                    message:
                                        "Mobile and Email number already exists",
                                });
                            }
                            vendor.mobileNo = phone;
                            vendor.emailId = emailID;
                        } else if (phone) {
                            let x = await vendorModel.find({ mobileNo: phone });
                            if (x.length > 0) {
                                return res.status(400).send({
                                    status: false,
                                    message: "Mobile number already exists",
                                });
                            }
                            vendor.mobileNo = phone;
                        } else if (emailID) {
                            let x = await vendorModel.find({
                                emailId: emailID,
                            });
                            if (x.length > 0) {
                                return res.status(400).send({
                                    status: false,
                                    message: "Email id already exists",
                                });
                            }
                            vendor.emailId = emailID;
                        }

                        let y = await vendor.save();
                        let data = {};
                        data.name = y.representativeName;
                        data.email = y.emailId;
                        data.userType = "Seller";
                        data.role = y.role;
                        data.altMobileNo = y.altMobileNo;
                        data.phone = y.mobileNo;
                        data.photo = y.profileUrl;
                        data.vendorId = y.vendor_unique_id;
                        return res.status(202).send({
                            status: true,
                            message: "Profile updated successfully",
                            data: data,
                        });
                    } else {
                        return res.status(401).send({
                            status: true,
                            message: "Invalid Password",
                        });
                    }
                }
            } else {
                if (fullName) vendor.representativeName = fullName;
                if (altPhone) vendor.altMobileNo = altPhone;
                if (req.files) {
                    let { profileImg } = req.files;
                    let imgRes = await uploadFile(profileImg);
                    vendor.profileUrl = imgRes;
                }
                if (phone && emailID) {
                    let x = await vendorModel.find({
                        $or: [{ emailId: emailID }, { mobileNo: phone }],
                    });
                    if (x.length > 0) {
                        return res.status(400).send({
                            status: false,
                            message: "Mobile and Email number already exists",
                        });
                    }
                    vendor.mobileNo = phone;
                    vendor.emailId = emailID;
                } else if (phone) {
                    let x = await vendorModel.find({ mobileNo: phone });
                    if (x.length > 0) {
                        return res.status(400).send({
                            status: false,
                            message: "Mobile number already exists",
                        });
                    }
                    vendor.mobileNo = phone;
                } else if (emailID) {
                    let x = await vendorModel.find({
                        emailId: emailID,
                    });
                    if (x.length > 0) {
                        return res.status(400).send({
                            status: false,
                            message: "Email id already exists",
                        });
                    }
                    vendor.emailId = emailID;
                }

                let y = await vendor.save();
                let data = {};
                data.name = y.representativeName;
                data.email = y.emailId;
                data.userType = "Seller";
                data.role = y.role;
                data.altMobileNo = y.altMobileNo;
                data.phone = y.mobileNo;
                data.photo = y.profileUrl;
                data.vendorId = y.vendor_unique_id;
                return res.status(202).send({
                    status: true,
                    message: "Profile updated successfully",
                    data: data,
                });
            }
        }
    } catch (error) {
        return res.status(500).send({ status: false, message: error.message });
    }
};

module.exports = { updateProfile, changePassword };
