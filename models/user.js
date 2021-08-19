const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
// Опишем схему:
const userSchema = new mongoose.Schema({
    firstname: {
        type: String,
        required: true,
        minlength: 2,
        maxlength: 30,
    },
    secondname: {
        type: String,
        required: true,
        minlength: 2,
        maxlength: 30,
    },
    house: {
        type: String,
        required: true,
        minlength: 2,
        maxlength: 30,
    },
    flat: {
        type: Number,
        required: true,
    },
    user_rights: {
        type: String,
        minlength: 2,
        maxlength: 30,
        default: 'default',
        select: false,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        validate: {
            validator(v) {
                return validator.isEmail(v);
            },
        },
    },
    password: {
        type: String,
        required: true,
        select: false,
    },
    telegram_id: {
        type: String,
        unique: true,
        default: 'not connected',
        select: false,
    },
});

// eslint-disable-next-line func-names
userSchema.statics.findUserByCredentials = function (email, password) {
    return this.findOne({ email }).select('+password')
        .then((user) => {
            if (!user) {
                return Promise.reject(new Error('Неправильные почта или пароль'));
            }

            return bcrypt.compare(password, user.password)
                .then((matched) => {
                    if (!matched) {
                        return Promise.reject(new Error('Неправильные почта или пароль'));
                    }

                    return user; // теперь user доступен
                });
        });
};

// создаём модель и экспортируем её
module.exports = mongoose.model('user', userSchema);
