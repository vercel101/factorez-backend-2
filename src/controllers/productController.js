const { isValidObjectId } = require("mongoose");
const request = require("request");
const productModel = require("../models/productModel");
const vendorModel = require("../models/vendorModel");
const brandModel = require("../models/brandModel");
const categoryModel = require("../models/categoryModel");
const subCategoryModel = require("../models/subcategoryModel");
const { isValid } = require("../utils/utils");
const { uploadFile } = require("./imageController");
const { calculateMarginAndSelling } = require("../utils/percentage");

const uploadMultipleImage = async (blob) => {
    let imageFile = await uploadFile(blob);
    return imageFile;
};

// ADD PRODUCT
const addProduct = async (req, res) => {
    try {
        let data = req.body;
        let {
            product_name,
            sku_code,
            hsn_code,
            brandId,
            color,
            categoryId,
            subCatId,
            stockStatus,
            lotSizeQty,
            mrp,
            seller_price,
            gst,
            sellingGST,
            margin,
            qty_in_hand,
            min_order_qty,
            sole,
            material,
            packing_type,
            made_in,
            weight,
            description,
            meta,
            vendor_id,
        } = data;

        if (!isValid(product_name)) {
            return res.status(400).send({ status: false, message: "Product name is required" });
        }

        if (!isValid(sku_code)) {
            return res.status(400).send({ status: false, message: "SKU code is required" });
        }
        if (!isValid(hsn_code)) {
            return res.status(400).send({ status: false, message: "HSN code is required" });
        }

        if (!isValid(mrp)) {
            return res.status(400).send({ status: false, message: "Product MRP is required" });
        }
        if (!isValid(gst)) {
            return res.status(400).send({ status: false, message: "GST is required" });
        }
        if (!isValid(brandId)) {
            return res.status(400).send({ status: false, message: "Brand ID is required" });
        }

        if (!isValid(seller_price)) {
            return res.status(400).send({ status: false, message: "Seller price is required" });
        }

        if (!isValid(categoryId)) {
            return res.status(400).send({ status: false, message: "Category ID is required" });
        }

        if (!isValid(subCatId)) {
            return res.status(400).send({
                status: false,
                message: "Sub category ID is required",
            });
        }

        if (!isValid(stockStatus)) {
            return res.status(400).send({ status: false, message: "Stock status is required" });
        }
        if (!isValid(lotSizeQty)) {
            return res.status(400).send({ status: false, message: "Lot size is required" });
        }

        if (!isValid(qty_in_hand)) {
            return res.status(400).send({
                status: false,
                message: "Quantity in hand is required",
            });
        }

        if (!isValid(min_order_qty)) {
            return res.status(400).send({
                status: false,
                message: "Minimum order quantity is required",
            });
        }

        if (!isValid(color)) {
            return res.status(400).send({ status: false, message: "Product color is required" });
        }

        if (!isValid(sole)) {
            return res.status(400).send({
                status: false,
                message: "Sole material type is required",
            });
        }

        if (!isValid(material)) {
            return res.status(400).send({ status: false, message: "Upper material is required" });
        }

        if (!isValid(min_order_qty)) {
            return res.status(400).send({
                status: false,
                message: "Minimum order quantity is required",
            });
        }

        if (!isValid(packing_type)) {
            return res.status(400).send({ status: false, message: "Packing type is required" });
        }

        if (!isValid(made_in)) {
            return res.status(400).send({ status: false, message: "Made in is required" });
        }

        if (req.userModel === "ADMIN") {
            if (!isValid(sellingGST)) {
                return res.status(400).send({
                    status: false,
                    message: "Selling GST is required",
                });
            }
            if (!isValid(margin)) {
                return res.status(400).send({ status: false, message: "Margin is required" });
            }
            if (!isValid(vendor_id)) {
                return res.status(400).send({
                    status: false,
                    message: "Vendor id is required",
                });
            }
        }

        if (meta !== undefined) {
            meta = JSON.parse(meta);
        }
        let productData = {
            product_name,
            sku_code,
            brandId,
            gst,
            hsn_code,
            color_id: JSON.parse(color),
            categoryId,
            subCatId,
            stockStatus,
            lotSizeQty: JSON.parse(lotSizeQty),
            mrp,
            seller_price,
            qty_in_hand,
            min_order_qty,
            sole,
            material,
            packing_type,
            made_in,
            weight,
            description,
        };
        if (req.userModel === "ADMIN") {
            productData.sellingGST = sellingGST;
            productData.margin = margin;
            productData.status = "Approved";
        }
        if (meta !== undefined) {
            productData.meta_title = meta.metaTitle;
            productData.meta_keywords = meta.metaKeyword;
            productData.meta_description = meta.metaDescription;
        }
        if (req.body.vendorId !== undefined) {
            productData.vendor_id = req.body.vendorId;
        } else {
            productData.vendor_id = req.userId;
        }

        let multipleImage = [];
        if (req.files && req.files.thumbnail) {
            productData.thumbnail_pic = await uploadFile(req.files.thumbnail);
        } else if (data.thumbnail !== undefined) {
            productData.thumbnail_pic = data.thumbnail;
        }
        if (req.files && req.files.mulImg) {
            multipleImage = req.files.mulImg;
            let images = [];
            if (Array.isArray(multipleImage)) {
                for (let val of multipleImage) {
                    let img = await uploadMultipleImage(val);
                    images.push(img);
                }
            } else {
                let img = await uploadMultipleImage(multipleImage);
                images.push(img);
            }
            productData.multiple_pics = images;
            // console.log(images);
        } else if (data.mulImg !== undefined) {
            productData.multiple_pics = data.mulImg;
        }
        // console.log(data);
        let brandObj = await brandModel.findById(brandId);
        let categoryObj = await categoryModel.findById(categoryId);
        let subCatObj = await subCategoryModel.findById(subCatId);

        if (!brandObj || !categoryObj || !subCatObj) {
            return res.status(400).send({
                status: false,
                message: "Brand, aritcle, category or subcategory id had some error",
            });
        }
        brandId = brandObj;
        categoryId = categoryObj;
        subCatId = subCatObj;

        let product = await productModel.create(productData);
        let vendor = null;
        if (req.userModel === "ADMIN") {
            vendor = await vendorModel.findById(vendor_id);
            product.vendor_id = vendor._id;
        } else {
            vendor = await vendorModel.findById(req.userId);
            product.vendor_id = vendor._id;
        }
        vendor.products.push(product);
        await vendor.save();
        await product.save();
        return res.status(201).send({ status: true, message: "Success", data: product });
    } catch (error) {
        return res.status(500).send({ status: false, message: error.message });
    }
};

