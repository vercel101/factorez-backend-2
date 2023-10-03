const mongoose = require('mongoose');
const ObjectId = mongoose.Schema.Types.ObjectId;

const ratingSchema = new mongoose.Schema({
    productId: {
        type: ObjectId,
        ref: 'Product'
    },

    rating: {
        type: Number,
    },

    comment: {
        type: String,
    },

    commentedBy: {
        type: ObjectId,
        ref: 'Customer'
    }
}, {timestamps: true});

module.exports = mongoose.model('Rating', ratingSchema);