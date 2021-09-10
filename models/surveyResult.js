const mongoose = require('mongoose');
const validator = require('validator');
// Опишем схему:
const surveyResultSchema = new mongoose.Schema({
    firstname: {
        type: String,
        required: true,
        minlength: 1,

    },
    secondname: {
        type: String,
        required: true,
        minlength: 1,

    },
    address: {
        type: String,
        required: true,
        minlength: 2,
    },
    area: {
        type: Number,
        required: true,
    },
    phone: {
        type: String,
        required: true,
        minlength: 2,
    },
    email: {
        type: String,
        required: true,
        validate: {
            validator(v) {
                return validator.isEmail(v);
            },
        },
    },
    homeOrg:{
        type: String,
        required: true,
        minlength: 2,
    },
    date:{
        type: String,
        required: true,
    },
    monthPay:{
        type: String,
        required: true,
    }
});

// создаём модель и экспортируем её
module.exports = mongoose.model('surveyResult', surveyResultSchema);
