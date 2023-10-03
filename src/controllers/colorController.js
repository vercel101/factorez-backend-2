const colorModel = require('../models/colorModel');
const addNewColor = async (req, res) => {
    try {
        let {colorName, colorHex} = req.body;
        if (colorName === "") {
            return res
                .status(400)
                .send({message: "Color Name is required", status: false});
        }
        if (colorHex === "") {
            return res
                .status(400)
                .send({message: "Color Hex is required", status: false});
        }

        let colors = await colorModel.find({
            $or: [{colorName: colorName}, {colorHex: colorHex}],
        });

        if(colors.length > 0) {
            return res.status(400).send({
                message: "This color is already exists",
                status: false,
            });
        }
        await colorModel.create({colorName: colorName, colorHex: colorHex});
        return res.status(201).send({status: true, message: 'Color added successfully'});
    } catch (error) {
        return res.status(500).send({status: false, message: error.message});
    }
}

const deleteColorById = async (req, res) => {
    try {
        let colorId = req.params.colorId;
        let color = await colorModel.findById(colorId);
        if (!color) {
            return res.status(400).send({status: false, message: "Bad Request"});
        }
        color.isDeleted = true;
        await color.save();
        return res.status(202).send({status: true, message: 'Color deleted successfully'});
    } catch (error) {
        return res.status(500).send({status: false, message: error.message});
    }
}

const getAllColor = async (req, res) => {
    try {
        let colors = await colorModel.find({isDeleted:false});
        return res.status(200).send({status: true, message: 'Color fetched successfully', data: colors});
    } catch (error) {
        return res.status(500).send({status: false, message: error.message});
    }
}

module.exports = {addNewColor, deleteColorById, getAllColor}