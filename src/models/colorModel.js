const mongoose = require('mongoose');
const ObjectId = mongoose.Schema.Types.ObjectId;

const colorSchema = new mongoose.Schema({
    colorName:{
        type: String,
        trim:true,
        unique:true
    },
    colorHex: {
        type: String,
        trim:true,
        unique:true
    },
    products:[
        {
            type:ObjectId,
            ref:'Product'
        }
    ],
    isDeleted:{
        type:Boolean,
        default:false,
    }
}, {timestamps: true});

module.exports = mongoose.model('Color', colorSchema);