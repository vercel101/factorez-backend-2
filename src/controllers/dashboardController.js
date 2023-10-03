const HomepageModel = require("../models/HomepageModel");
const businessModel = require("../models/businessModel");
const categoryModel = require("../models/categoryModel");
const productModel = require("../models/productModel");
const colorModel = require("../models/colorModel");
const getDashboardData = async (req, res) => {
    try {
        let recommendedProduct = await HomepageModel.find().populate(["featuredProduct", "newArrival", "bestSelling"]);
        let storeInfo = await businessModel.find();
        let category = await categoryModel.find().populate("sub_category");
        let color = await colorModel.find();
        storeInfo[0].defaultGST = undefined;
        storeInfo[0].gsts = undefined;
        let data = {
            recommendedProduct: recommendedProduct[0],
            storeInfo: storeInfo[0],
            category,
            color,
        };
        return res.status(200).send({ status: true, message: "success", data: data });
    } catch (error) {
        return res.status(500).send({ status: false, message: error.message });
    }
};

const getProductBySlug= async (req, res) => {
    try {
        let slug = req.params.slug;
        // console.log(slug);
        let product = await productModel.findOne({slug:slug, isDeleted:false, stockStatus:'In_stock'}).populate(["color_id", "categoryId","brandId","vendor_id"]);
        // console.log(product);
        if (product) {
            return res.status(200).send({ message: "product info fetched", data: product });
        } else {
            return res.status(200).send({ message: "product info fetched", data: null });
        }
    } catch (error) {
        return res.status(500).send({ status: false, message: error.message });
    }
};

module.exports = { getDashboardData,getProductBySlug };
