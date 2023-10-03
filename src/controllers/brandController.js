const brandModel = require("../models/brandModel");
const vendorModel = require("../models/vendorModel");
const { isValid } = require("../utils/utils");
const { isValidObjectId } = require("mongoose");
const productModel = require("../models/productModel");
// ADD BRAND DETAILS
const addBrand = async (req, res) => {
    try {
        let data = req.body;
        let { brand_name, vendor_id, brandLogo } = data;
        if (!isValid(brand_name)) {
            return res.status(400).send({ status: false, message: "Brand Name is required" });
        }

        let brand = await brandModel.findOne({
            brand_name: brand_name,
        });
        if (brand) {
            return res.status(400).send({
                status: false,
                message: "This category is already exists, please enter a new category",
            });
        }
        let vendor = await vendorModel.findOne({ vendor_unique_id: vendor_id });
        let logoUrl = null;
        if (req.files) {
            logoUrl = await uploadFile(req.files.brandLogo);
        } else {
            logoUrl = brandLogo;
        }
        let brandData = {
            brand_name: brand_name,
            vendor_id: vendor,
            brandLogo: logoUrl,
        };

        let newBrand = await brandModel.create(brandData);
        vendor.brand_id.push(newBrand);
        await vendor.save();

        return res.status(201).send({ status: true, message: "success", data: newBrand });
    } catch (error) {
        return res.status(500).send({ status: false, message: error.message });
    }
};

// GET ALL BRANDS
const getAllBrands = async (req, res) => {
    try {
        let brands = null;
        if (req.userModel === "VENDOR") {
            brands = await brandModel.find({ isDeleted: false, vendor_id: req.userId }).populate("vendor_id");
        } else {
            brands = await brandModel.find({ isDeleted: false }).populate("vendor_id");
        }
        return res.status(200).send({ status: true, data: brands });
    } catch (error) {
        return res.status(500).send({ status: false, message: error.message });
    }
};

const getAllBrandByVendor = async (req, res) => {
    try {
        if (req.userModel === "VENDOR") {
            let vendor = await vendorModel.findOne({ vendor_unique_id: req.params.vendorId }).populate("brand_id");
            if (!vendor) {
                return res.status(400).send({
                    status: false,
                    message: "Vendor Not Found",
                });
            }
            return res.status(200).send({ status: true, data: vendor.brand_id });
        } else {
            return res.status(400).send({
                status: false,
                message: "Bad Request",
            });
        }
    } catch (error) {
        return res.status(500).send({ status: false, message: error.message });
    }
};

const verifyBrandById = async (req, res) => {
    try {
        let brandId = req.params.brandId;
        let brandStatus = req.body.brandStatus;
        if (req.userModel === "Super Admin" || req.userModel === "ADMIN") {
            let brand = await brandModel.findById(brandId);
            if (!brand) {
                return res.status(400).send({ status: false, data: "Bad request" });
            }
            brand.brandStatus = brandStatus;
            await brand.save();
            return res.status(202).send({ status: true, data: "Brand status change successfully" });
        } else {
            return res.status(400).send({ status: false, data: "Bad request" });
        }
    } catch (error) {
        return res.status(500).send({ status: false, message: error.message });
    }
};

module.exports = { addBrand, getAllBrands, getAllBrandByVendor, verifyBrandById };
