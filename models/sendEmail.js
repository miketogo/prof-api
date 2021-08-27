const mongoose = require('mongoose');
const validator = require('validator');
// Опишем схему:
const sendEmailSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    text: {
        type: String,
        required: true,
    },
    date: {
        type: Date,
        default: Date.now,
        required: true,
    },
    to_user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true,
    },    
});

// создаём модель и экспортируем её
module.exports = mongoose.model('sendEmail', sendEmailSchema);
