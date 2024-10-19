const mongoose = require('mongoose');

const CompanySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true
    },
    emailVerified: {
        type: Boolean,
        default: false
    },
    phoneVerified: {  // New field for phone verification
        type: Boolean,
        default: false
    },
});

module.exports = mongoose.model('Company', CompanySchema);
