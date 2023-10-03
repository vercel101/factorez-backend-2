const mongoose = require('mongoose');

const csvSchema = new mongoose.Schema({
    name: {
        type: String,
    },
    email: {
        type: String,
    },
    mobile: {
        type: String,
    }
});

module.exports = mongoose.model('CSV', csvSchema);