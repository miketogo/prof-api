const jwt = require('jsonwebtoken');
// const TelegramBot = require('node-telegram-bot-api');
const Promise = require("bluebird");

const User = require('../models/user');
const NotFoundError = require('../errors/not-found-err');
const ConflictError = require('../errors/сonflict-err');
const InvalidDataError = require('../errors/invalid-data-err');
const AuthError = require('../errors/auth-err');


// // replace the value below with the Telegram token you receive from @BotFather
// const botToken = '1917275192:AAFfAT_ggb_QS8Shwp6G2aNbuid69pfSNQ4';

// // Create a bot that uses 'polling' to fetch new updates
// const bot = new TelegramBot(botToken, {polling: false});

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
   .then((user) => {
    // bot.deleteMessage('388856114', '4106')
    // .then((res)=>{
    //   console.log(res)
    // })
    // .catch((error) => {
    //   console.log(error.code);  // => 'ETELEGRAM'
    //   console.log(error.response.body); // => { ok: false, error_code: 400, description: 'Bad Request: chat not found' }
    // });
    res.redirect("https://vk.com/surbek")
   })    //!! СДЕЛАТЬ ПЕРЕАДРЕАЦИЮ
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

