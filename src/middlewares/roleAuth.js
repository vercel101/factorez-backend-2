const adminModel = require("../models/adminModel");
let customerModel = require("../models/customerModel");
let vendorModel = require("../models/vendorModel");
const { roleEnums, accessControls } = require("../utils/enums");

const checkUser = async (req, accessEnum) => {
    let user = null;
    if (req.userModel === "ADMIN") {
        user = await adminModel.findOne({ _id: req.userId });
    } else if (req.userModel === "VENDOR") {
        user = await vendorModel.findOne({ _id: req.userId });
    }
    if (!user) {
        return false;
    }
    req.userData = user;
    for (let x of user.role) {
        if (accessEnum.includes(x)) {
            return true;
        }
    }
    return false;
};

// ADD PRODUCT ROLE
const AddProductRole = async (req, res, next) => {
    try {
        // roleEnums.MANAGE_PRODUCT.ADD_PRODUCT
        req.userId;
        const admin = await adminModel.findOne({ _id: req.userId });
        next();
    } catch (error) {
        return res.status(500).send({ status: false, message: error.message });
    }
};

// ALL PRODUCT ROLE
const AllProductRole = async (req, res, next) => {
    try {
        let accessEnum = [
            accessControls.PRODUCT.PRODUCT_ALL_PRODUCT,
            accessControls.PRODUCT.ACCESS.PRODUCT_DOWNLOAD,
            accessControls.PRODUCT.ACCESS.PRODUCT_EDIT,
            accessControls.PRODUCT.ACCESS.PRODUCT_VIEW,
            accessControls.PRODUCT.PRODUCT_ADD_PRODUCT,
            "ADMIN",
        ];
        if (req.userModel === "VENDOR") {
            next();
            return;
        }
        let flag = await checkUser(req, accessEnum);
        if (flag) {
            next();
            return;
        }
        return res.status(401).send({
            message: "You don't have permission for this action",
            status: false,
        });
        // admin.role.includes
    } catch (error) {
        return res.status(500).send({ status: false, message: error.message });
    }
};

// ALL PRODUCT ROLE
const AllMenuRole = async (req, res, next) => {
    try {
        let accessEnum = [accessControls.PRODUCT.ACCESS.PRODUCT_DOWNLOAD, "ADMIN"];

        let user;
        if (req.userModel === "admin") {
            user = await adminModel.findOne({ _id: req.userId });
        } else if (req.userModel === "vendor") {
            user = await vendorModel.findOne({ _id: req.userId });
        }

        req.userData = user;
        for (let x of user.role) {
            if (accessEnum.includes(x)) {
                next();
                return;
            }
        }
        return res.status(401).send({
            message: "You don't have permission for this action",
            status: false,
        });
        // admin.role.includes
    } catch (error) {
        return res.status(500).send({ status: false, message: error.message });
    }
};

// MANAGE VENDORS
const AllVendorRoles = async (req, res, next) => {
    try {
        let accessEnum = [
            accessControls.VENDOR.ACCESS.VENDOR_DOWNLOAD,
            accessControls.VENDOR.ACCESS.VENDOR_EDIT,
            accessControls.VENDOR.ACCESS.VENDOR_VIEW,
            accessControls.VENDOR.VENDOR_ADD_VENDOR,
            accessControls.VENDOR.VENDOR_ALL_VENDOR,
            accessControls.VENDOR.VENDOR_VENDOR_MOV,
            accessControls.VENDOR.VENDOR_VENDOR_PAYMENT,
            "ADMIN",
        ];
        let user;
        if (req.userModel === "admin") {
            user = await adminModel.findOne({ _id: req.userId });
        }

        req.userData = user;
        for (let x of user.role) {
            if (accessEnum.includes(x)) {
                next();
                return;
            }
        }

        return res.status(401).send({
            message: "You don't have permission for this action",
            status: false,
        });
    } catch (error) {
        return res.status(500).send({ status: false, message: error.message });
    }
};

// MANAGE VENDORS
const AddProductColorRole = async (req, res, next) => {
    try {
        let accessEnum = [roleEnums.MANAGE_PRODUCT.PRODUCT_COLOR, "ADMIN"];
        let user;
        if (req.userModel === "admin") {
            user = await adminModel.findOne({ _id: req.userId });
        }

        req.userData = user;
        for (let x of user.role) {
            if (accessEnum.includes(x)) {
                next();
                return;
            }
        }
        return res.status(401).send({
            message: "You don't have permission for this action",
            status: false,
        });
    } catch (error) {
        return res.status(500).send({ status: false, message: error.message });
    }
};

