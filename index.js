const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const fileUpload = require("express-fileupload");
const path = require("path");
const cors = require("cors");
const app = express();
require("dotenv").config();

const productRoutes = require("./src/routes/productRoutes");
const categoryRoutes = require("./src/routes/categoryRoutes");
const brandRoutes = require("./src/routes/brandRoutes");
const vendorRoutes = require("./src/routes/vendorRoutes");
const adminRoutes = require("./src/routes/adminRoutes");
const colorRoutes = require("./src/routes/colorRoutes");
const customerRoutes = require("./src/routes/customerRoutes");
const orderRoutes = require("./src/routes/orderRoutes");
const paymentRoutes = require("./src/routes/paymentRoutes");
const cartRoutes = require("./src/routes/cartRoutes");
const questionRoutes = require("./src/routes/questionsRoutes");
const couponRoutes = require("./src/routes/couponCodeRoutes");
const businessRoutes = require("./src/routes/businessRoutes");
const homepageRoutes = require("./src/routes/homepageRoutes");
const invoiceRoutes = require("./src/routes/invoiceRoutes");
const optRoutes = require("./src/routes/otpRoutes");
const orderStatusRoute = require("./src/routes/orderStatusTableRoutes");
const profileRoutes = require("./src/routes/profileRoutes");
const reportRoutes = require("./src/routes/reportRoutes");
const dashboardRoutes = require("./src/routes/dashboardRoutes");
const wishlistRoutes = require("./src/routes/wishlistRoutes");
const { mongoDbUrl, port } = require("./src/middlewares/config");

app.use(express.json());
app.use(fileUpload());
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors());

mongoose
    .connect(mongoDbUrl, { useNewUrlParser: true })
    .then(() => console.log("Connected with Database"))
    .catch((err) => console.log(err));

app.use("/", productRoutes);
app.use("/", categoryRoutes);
app.use("/", brandRoutes);
app.use("/", vendorRoutes);
app.use("/", adminRoutes);
app.use("/", colorRoutes);
app.use("/", customerRoutes);
app.use("/", orderRoutes);
app.use("/", paymentRoutes);
app.use("/", cartRoutes);
app.use("/", questionRoutes);
app.use("/", couponRoutes);
app.use("/", businessRoutes);
app.use("/", homepageRoutes);
app.use("/", invoiceRoutes);
app.use("/", optRoutes);
app.use("/", orderStatusRoute);
app.use("/", profileRoutes);
app.use("/", reportRoutes);
app.use("/", dashboardRoutes);
app.use("/", wishlistRoutes);

app.get("/", (req, res) => {
    res.send("<h1>factorez.com backend deployed successfully</h1>");
});

app.listen(port, () => console.log(`Server is up and running on port: ${port}`));