// GET ALL PRODUCTS
const getAllProducts = async (req, res) => {
    try {
        let data = [];
        if (req.userModel === "VENDOR") {
            let products = await productModel.find({ isDeleted: false, vendor_id: req.userId }).populate(["color_id", "categoryId", "subCatId", "brandId"]);
            data = products;
        } else {
            let products = await productModel.find({ isDeleted: false }).populate(["color_id", "categoryId", "subCatId", "brandId", "vendor_id"]);
            for (let x of products) {
                if (x.vendor_id.status === "Approved") {
                    data.push(x);
                }
            }
        }
        return res.status(200).send({ status: true, data: data });
    } catch (error) {
        return res.status(500).send({ status: false, message: error.message });
    }
};

const getAllProductsForDashboard = async (req, res) => {
    try {
        let products = await productModel
            .find({
                isDeleted: false,
                stockStatus: "In_stock",
                status: "Approved",
            })
            .populate(["color_id", "categoryId", "subCatId", "brandId", "vendor_id"]);

        let data = [];
        for (let x of products) {
            if (x.vendor_id.status === "Approved") {
                data.push(x);
            }
        }
        return res.status(200).send({ status: true, data: data });
    } catch (error) {
        return res.status(500).send({ status: false, message: error.message });
    }
};
const getAllProductsForFilter = async (req, res) => {
    try {
        products = await productModel
            .find({
                isDeleted: false,
                stockStatus: "In_stock",
                status: "Approved",
            })
            .populate(["color_id", "categoryId", "subCatId", "brandId", "vendor_id"]);
        return res.status(200).send({ status: true, data: products });
    } catch (error) {
        return res.status(500).send({ status: false, message: error.message });
    }
};