// MANAGE VENDORS
const AddProductBrandRole = async (req, res, next) => {
    try {
        let accessEnum = [roleEnums.MANAGE_PRODUCT.BRAND, "ADMIN"];
        let user;
        if (req.userModel === "admin") {
            user = await adminModel.findOne({ _id: req.userId });
        } else if (req.userModel === "vendor") {
            user = await vendorModel.findOne({ _id: req.userId });
        }

        req.userData = user;
        for (let x of user.role) {
            if (accessEnum.includes(x)) {
                next();
                return;
            }
        }
        return res.status(401).send({
            message: "You don't have permission for this action",
            status: false,
        });
    } catch (error) {
        return res.status(500).send({ status: false, message: error.message });
    }
};

// MANAGE ORDER ROLE
const ManageOrderRole = async (req, res, next) => {
    try {
        let accessEnum = [
            accessControls.ORDERS.ORDERS_ABANDONED_ORDERS,
            accessControls.ORDERS.ORDERS_ALL_ORDERS,
            accessControls.ORDERS.ORDERS_CHANGE_ORDER_STATUS,
            accessControls.ORDERS.ACCESS.ORDERS_DOWNLOAD,
            accessControls.ORDERS.ACCESS.ORDERS_EDIT,
            accessControls.ORDERS.ACCESS.ORDERS_VIEW,
            "ADMIN",
        ];
        let user = null;
        if (req.userModel === "admin") {
            user = await adminModel.findOne({ _id: req.userId });
        } else if (req.userModel === "vendor") {
            user = await vendorModel.findOne({ _id: req.userId });
        }

        req.userData = user;
        for (let x of user.role) {
            if (accessEnum.includes(x)) {
                next();
                return;
            }
        }
        return res.status(401).send({
            message: "You don't have permission for this action",
            status: false,
        });
    } catch (error) {
        return res.status(500).send({ status: false, message: error.message });
    }
};

// MANAGE HOMEPAGE ROLE
const ManageHomePage = async (req, res) => {
    try {
        let accessEnum = [roleEnums.HOMEPAGE_MANAGE, "ADMIN"];

        let flag = await checkUser(req, accessEnum);

        if (flag) {
            next;
            return;
        }

        return res.status(401).send({
            status: false,
            message: "you don't have permission for this action",
        });
    } catch (error) {
        return res.status(500).send({ status: false, message: error.message });
    }
};

const colorRole = async (req, res, next) => {
    try {
        let accessEnum = [roleEnums.MANAGE_PRODUCT.PRODUCT_COLOR, "ADMIN"];
        let flag = await checkUser(req, accessEnum);
        if (flag) {
            next();
            return;
        }
        return res.status(401).send({
            message: "You don't have permission for this action",
            status: false,
        });
    } catch (error) {
        return res.status(500).send({ status: false, message: error.message });
    }
};

const verifyProudct = async (req, res, next) => {
    try {
        let accessEnum = [roleEnums.MANAGE_PRODUCT.PRODUCT_REVIEW, "ADMIN"];
        let flag = await checkUser(req, accessEnum);
        if (flag) {
            next();
            return;
        }
        return res.status(401).send({
            message: "You don't have permission for this action",
            status: false,
        });
    } catch (error) {
        return res.status(500).send({ status: false, message: error.message });
    }
};
const outOfStockProduct = async (req, res, next) => {
    try {
        console.log(req.userModel);
        if (req.userModel === "VENDOR") {
            next();
            return;
        }
        let accessEnum = [roleEnums.MANAGE_PRODUCT.PRODUCT_REVIEW, "ADMIN"];
        let flag = await checkUser(req, accessEnum);
        if (flag) {
            next();
            return;
        }
        return res.status(401).send({
            message: "You don't have permission for this action",
            status: false,
        });
    } catch (error) {
        return res.status(500).send({ status: false, message: error.message });
    }
};

const abandonedOrderRole = async (req, res, next) => {
    try {
        if (req.userModel === "ADMIN") {
            next();
            return;
        }
        return res.status(401).send({
            message: "You don't have permission for this action",
            status: false,
        });
    } catch (error) {
        return res.status(500).send({ status: false, message: error.message });
    }
};

module.exports = {
    AddProductRole,
    AllProductRole,
    AllMenuRole,
    AllVendorRoles,
    AddProductColorRole,
    AddProductBrandRole,
    ManageOrderRole,
    colorRole,
    verifyProudct,
    outOfStockProduct,
    abandonedOrderRole,
};
