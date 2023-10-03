const orderModel = require("../models/orderModel");
const customerModel = require("../models/customerModel");
const customerAddressModel = require("../models/customerAddressModel");
const vendorModel = require("../models/vendorModel");
const cartModel = require("../models/cartModel");
const productModel = require("../models/productModel");
const partialPaymentModel = require("../models/partialPaymentSchema");
const paymentModel = require("../models/paymentModel");
const cancelledReasonModel = require("../models/cancelledReasonModel");

const {
  generateRandomID,
  generateRandomAlphaNumericID,
} = require("../controllers/idGeneratorController");

const { json } = require("body-parser");

const orderedProductModel = require("../models/orderedProductModel");
const orderStatusTableModel = require("../models/orderStatusTableModel");
const { isValidObjectId } = require("mongoose");

// CREATE ORDER
const createOrder = async (req, res) => {
  try {
    let customerId = req.params.customerId;
    // let orderId = req.params.orderId;

    let data = req.body;

    let {
      orderId,
      vendorId,
      transaction_id,
      shipping_charges,
      grand_total,
      total,
      total_pairs,
      GST_amount,
      CGST,
      SGST,
      IGST,
      order_date,
      tracking_id,
      transport_bilty,
      Status,
      ordered_products,
      order_status_id,
      payment_id,
      customer_id,
      address_id,
    } = data;

    let customer = await customerModel.findOne({ _id: customerId });

    if (!customer) {
      return res
        .status(404)
        .send({ status: false, message: "Customer not found" });
    }

    let cart = await cartModel.findOne({ customer_id: customerId });

    if (!cart) {
      return res.status(404).send({ status: false, message: "Cart not found" });
    }

    let customerAddress = await customerAddressModel.findOne({
      customerId: customerId,
    });

    let orderedProducts = null;

    let orderData = {
      orderId: generateRandomID(20),
      vendorId,
      transaction_id: generateRandomID(27),
      shipping_charges,
      total: 0,
      grand_total: 0,
      total_pairs: 0,
      GST_amount: 0,
      CGST,
      SGST,
      IGST,
      order_date: new Date().toLocaleString(),
      tracking_id: generateRandomID(12),
      transport_bilty,
      Status,
      ordered_products,
      order_status_id,
      payment_id,
      customer_id,
      address_id,
    };

    if (cart && cart.products.length > 0) {
      let orderedProductsArr = [];

      let singleProudctObj = {
        product_id: "",
        vendor_id: "",
        seller_price: "",
        selling_price: "",
        mrp: "",
        qty: "",
        addedAt: "",
      };

      let newOrder;

      for (let cartProduct of cart.products) {
        singleProudctObj.product_id = cartProduct.product_id.toString();
        // console.log(singleProudctObj.product_id)

        let product = await productModel.findById(singleProudctObj.product_id);

        singleProudctObj.mrp = product.mrp;
        singleProudctObj.vendor_id = product.vendor_id;
        singleProudctObj.seller_price = product.seller_price;
        singleProudctObj.selling_price = product.selling_price;
        singleProudctObj.qty = cartProduct.qty;
        singleProudctObj.addedAt = cartProduct.addedAt;

        singleProudctObj;

        orderedProductsArr.push(singleProudctObj);

        orderData.total = product.selling_price;
        orderData.total_pairs = cartProduct.qty;
        orderData.GST_amount = orderData.CGST + orderData.SGST;

        orderData.grand_total =
          orderData.total + orderData.GST_amount + orderData.shipping_charges;
        orderData.vendorId = product.vendor_id;
        orderData.address_id = customerAddress._id;

        singleProudctObj = {
          product_id: "",
          vendor_id: "",
          seller_price: "",
          selling_price: "",
          mrp: "",
          qty: "",
          addedAt: "",
        };

        let OrderdProduct = await orderedProductModel.create({
          products: orderedProductsArr,
        });

        // orderData.ordered_products.push(OrderdProduct._id);
        orderData.ordered_products = OrderdProduct._id;

        let questions = {
          forAdmin: req.body.forAdmin,
          forVendor: req.body.forVendor,
          forCustomer: req.body.forCustomer,
        };

        let cancelledReasonData = {
          questions: questions,
          customerAnswer: req.body.customerAnswer,
        };

        let newCancelledReason = await cancelledReasonModel.create(
          cancelledReasonData
        );

        let cancelledObj = {
          cancelledBy: req.body.cancelledBy,
          userId: req.body.userId,
          reason: newCancelledReason._id,
        };

        let OrderStatusTableData = await orderStatusTableModel.create({
          status: req.body.status,
          isCompleted: req.body.isCompleted,
          cancelled: cancelledObj,
        });

        orderData.order_status_id = OrderStatusTableData._id;
        orderData.customer_id = customer._id;

        newOrder = await (
          await orderModel.create(orderData)
        ).populate("customer_id");

        let paymentDetails = {
          payment_mode: req.body.payment_mode,
          amount: req.body.amount,
          date: new Date(),
          transactionId: orderData.transaction_id,
        };

        let partialPaymentData = {
          paymentDetails: paymentDetails,
          remaining_amount: orderData.grand_total - paymentDetails.amount,
        };

        let newPartialPayment = await partialPaymentModel.create(
          partialPaymentData
        );

        let paymentData = await paymentModel.create({
          paymentId: generateRandomID(10),
          order_id: newOrder._id,
          customer_id: customer._id,
          payment_status: req.body.payment_status,
          payment_mode: paymentDetails.payment_mode,
          transactionId: paymentDetails.transactionId,
          payment_amount: orderData.grand_total,
          payment_date: new Date(),
          partial_mode: newPartialPayment._id,
        });

        //cart.products = [];

        //await cart.save();
      }

      return res.status(201).send({
        status: true,
        message: "Order created successfully",
        data: newOrder,
      });
    } else {
      return res
        .status(400)
        .send({ status: false, message: "Please add products to the cart" });
    }
  } catch (error) {
    return res.status(500).send({ status: false, message: error.message });
  }
};

