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
        type: String,
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
    howReceived: {
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
                type: String,
                required: true,
            },
            appeal_previous_status: {
                type: String,
                required: true,
                enum: ['waiting', 'in_work', 'done', 'rejected']
            },
            appeal_new_status: {
                type: String,
                required: true,
                enum: ['waiting', 'in_work', 'done', 'rejected']
            },

        }
    ],
    type:{
        type: String,
        required: true,
        enum: ['complaint', 'statement']
    }
});

// создаём модель и экспортируем её
module.exports = mongoose.model('appeal', appealSchema);
