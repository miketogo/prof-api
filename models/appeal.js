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
    dateOfRequest: {
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
        default: 'waiting',
        enum: ['waiting', 'in_work', 'done', 'rejected']
    },
    rejectReason: {
        type: String,
    },
    howReceived:{
        type: String,
        required: true,
    },
    adminsChangedStatus: [
        {
            admin_id: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'user',
                required: true,
            },
            time: {
                type: Date,
            },
            appeal_previous_status: {
                type: String,
                required: true,
                enum: ['waiting', 'in_work', 'done', 'rejected']
            } ,
            appeal_new_status: {
                type: String,
                required: true,
                enum: ['waiting', 'in_work', 'done', 'rejected']
            },
            
        }
    ]
});

// создаём модель и экспортируем её
module.exports = mongoose.model('appeal', appealSchema);
