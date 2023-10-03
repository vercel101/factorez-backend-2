const mongoose = require('mongoose');
const ObjectId = mongoose.Schema.Types.ObjectId;

const logisticsSchema = new mongoose.Schema({
    pincode: {
        type: String,
        required: true,
    },

    zone: {
        type: String,
        required: true,
    },

    city: {
        type: String,
        required: true,
    },

    state: {
        type: String,
        required: true,
    },

    COD: {
        type: Boolean,
    },

    prepaid: {
        type: Boolean,
    },

    reverse: {
        type: Boolean,
    },
},
{timestamps: true})

module.exports = mongoose.model('Logistics', logisticsSchema);