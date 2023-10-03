const articleModel = require("../models/articleModel");
const brandModel = require("../models/brandModel");
const { isValid } = require("../utils/utils");
const { isValidObjectId } = require("mongoose");
// ADD BRAND DETAILS
const addArtical = async (req, res) => {
   try {
      let data = req.body;
      let { brandId, articles, vendor_id } = data;

      let brand = await brandModel.findOne({_id:brandId, vendor_id:vendor_id});
      if (!brand) {
         return res.status(400).send({
            status: false,
            message:
               "Not a valid Brand",
         });
      }
      let articlesCreated = await articleModel.insertMany(articles);

      let brandData = {
         brand_name: brand_name,
         articles: articlesCreated,
      };

      let newBrand = await brandModel.create(brandData);

      return res
         .status(201)
         .send({ status: true, message: "success", data: newBrand });
   } catch (error) {
      return res.status(500).send({ status: false, message: error.message });
   }
};

// GET ALL BRANDS
const getAllBrands = async (req, res) => {
   try {
      let brands = await brandModel
         .find({ isDeleted: false })
         .populate("articles");
      return res.status(200).send({ status: true, data: brands });
   } catch (error) {
      return res.status(500).send({ status: false, message: error.message });
   }
};
const updateBrandById = async (req, res) => {
   try {
      let brandId = req.params.brandId;

      if (!isValidObjectId(brandId)) {
         return res
            .status(400)
            .send({ status: false, message: "invalid brand id" });
      }

      let brand = await brandModel
         .findOne({ _id: brandId })
         .populate("articles");

      if (!brand) {
         return res
            .status(404)
            .send({ status: false, message: "Brand not found" });
      }
      let { brand_name, articles } = req.body;

      for (const el of brand.articles) {
         let isFound = false;
         articles.forEach((innerEl) => {
            if (innerEl.hasOwnProperty("_id")) {
               if (innerEl._id === el._id.toHexString()) {
                  isFound = true;
               }
            }
         });
         if (!isFound) {
            await articleModel.findOneAndUpdate(
               { _id: el._id, isDeleted: false },
               { isDeleted: true, deletedAt: Date.now() },
               { new: true }
            );
         }
      }
      let articlesCreated = [];
      for (const objs of articles) {
         if (!objs.hasOwnProperty("_id")) {
            let xId = await articleModel.create(objs);
            articlesCreated.push(xId);
         } else {
            articlesCreated.push(objs);
         }
      }

      brand.brand_name = brand_name;
      brand.articles = articlesCreated;

      await brand.save();
      return res
         .status(200)
         .send({
            status: true,
            message: "success",
            data: "Brand Updated Successfully",
         });
   } catch (error) {
      return res.status(500).send({ status: false, message: error.message });
   }
};

module.exports = { addBrand, getAllBrands, updateBrandById };
