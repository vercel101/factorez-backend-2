const express = require("express");
const router = express.Router();
const customerController = require("../controllers/customerController");
const customerAddressController = require("../controllers/customerAddressController");

const { Authentication, AuthenticationCustomer } = require("../middlewares/auth");

router.post("/login-customer", customerController.loginUser);
router.get("/customers", Authentication, customerController.getAllCustomer);
router.get("/customer/:customerId", Authentication, customerController.getCustomerById);
router.put("/updatecustomer/:customerId", AuthenticationCustomer, customerController.updateCustomerById);
router.delete("/customer/:customerId", Authentication, customerController.deleteCustomerById);
router.post("/addcustomrinformation/:customerid", customerAddressController.addCustomerInformation);
router.delete("/address/:customerId/:addressId", AuthenticationCustomer, customerAddressController.deleteAddressById);
router.patch("/blockcustomer/:customerId", Authentication, customerController.blockCustomerById);
router.post("/getordersbycustomerphone", Authentication, customerController.findOrdersByPhone);
router.post("/addaddress/:customerId", AuthenticationCustomer, customerAddressController.addAddress);
router.get("/getalladdress/:customerId", AuthenticationCustomer, customerAddressController.getAllAddresses);
router.put("/setdefaultaddress/:customerId/:addressId", AuthenticationCustomer, customerController.setDefaultAddress);

module.exports = router;
