const User = require('../models/user');
const NotFoundError = require('../errors/not-found-err');
const ConflictError = require('../errors/сonflict-err');
const InvalidDataError = require('../errors/invalid-data-err');
const AuthError = require('../errors/auth-err');
const Appeal = require('../models/appeal');

const { NODE_ENV, JWT_SECRET } = process.env;


const opts = {
    new: true,
    runValidators: true,
};

module.exports.getAppeals = (req, res, next) => {
    Appeal.find({})
        .then((appeals) => res.status(200).send({ appeals }))
        .catch(next);
};

module.exports.createAppeal = (req, res, next) => {
    const {
        text, image,
    } = req.body;
    Appeal.create({
        text, image, owner: req.user._id, // записываем хеш в базу
    })
        .then((appeal) => {
            res.send({ appeal });
        }
        )
        .catch((err) => {
            if (err.name === 'ValidationError') {
                throw new InvalidDataError('Переданы некорректные данные при создании пользователя');
            }
        })
        .catch(next);
};

module.exports.getUserAppeals = (req, res, next) => {
    console.log(req.user._id)
    Appeal.find({ owner: req.user._id })
        .then((appeals) => res.status(200).send({ appeals }))
        .catch(next);
};