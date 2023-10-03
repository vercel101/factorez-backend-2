const mongoose = require('mongoose');
const ObjectId = mongoose.Schema.Types.ObjectId;

const documentSchema = new mongoose.Schema({
    brandRegDoc: {
        type: String,
    },

    gstRegDoc: {
        type: String,
    },
    actionTakenBy:{
        type:ObjectId,
        ref:'Admin'
    }
},
{timestamps: true})

module.exports = mongoose.model('Document', documentSchema);