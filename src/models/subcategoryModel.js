const mongoose = require('mongoose');
const ObjectId = mongoose.Schema.Types.ObjectId;

const subcategorySchema = new mongoose.Schema({
            subcategory_name: {
                type: String, required: true,
            },
            productId: [{
                type: ObjectId, ref: 'Product',
            }],
            isDeleted: {
                type: Boolean,
                default:
                    false
            },

            deletedAt: {
                type: Date,
                default:
                    null,
            }

        },
        {
            timestamps: true
        }
    )
;

module.exports = mongoose.model('Subcategory', subcategorySchema);