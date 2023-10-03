const HomepageModel = require("../models/HomepageModel");

const addFeaturedProducts = async (req, res) => {
    try {
        let { newArrival, featuredProduct, bestSelling } = req.body;
        let home = await HomepageModel.find();
        if (home.length > 0) {
            if (featuredProduct) {
                if (!home[0].featuredProduct.includes(featuredProduct)) {
                    home[0].featuredProduct.push(featuredProduct);
                }
            }
            if (newArrival) {
                if (!home[0].newArrival.includes(newArrival)) {
                    home[0].newArrival.push(newArrival);
                }
            }
            if (bestSelling) {
                if (!home[0].bestSelling.includes(bestSelling)) {
                    home[0].bestSelling.push(bestSelling);
                }
            }
            await home[0].save();
        } else {
            let data = {};
            if (featuredProduct) {
                data.featuredProduct = featuredProduct;
            }
            if (newArrival) {
                data.newArrival = newArrival;
            }
            if (bestSelling) {
                data.bestSelling = bestSelling;
            }
            await HomepageModel.create(data);
        }

        return res.status(200).send({ status: true, message: "Product Added to respective sections..." });
    } catch (error) {
        return res.status(500).send({ status: false, message: error.message });
    }
};
const getFeaturedProduct = async (req, res) => {
    try {
        let products = await HomepageModel.find().populate([
            { path: "featuredProduct", model: "Product", populate: { path: "vendor_id", model: "Vendor" } },
            { path: "bestSelling", model: "Product", populate: { path: "vendor_id", model: "Vendor" } },
            { path: "newArrival", model: "Product", populate: { path: "vendor_id", model: "Vendor" } },
        ]);
        return res.status(200).send({ status: true, message: "fetched...", data: products[0] ? products[0] : null });
    } catch (error) {
        return res.status(500).send({ status: false, message: error.message });
    }
};
const removeFeaturedProduct = async (req, res) => {
    try {
        let { key, id } = req.body;
        let home = await HomepageModel.find();
        if (home.length > 0) {
            if (key === "featuredProduct") {
                let idx = home[0].featuredProduct.findIndex((e) => e._id.toString() === id);
                if (idx >= 0) {
                    home[0].featuredProduct.splice(idx, 1);
                }
            }
            if (key === "bestSelling") {
                let idx = home[0].bestSelling.findIndex((e) => e._id.toString() === id);
                if (idx >= 0) {
                    home[0].bestSelling.splice(idx, 1);
                }
            }
            if (key === "newArrival") {
                let idx = home[0].newArrival.findIndex((e) => e._id.toString() === id);
                if (idx >= 0) {
                    home[0].newArrival.splice(idx, 1);
                }
            }
            await home[0].save();
        } else {
            return res.status(400).send({ status: false, message: "Bad request" });
        }
        return res.status(200).send({ status: true, message: "Removed..." });
    } catch (error) {
        return res.status(500).send({ status: false, message: error.message });
    }
};

module.exports = {
    addFeaturedProducts,
    getFeaturedProduct,
    removeFeaturedProduct,
};
