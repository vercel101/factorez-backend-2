const adminModel = require("../models/adminModel");
let customerModel = require("../models/customerModel");
let vendorModel = require("../models/vendorModel");
const { roleEnums } = require("../utils/enums");

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
      roleEnums.MANAGE_PRODUCT.ALL_PRODUCT,
      roleEnums.MANAGE_PRODUCT.ADD_PRODUCT,
      roleEnums.MANAGE_PRODUCT.PRODUCT_SIZE,
      "ADMIN",
    ];
    if(req.userModel === 'VENDOR'){
      next();
      return;
    }
    let flag = await checkUser(req, accessEnum);
    if(flag){
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
    let accessEnum = [
      roleEnums.MANAGE_MENU.ADD_CATEGORY,
      roleEnums.MANAGE_MENU.ADD_SUBCATEGORY,
      "ADMIN",
    ];

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
      roleEnums.MANAGE_VENDOR.ADD_VENDOR,
      roleEnums.MANAGE_VENDOR.ALL_OUTSTANDING,
      roleEnums.MANAGE_VENDOR.ALL_SETTLED,
      roleEnums.MANAGE_VENDOR.ALL_VENDOR,
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
      roleEnums.MANAGE_ORDERS.ALL_ORDERS,
      roleEnums.MANAGE_ORDERS.CANCEL_ORDER,
      roleEnums.MANAGE_ORDERS.CONFIRM_ORDERS,
      roleEnums.MANAGE_ORDERS.SHIPPED_ORDER,
      roleEnums.MANAGE_ORDERS.DELIVERED_ORDER,
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

    return res
      .status(401)
      .send({
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
}

const verifyProudct = async (req, res, next)=>{
  try {
    let accessEnum = [
      roleEnums.MANAGE_PRODUCT.PRODUCT_REVIEW,
      "ADMIN"
    ];
    let flag = await checkUser(req, accessEnum);
    if(flag){
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
}
const outOfStockProduct = async (req, res, next) => {
  try {
    console.log(req.userModel);
    if(req.userModel === 'VENDOR'){
      next();
      return;
    }
    let accessEnum = [
      roleEnums.MANAGE_PRODUCT.PRODUCT_REVIEW,
      "ADMIN"
    ];
    let flag = await checkUser(req, accessEnum);
    if(flag){
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
}


const abandonedOrderRole = async (req, res, next) => {
  try {
    if(req.userModel === 'ADMIN'){
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
}

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
  abandonedOrderRole
};
