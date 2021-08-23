const mongoose = require('mongoose');
const validator = require('validator');
// Опишем схему:
const appealSchema = new mongoose.Schema({
    text: {
        type: String,
        required: true,
    },
    image: {
        type: String,
        required: true,
        default: 'not image',
    },
    date: {
        type: Date,
        default: Date.now,
        required: true,
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true,
    },
    status: {
        type: String,
        required: true,
        default: 'waiting'
    },
});

// создаём модель и экспортируем её
module.exports = mongoose.model('appeal', appealSchema);
