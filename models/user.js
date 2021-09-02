const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const AuthError = require('../errors/auth-err');
// Опишем схему:
const userSchema = new mongoose.Schema({
    fullname: {
        type: String,
        required: true,
        minlength: 2
    },
    lastname: {
        type: String,
        required: true,
        minlength: 2
    },
    firstname: {
        type: String,
        required: true,
        minlength: 2
    },
    patronymic: {
        type: String,
        required: true,
        minlength: 2
    },
    flat: {
        type: Number,
        required: true,
        validate: { 
            validator(v) { 
                return v >= 1; 
            },
            message: 'Квартира должна быть больше или равна 1!', 
        }
    },
    entranceNumber: {
        type: Number,
        required: true,
        validate: { 
            validator(v) { 
                return v >= 1; 
            },
            message: 'Парадная должна быть больше или равна 1!', 
        }
    },
    user_rights: {
        type: String,
        minlength: 2,
        maxlength: 30,
        default: 'default',
        select: false,
        required: true,
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

    emailVerified:{
        type: Boolean,
        required: true,
        default: false,
    },
    phone:{
        type: String,
        required: true,
    }
    ,
    password: {
        type: String,
        required: true,
        select: false,
    },
    telegram_id: {
        type: String,
        default: '',
    },
    registrationDate: {
        type: String,
        required: true,
    },
    regEmailAgainSentDate: {
        type: String,
    },
    house: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'house',
        required: true,
    },
    meterReadings:[
        {
            time: {
                type: String,
            },
            hotWaterSupply: {
                type: Number,
            },
            coldWaterSupply: {
                type: Number,
            },
        }
    ]
});

// eslint-disable-next-line func-names
userSchema.statics.findUserByCredentials = function (email, password) {
    return this.findOne({ email }).select('+password')
        .then((user) => {
            if (!user) {
                return Promise.reject(new AuthError('Неправильные почта или пароль'));
            }

            return bcrypt.compare(password, user.password)
                .then((matched) => {
                    if (!matched) {
                        return Promise.reject(new AuthError('Неправильные почта или пароль'));
                    }

                    return user; // теперь user доступен
                });
        });
};

// создаём модель и экспортируем её
module.exports = mongoose.model('user', userSchema);
