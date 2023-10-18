const productModel = require("../models/productModel");
const customerModel = require("../models/customerModel");
const vendorModel = require("../models/vendorModel");
const orderModel = require("../models/orderModel");

const getDateStrToMS = (dateStr) => {
    dateStr.setHours(0, 0, 0, 0);
    return dateStr.getTime();
};

const getCurrentYear = () => {
    var date = new Date();
    var firstMonth = new Date(date.getFullYear(), 0, 1);
    var lastMonth = new Date(date.getFullYear(), 12, 0);
    return [firstMonth.getTime(), lastMonth.getTime()];
};

const getCurrentMonth = () => {
    var date = new Date();
    var firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
    var lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);
    return [firstDay.getTime(), lastDay.getTime()];
};

const getCurrentWeek = () => {
    var curr = new Date();
    curr.setHours(0, 0, 0, 0);
    var first = curr.getDate() - curr.getDay();
    var last = first + 6;
    var firstDay = new Date(curr.setDate(first));
    var lastDay = new Date(curr.setDate(last));
    console.log(firstDay);
    console.log(lastDay);
    return [firstDay.getTime(), lastDay.getTime()];
};

const getDashboardData = async (req, res) => {
    try {
        let products = await productModel.find({ isDeleted: false }).populate("vendor_id");
        let productCount = 0;
        let customerCount = 0;
        let vendorCount = 0;
        let orderCount = 0;
        let todayOrderCount = 0;
        let thisWeakOrderCount = 0;
        let thisMonthOrderCount = 0;
        let thisYearOrderCount = 0;
        let thisYearSale = 0;
        let thisMonthSale = 0;
        let thisWeekSale = 0;
        let overAllSale = 0;
        let todaySale = 0;
        for (let x of products) {
            if (x.vendor_id.isActive === "Active") {
                productCount++;
            }
        }
        let customer = await customerModel.find({ isDeleted: false });
        customerCount += customer.length;
        let vendors = await vendorModel.find({ isActive: "Active" });
        vendorCount += vendors.length;

        let todayMS = getDateStrToMS(new Date());

        let orders = await orderModel.find().populate("order_status_id");
        for (let x of orders) {
            console.log(x);
            if (getDateStrToMS(x.order_date) === todayMS) {
                todayOrderCount++;
                if (x.order_status_id.status !== "PENDING" && x.order_status_id.status !== "CANCELLED") {
                    todaySale += x.grand_total;
                }
            }
            if (getDateStrToMS(x.order_date) >= getCurrentWeek()[0] && getDateStrToMS(x.order_date) <= getCurrentWeek()[1]) {
                thisWeakOrderCount++;
                if (x.order_status_id.status !== "PENDING" && x.order_status_id.status !== "CANCELLED") {
                    thisWeekSale += x.grand_total;
                }
            }
            if (getDateStrToMS(x.order_date) >= getCurrentMonth()[0] && getDateStrToMS(x.order_date) <= getCurrentMonth()[1]) {
                thisMonthOrderCount++;
                if (x.order_status_id.status !== "PENDING" && x.order_status_id.status !== "CANCELLED") {
                    thisMonthSale += x.grand_total;
                }
            }
            if (getDateStrToMS(x.order_date) >= getCurrentYear()[0] && getDateStrToMS(x.order_date) <= getCurrentYear()[1]) {
                thisYearOrderCount++;
                if (x.order_status_id.status !== "PENDING" && x.order_status_id.status !== "CANCELLED") {
                    thisYearSale += x.grand_total;
                }
            }
            if (x.order_status_id.status !== "PENDING" && x.order_status_id.status !== "CANCELLED") {
                overAllSale += x.grand_total;
            }
            orderCount++;
        }

        let data = {
            productCount,
            customerCount,
            vendorCount,
            todayOrderCount,
            thisWeakOrderCount,
            thisMonthOrderCount,
            thisYearOrderCount,
            thisYearSale,
            thisMonthSale,
            thisWeekSale,
            todaySale,
            overAllSale,
            overallOrder: orderCount,
        };
        return res.status(200).send({ status: true, data: { ...data }, message: "Dashboard data fetched" });
    } catch (error) {
        return res.status(500).send({ status: false, message: error.message });
    }
};

module.exports = { getDashboardData };