// CREATE CUSTOMER ORDER
const customerOrder = async (req, res) => {
  try {
    // Receive the order details from the client
    const { customer_id, products } = req.body;

    // Create an empty array to store partial order objects
    const partialOrders = [];

    // Group products by vendorId
    const productsByVendor = {};
    for (const product of products) {
      if (!productsByVendor[product.vendor_id]) {
        productsByVendor[product.vendor_id] = [];
      }
      productsByVendor[product.vendor_id].push(product);
    }

    // Loop through each vendor and create a partial order
    for (const vendorId in productsByVendor) {
      const vendorProducts = productsByVendor[vendorId];

      // Calculate the total, shipping_charges, GST_amount, and grand_total for the partial order
      let total = 0;
      let totalPairs = 0;
      for (const product of vendorProducts) {
        total += product.selling_price * product.qty;
        totalPairs += product.qty;
      }
      const shipping_charges = 50; // Some example shipping charges
      const GST_percentage = 18; // Some example GST percentage
      const GST_amount = (total * GST_percentage) / 100;
      const grand_total = total + shipping_charges + GST_amount;

      // Create a new partial order object
      const partialOrder = {
        vendorId,
        customer_id,
        ordered_products: vendorProducts.map((product) => product._id),
        shipping_charges,
        total,
        total_pairs: totalPairs,
        GST_amount,
        grand_total,
        Status: "Pending", // Set the initial status to "Pending"
        // Add other required fields here
      };

      // Create a partial payment object for this partial order
      const partialPayment = new PartialPayment({
        paymentDetails: [],
        remaining_amount: grand_total,
      });
      await partialPayment.save();

      // Add the partial payment reference to the partial order
      partialOrder.partial_mode = partialPayment._id;

      // Create a payment object for this partial order
      const payment = new Payment({
        paymentId: generatePaymentId(), // You can implement a function to generate unique payment IDs
        order_id: null, // Will be updated once the order is created
        customer_id,
        payment_status: "Pending", // Set the initial payment status to "Pending"
        payment_mode: "Partial", // For partial orders
        transactionId: null, // Will be updated when the payment is processed
        payment_amount: grand_total,
        payment_date: new Date(),
        partial_mode: partialPayment._id,
      });
      await payment.save();

      // Add the payment reference to the partial order
      partialOrder.payment_id = payment._id;

      // Create the order for this vendor and save it to the database
      const order = new Order(partialOrder);
      await order.save();

      // Add the order reference to the payment and partial payment
      payment.order_id = order._id;
      await payment.save();

      partialPayment.order_id = order._id;
      await partialPayment.save();

      // Add the partial order to the array of partial orders
      partialOrders.push(partialOrder);
    }

    // Return the created partial orders to the client
    res.status(200).json(partialOrders);
  } catch (error) {
    console.error("Error creating orders:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Helper function to generate a unique payment ID
function generatePaymentId() {
  return "PAYMENT-" + Date.now() + "-" + Math.floor(Math.random() * 1000);
}

module.exports = {
  createOrder,
  customerOrder,
};

let obj = {
  "64b117840466610ff46d081f": [
    {
      product_id: "64ba28aca24cc660027fda72",
      vendor_id: "64b117840466610ff46d081f",
      selling_price: 100,
      qty: 10,
      lotSize: "4/1, 5/2",
    },
  ],
  "64b116e50466610ff46d0816": [
    {
      product_id: "64c8ee998e1f8104d5bf3418",
      vendor_id: "64b116e50466610ff46d0816",
      selling_price: 50,
      qty: 15,
      lotSize: "4/1, 5/2",
    },
  ],
};

// Helper function to calculate the partial payment amount
function calculatePartialAmount(totalAmount, percentage) {
  return (totalAmount * percentage) / 100;
}

// API to add payment for "COD" payment mode
app.post("/api/addPayment", async (req, res) => {
  try {
    const { orderId, payment_mode } = req.body;

    // Fetch the order details to get the total amount
    const order = await orderModel.findOne({ _id: orderId });

    if (!order) {
      return res
        .status(404)
        .json({ status: false, message: "Order not found" });
    }

    let paymentDetails = {
      payment_mode: payment_mode,
      amount: calculatePartialAmount(order.grand_total, 10), // 10% initial payment
      date: new Date(),
      transactionId: generateRandomID(25),
    };

    let partialPaymentData = await partialPaymentModel.findOne({
      payment_mode: payment_mode,
    });

    if (partialPaymentData) {
      // Update existing Partial_Payment data with the first partial payment details
      partialPaymentData.paymentDetails.push(paymentDetails);
      partialPaymentData.remaining_amount -= paymentDetails.amount;
      await partialPaymentData.save();
    } else {
      // Create new Partial_Payment data with the first partial payment details
      partialPaymentData = new Partial_Payment({
        paymentDetails: [paymentDetails],
        remaining_amount: order.grand_total - paymentDetails.amount,
        payment_mode: payment_mode,
      });

      await partialPaymentData.save();
    }

    let firstPartialPayment = await partialPaymentModel.findOne({
      order_id: orderId,
    });

    let firstPayment = await paymentModel.findOne({ order_id: orderId });

    if (firstPartialPayment && firstPayment) {
      let partialPaymentDetails = {
        paymentMode: "CUSTOM",
        amount: custom_amount,
        date: new Date().toLocaleString(),
        transactionId: generateRandomID(15),
      };

      firstPartialPayment.paymentDetails = firstPartialPayment._id;
    }

    // Create the Payment document
    let paymentData = {
      order_id: orderId,
      payment_status: "Pending",
      payment_mode: payment_mode,
      transactionId: generateRandomID(25),
      payment_amount: paymentDetails.amount,
      payment_date: paymentDetails.date,
      partial_mode: partialPaymentData._id,
    };

    const payment = new Payment(paymentData);
    const newPayment = await payment.save();

    const obj = {
      payment_mode: req.body.payment_mode,
      payment_amount: req.body.payment_amount,
      payment_date: new Date().toLocaleString(),
      transactionId: generatePaymentId(),
    };


    //let order = await orderModel.findOne({ orderId: orderId })

    let a = firstPartialPayment.paymentDetails[firstPartialPayment.paymentDetails.length-1].amount;
    //console.log(a);
    return res
      .status(201)
      .json({
        status: true,
        message: 'New payment added successfully',
        data: newPayment,
      });
  } catch (err) {
    console.error("Error adding payment:", err);
    res.status(500).json({ message: "Error adding payment." });
  }
});



// 

let cartObj = {
  "64b117840466610ff46d081f": [
    {
      product_id: "64ba28aca24cc660027fda72",
      vendor_id: "64b117840466610ff46d081f",
      selling_price: 100,
      qty: 10,
      lotSize: "4/1, 5/2",
    },
  ],
  "64b116e50466610ff46d0816": [
    {
      product_id: "64c8ee998e1f8104d5bf3418",
      vendor_id: "64b116e50466610ff46d0816",
      selling_price: 50,
      qty: 15,
      lotSize: "4/1, 5/2",
    },
  ],
};

