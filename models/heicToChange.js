const mongoose = require('mongoose');
const validator = require('validator');
// Опишем схему:
const heicToChangeSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },  
});

// создаём модель и экспортируем её
module.exports = mongoose.model('heicToChange', heicToChangeSchema);