// GET PRODUCT BY PRODUCT ID
const getProductById = async (req, res) => {
    try {
        let productId = req.params.productId;
        let product = null;
        if (req.userModel === "VENDOR") {
            product = await productModel.findOne({
                _id: productId,
                isDeleted: false,
                vendor_id: req.userId,
            });
        } else {
            product = await productModel.findOne({
                _id: productId,
                isDeleted: false,
            });
        }
        return res.status(200).send({ status: true, data: product });
    } catch (error) {
        return res.status(500).send({ status: false, message: error.message });
    }
};

// UPDATE PRODUCT BY PRODUCT ID
const updateProductByProductId = async (req, res) => {
    try {
        let productId = req.params.productId;
        if (!isValidObjectId(productId)) {
            return res.status(400).send({ status: false, message: "Invalid product id" });
        }

        let product = await productModel.findOne({
            _id: productId,
            isDeleted: false,
        });

        if (!product) {
            return res.status(404).send({ status: false, message: "Product not found" });
        }

        let body = req.body;

        if ("product_name" in body) {
            product.product_name = body.product_name;
        }

        if ("sku_code" in body) {
            product.sku_code = body.sku_code;
        }

        if ("description" in body) {
            product.description = body.description;
        }

        if ("mrp" in body) {
            product.mrp = body.mrp;
        }

        if ("seller_price" in body) {
            product.seller_price = body.seller_price;
        }

        if ("selling_price" in body) {
            product.selling_price = body.selling_price;
        }

        if ("gst_amount" in body) {
            product.gst_amount = body.gst_amount;
        }

        if ("stock_status" in body) {
            product.stockStatus = body.stock_status;
        }

        if ("qty_in_hand" in body) {
            product.qty_in_hand = body.qty_in_hand;
        }

        if ("min_order_qty" in body) {
            product.min_order_qty = body.min_order_qty;
        }

        if ("size_qty" in body) {
            product.size_qty = body.size_qty;
        }

        if ("color" in body) {
            product.color = body.color;
        }

        if ("style" in body) {
            product.style = body.style;
        }

        if ("sole" in body) {
            product.sole = body.sole;
        }

        if ("material" in body) {
            product.material = body.material;
        }

        if ("packing_type" in body) {
            product.packing_type = body.packing_type;
        }

        if ("made_in" in body) {
            product.made_in = body.made_in;
        }

        if ("primary_category" in body) {
            product.primary_category = body.primary_category;
        }

        if ("weight" in body) {
            product.weight = body.weight;
        }

        if ("category" in body) {
            product.categoryId = body.category;
        }

        if ("meta_title" in body) {
            product.meta_title = body.meta_title;
        }

        if ("meta_description" in body) {
            product.meta_description = body.meta_description;
        }

        if ("status" in body) {
            product.status = body.status;
        }

        await product.save();

        return res.status(200).send({ status: true, message: "success", data: product });
    } catch (error) {
        return res.status(500).send({ status: false, message: error.message });
    }
};

// DELETE PRODUCT BY PRODUCT ID
const deleteProductByProductId = async (req, res) => {
    try {
        let productId = req.params.productId;
        if (!isValidObjectId) {
            return res.status(400).send({ status: false, message: "Invalid product id" });
        }

        let product = await productModel.findOne({
            _id: productId,
            isDeleted: false,
        });

        if (!product) {
            return res.status(404).send({ status: false, message: "Product not found" });
        }

        let deleteProduct = await productModel.findOneAndUpdate(
            {
                _id: productId,
                isDeleted: false,
            },
            {
                isDeleted: true,
                deletedAt: new Date(),
            },
            { new: true }
        );

        if (!deleteProduct) {
            return res.status(404).send({
                status: false,
                message: "Product not found or already deleted",
            });
        }

        return res.status(200).send({ status: true, message: "Product deleted successfully" });
    } catch (error) {
        return res.status(500).send({ status: false, message: error.message });
    }
};

