const ratingModel = require("../models/ratingModel");
const productModel = require("../models/productModel");
const customerModel = require("../models/customerModel");

const { isValid } = require("../utils/utils");

// ADD RATING
const addRating = async (req, res) => {
  try {
    let data = req.body;

    let { productId, rating, comment, commentedBy } = data;

    let ratingData = {
      productId,
      rating,
      comment,
      commentedBy,
    };

    let isRatingExists = await ratingModel.findOne({
      productId: productId,
      commentedBy: commentedBy,
    });

    if (isRatingExists) {
      return res.status(400).send({
        status: false,
        message: "This customer has already given rating to this product",
      });
    } else {
      let newComment = await (
        await ratingModel.create(ratingData)
      ).populate("commentedBy");

      return res
        .status(201)
        .send({ status: true, message: "success", data: newComment });
    }
  } catch (error) {
    return res.status(500).send({ status: false, message: error.message });
  }
};

// GET ALL RATINGS
const getAllRatings = async (req, res) => {
  try {
    let productId = req.params.productId;
    let ratings = await ratingModel.find({ productId: productId });

    if (!ratings.length) {
      return res
        .status(404)
        .send({ status: false, message: "No rating found" });
    }

    let averageRating;
    let ratingSum = 0;
    for (let i = 0; i < ratings.length; i++) {
      ratingSum += ratings[i].rating;
    }
    averageRating = ratingSum / ratings.length;
    return res
      .status(200)
      .send({ status: true, data: ratings, averageRating: averageRating });
  } catch (error) {
    return res.status(500).send({ status: false, message: error.message });
  }
};

module.exports = { addRating, getAllRatings };