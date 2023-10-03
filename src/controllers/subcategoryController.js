const categoryModel = require("../models/categoryModel");
const subcategoryModel = require("../models/subcategoryModel");
const productModel = require("../models/productModel");

const { isValid } = require("../utils/utils");
const { isValidObjectId } = require("mongoose");

// ADD CATEGORY
const addSubcategory = async (req, res) => {
  try {
    let data = req.body;
    let { subcategory_name, categoryId } = data;

    if (!isValid(subcategory_name)) {
      return res
        .status(400)
        .send({ status: false, message: "subcategory is required" });
    }


    let isSubcategoryExists = await subcategoryModel.findOne({
      subcategory_name: subcategory_name,
    });

    if (isSubcategoryExists) {
      return res.status(400).send({
        status: false,
        message:
          "This subcategory already exists, please add a new subcategory",
      });
    }

    let subcategoryData = {
      subcategory_name,
      categoryId,
    };

    let subcategory = await subcategoryModel.create(subcategoryData);
    return res
      .status(201)
      .send({ status: true, message: "success", data: subcategory });
  } catch (error) {
    return res.status(500).send({ status: false, message: error.message });
  }
};

// GET ALL SUBCATEGORIES
const getAllSubcategories = async (req, res) => {
  try {
    let subcategories = await subcategoryModel.find({ isDeleted: false });

    return res.status(200).send({ status: true, data: subcategories });
  } catch (error) {
    return res.status(500).send({ status: false, message: error.message });
  }
};

// GET SUBCATEGORY BY SUBCATEGORY ID
const getSubcategoryById = async (req, res) => {
  try {
    let subcategoryId = req.params.subcategoryId;
    let subcategory = await subcategoryModel.findOne({ _id: subcategoryId });

    if (!subcategory) {
      return res
        .status(404)
        .send({ status: false, message: "Subcategory not found" });
    }

    return res.status(200).send({ status: true, data: subcategory });
  } catch (error) {
    return res.status(500).send({ status: false, message: error.message });
  }
};


// UPDATE SUBCATEGORY BY SUBCATEGORY ID
const updateSubcatById = async (req, res) => {
  try {
    let subcategoryId = req.params.subcategoryId;
    if (!isValidObjectId(subcategoryId)) {
      return res.status(400).send({ status: false, message: 'Invalid subcategory id' })
    }

    let subcategory = await subcategoryModel.findOne({ _id: subcategoryId });

    if (!subcategory) {
      return res.status(404).send({ status: false, message: 'Subcategory not found'})
    }

    let body = req.body;

    if ("subcategory_name" in body) {
      subcategory.subcategory_name = body.subcategory_name
    }

  } catch (error) {
    return res.status(500).send({ status: false, message: error.message });
  }
}

module.exports = { addSubcategory, getAllSubcategories, getSubcategoryById, updateSubcatById };