const changeProductStatus = async (req, res) => {
    try {
        let { newStatus, margin, sellingGST } = req.body;
        let productId = req.params.productId;
        let product = await productModel.findById(productId);
        if (!product) {
            return res.status(400).send({
                status: false,
                message: "Bad request",
            });
        }
        product.status = newStatus;
        if (newStatus === "Approved") {
            if (!margin || !sellingGST) {
                return res.status(400).send({
                    status: false,
                    message: "Bad request",
                });
            }
            product.margin = margin;
            product.sellingGST = sellingGST;
            product.selling_price = product.seller_price;
        } else {
            product.margin = undefined;
            product.sellingGST = undefined;
            product.selling_price = undefined;
        }
        await product.save();
        return res.status(200).send({ status: true, message: "Product updated successfully" });
    } catch (error) {
        return res.status(500).send({ status: false, message: error.message });
    }
};

const changeProductStockStatus = async (req, res) => {
    try {
        let { newStockStatus } = req.body;
        let productId = req.params.productId;
        let product = await productModel.findById(productId);
        if (!product) {
            return res.status(400).send({
                status: false,
                message: "Bad request",
            });
        }
        product.stockStatus = newStockStatus;
        await product.save();
        return res.status(200).send({
            status: true,
            message: "Product Stock Status updated successfully",
        });
    } catch (error) {
        return res.status(500).send({ status: false, message: error.message });
    }
};

const csvProduct = async (req, res) => {
    try {
        return res.status(200).send({
            status: true,
            message: "Product Stock Status updated successfully",
            data: "xlsxUrl",
        });
    } catch (error) {
        return res.status(500).send({ status: false, message: error.message });
    }
};

const updateProduct = async (req, res) => {
    try {
        let productId = req.params.productId;
        let {
            product_name,
            sku_code,
            hsn_code,
            description,
            mrp,
            gst,
            seller_price,
            sellingGST,
            margin,
            qty_in_hand,
            min_order_qty,
            lotSizeQty,
            color_id,
            sole,
            material,
            packing_type,
            made_in,
            weight,
            categoryId,
            subCatId,
        } = req.body;

        let product = await productModel.findById(productId);
        if (product_name) {
            product.product_name = product_name;
        }
        if (sku_code) {
            product.sku_code = sku_code;
        }
        if (hsn_code) {
            product.hsn_code = hsn_code;
        }
        if (description) {
            product.description = description;
        }
        if (mrp) {
            product.mrp = mrp;
        }
        if (gst) {
            product.gst = gst;
        }
        if (seller_price) {
            product.seller_price = seller_price;
        }
        if (sellingGST) {
            product.sellingGST = sellingGST;
        }
        if (margin) {
            product.margin = margin;
        }
        if (qty_in_hand) {
            product.qty_in_hand = qty_in_hand;
        }
        if (min_order_qty) {
            product.min_order_qty = min_order_qty;
        }
        if (lotSizeQty) {
            product.lotSizeQty = lotSizeQty.split(",");
        }
        if (color_id) {
            console.log(color_id);
            product.color_id = color_id;
        }
        if (sole) {
            product.sole = sole;
        }
        if (material) {
            product.material = material;
        }
        if (packing_type) {
            product.packing_type = packing_type;
        }
        if (made_in) {
            product.made_in = made_in;
        }
        if (weight) {
            product.weight = weight;
        }
        if (categoryId) {
            product.categoryId = categoryId;
        }
        if (subCatId) {
            product.subCatId = subCatId;
        }
        if (req.files) {
            let { thumbnail_pic, multiple_pics } = req.files;
            if (thumbnail_pic) {
                product.thumbnail_pic = await uploadFile(thumbnail_pic);
            }
            if (multiple_pics) {
                if (multiple_pics.length) {
                    let images = [];
                    for (let singleFile of multiple_pics) {
                        let x = await uploadMultipleImage(singleFile);
                        images.push(x);
                    }
                    product.multiple_pics = images;
                } else {
                    let x = await uploadFile(multiple_pics);
                    product.multiple_pics = [x];
                }
            }
        }
        await product.save();
        return res.status(201).send({
            status: true,
            message: "Product updated successfully",
        });
    } catch (error) {
        return res.status(500).send({ status: false, message: error.message });
    }
};

module.exports = {
    addProduct,
    getAllProducts,
    getProductById,
    updateProductByProductId,
    deleteProductByProductId,
    getAllProductsForDashboard,
    changeProductStatus,
    changeProductStockStatus,
    csvProduct,
    getAllProductsForFilter,
    updateProduct,
};
