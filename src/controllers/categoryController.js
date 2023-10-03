const categoryModel = require("../models/categoryModel");
const subcategoryModel = require("../models/subcategoryModel");
const productModel = require("../models/productModel");

const { isValid } = require("../utils/utils");
const { isValidObjectId } = require("mongoose");

// ADD CATEGORY
const addCategory = async (req, res) => {
   try {
      let data = req.body;
      let { category_name, subCategory } = data;

      if (!isValid(category_name)) {
         return res
            .status(400)
            .send({ status: false, message: "category is required" });
      }

      let category = await categoryModel.findOne({
         category_name: category_name,
      });

      if (category) {
         return res.status(400).send({
            status: false,
            message:
               "This category is already exists, please enter a new category",
         });
      }
      let subCategories = await subcategoryModel.insertMany(subCategory);

      let categoryData = {
         category_name: category_name,
         sub_category: subCategories,
      };

      let newCategory = await categoryModel.create(categoryData);

      return res
         .status(201)
         .send({ status: true, message: "success", data: newCategory });
   } catch (error) {
      return res.status(500).send({ status: false, message: error.message });
   }
};

// GET ALL CATEGORIES
const getAllCategories = async (req, res) => {
   try {
      let categories = await categoryModel
         .find({ isDeleted: false })
         .populate("sub_category");
      return res.status(200).send({ status: true, data: categories });
   } catch (error) {
      return res.status(500).send({ status: false, message: error.message });
   }
};

// GET CATEGORY BY CATEGORY ID
const getCategoryById = async (req, res) => {
   try {
      let categoryId = req.params.categoryId;
      if (!isValidObjectId(categoryId)) {
         return res
            .status(400)
            .send({ status: false, message: "Invalid categoryId" });
      }

      let category = await categoryModel.findOne({
         _id: categoryId,
         isDeleted: false,
      });

      if (!category) {
         return res
            .status(404)
            .send({ status: false, message: "Category not found" });
      }

      return res
         .status(200)
         .send({ status: true, message: "success", data: category });
   } catch (error) {
      return res.status(500).send({ status: false, message: error.message });
   }
};

// UPDATE CATEGORY BY CATEGORY ID
const updateCategoryById = async (req, res) => {
   try {
      let categoryId = req.params.categoryId;

      if (!isValidObjectId(categoryId)) {
         return res
            .status(400)
            .send({ status: false, message: "invalid category id" });
      }

      let category = await categoryModel
         .findOne({ _id: categoryId })
         .populate("sub_category");

      if (!category) {
         return res
            .status(404)
            .send({ status: false, message: "Category not found" });
      }
      let { category_name, subCategory } = req.body;

      console.log(subCategory, "sub category1");
      console.log(category.sub_category, "sub category2");
      category.sub_category.forEach(async (el) => {
         let isFound = false;
         subCategory.forEach((innerEl) => {
            if (innerEl.hasOwnProperty("_id")) {
               if (innerEl._id === el._id.toHexString()) {
                  isFound = true;
               }
            }
         });
         if (!isFound) {
            console.log(el._id);
            await subcategoryModel.findOneAndUpdate(
               { _id: el._id, isDeleted: false },
               { isDeleted: true, deletedAt: Date.now() },
               { new: true }
            );
         }
      });
      let subCategoryCreated = [];
      for (const objs of subCategory) {
         if (!objs.hasOwnProperty("_id")) {
            let xId = await subcategoryModel.create(objs);
            subCategoryCreated.push(xId);
         } else {
            subCategoryCreated.push(objs);
         }
      }

      category.category_name = category_name;
      category.sub_category = subCategoryCreated;

      console.log(subCategoryCreated, "crate arr");
      await category.save();
      return res
         .status(200)
         .send({
            status: true,
            message: "success",
            data: "Category updated successfully",
         });
   } catch (error) {
      return res.status(500).send({ status: false, message: error.message });
   }
};

// DELETE CATEGORY BY CATEGORY ID
const deleteCategoryById = async (req, res) => {
   try {
      let categoryId = req.params.categoryId;
      if (!isValidObjectId(categoryId)) {
         return res
            .status(400)
            .send({ status: false, message: "Invalid category id" });
      }

      let category = await categoryModel.findOne({ _id: categoryId });

      if (!category) {
         return res
            .status(404)
            .send({ status: false, message: "Category not found" });
      }

      let deleteCategory = await categoryModel.findOneAndUpdate(
         {
            _id: categoryId,
            isDeleted: false,
         },
         {
            isDeleted: true,
            deletedAt: new Date(),
         },
         { new: true }
      );

      if (!deleteCategory) {
         return res.status(404).send({
            status: false,
            message: "category not found or already deletec",
         });
      }

      return res.status(200).send({ status: true, message: "success" });
   } catch (error) {
      return res.status(500).send({ status: false, message: error.message });
   }
};

module.exports = {
   addCategory,
   getAllCategories,
   getCategoryById,
   updateCategoryById,
   deleteCategoryById,
};
