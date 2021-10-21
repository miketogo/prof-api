const mongoose = require('mongoose');
// Опишем схему:
const houseSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    formValue: {
        type: String,
        required: true,
        unique: true,
    },
    city: {
        type: String,
        required: true,
    },
    address: {
        type: String,
        required: true,
    },
    entranceArray: {
        type: Array,
        required: true,
    },
    statements: [
        {
            name: {
                type: String,
                required: true,
            },
            value: {
                type: String,
                required: true,
            },
        }
    ],
});

// создаём модель и экспортируем её
module.exports = mongoose.model('house', houseSchema);
