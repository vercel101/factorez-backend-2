const mongoose = require('mongoose');
const ObjectId = mongoose.Schema.Types.ObjectId;


const cancelledReasonSchema = new mongoose.Schema({
    questions: {
        type: ObjectId,
        ref: 'Question',
    },

    customerAnswer: {
        type: String,
    }
}, {timestamps: true});

module.exports = mongoose.model('Cancelled_Reason', cancelledReasonSchema);