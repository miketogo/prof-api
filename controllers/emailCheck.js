const User = require('../models/user');
const NotFoundError = require('../errors/not-found-err');
const ConflictError = require('../errors/сonflict-err');
const InvalidDataError = require('../errors/invalid-data-err');
const AuthError = require('../errors/auth-err');
const jwt = require('jsonwebtoken');

const { NODE_ENV, JWT_SECRET } = process.env;
const jwtSecretPhrase = NODE_ENV !== 'production' ? 'e20f5a33bee3a1991d9da7e4db38281f9e97b36e0b1293af2c58035fbe34075f' : JWT_SECRET;

const opts = {
    new: true,
    runValidators: true,
};

module.exports.verifyEmail = (req, res, next) => {
   const { token } = req.params
   try {
    // попытаемся верифицировать токен
    payload = jwt.verify(token, jwtSecretPhrase);
  } catch (err) {
    // отправим ошибку, если не получилось
    throw new AuthError('Неправильный токен');
  }
   User.findByIdAndUpdate(payload._id, {emailVerified: true}, opts).orFail(() => new Error('NotFound'))
   .then(() => res.redirect("https://vk.com/surbek"))    //!! СДЕЛАТЬ ПЕРЕАДРЕАЦИЮ
   .catch((err) => {
     if (err.message === 'NotFound') {
       throw new NotFoundError('Нет пользователя с таким id');
     }
     if (err.name === 'ValidationError' || err.name === 'CastError') {
       throw new InvalidDataError('Переданы некорректные данные при поиске пользователя по id');
     }
   })
   .catch(next);
};

