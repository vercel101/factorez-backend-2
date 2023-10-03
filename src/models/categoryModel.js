const mongoose = require('mongoose');
const ObjectId = mongoose.Schema.Types.ObjectId;

const categorySchema = new mongoose.Schema({
    category_name: {
        type: String,
        required: true,
    },

    sub_category: [{type:ObjectId, ref: 'Subcategory'}],

    isDeleted: {
        type: Boolean,
        default: false
    },

    deletedAt: {
        type: Date,
        default: null,
    }

}, { timestamps: true });

module.exports = mongoose.model('Category', categorySchema);