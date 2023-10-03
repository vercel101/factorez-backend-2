const mongoose = require('mongoose');
const ObjectId = mongoose.Schema.Types.ObjectId;

const articleSchema = new mongoose.Schema({
    article_name: {
        type: String,
        required: true,
    },

    productId: [
        {
            type: ObjectId,
            ref: 'Product',
        }
    ],
    isDeleted: {
        type: Boolean,
        default: false
    },

    deletedAt: {
        type: Date,
        default: null,
    }
    
}, {timestamps: true});

module.exports = mongoose.model('Article', articleSchema);