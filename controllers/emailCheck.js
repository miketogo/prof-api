const jwt = require('jsonwebtoken');
// const TelegramBot = require('node-telegram-bot-api');
const Promise = require("bluebird");
const moment = require('moment-timezone');

const User = require('../models/user');
const NotFoundError = require('../errors/not-found-err');
const ConflictError = require('../errors/сonflict-err');
const InvalidDataError = require('../errors/invalid-data-err');
const AuthError = require('../errors/auth-err');
const mailer = require('../nodemailer');
const regEmailHtml = require('../emails/regEmail')
const sendEmail = require('../models/sendEmail');


// // replace the value below with the Telegram token you receive from @BotFather
// const botToken = '1917275192:AAFfAT_ggb_QS8Shwp6G2aNbuid69pfSNQ4';

// // Create a bot that uses 'polling' to fetch new updates
// const bot = new TelegramBot(botToken, {polling: false});


const jwtEmailSecretPhrase = process.env.JWT_EMAIL_SECRET;
const apiLink = 'http://renat-hamatov.ru/emailCheck/'
const opts = {
  new: true,
  runValidators: true,
};

module.exports.sendMailAgain = (req, res, next) => {
  User.findById(req.user._id).orFail(() => new Error('NotFound'))
    .then((user) => {
      const emailToken = jwt.sign({ _id: user._id }, jwtEmailSecretPhrase, { expiresIn: '7d' });

      const title = 'Подтвердите адресс электронной почты'
      const text = `Подтвердите адрес электронной почты
  
Пожалуйста нажмите кнопку или перейдите по ссылке ниже для подтверждения адреса электронной почты
${apiLink}${emailToken}`
      let date = moment().tz("Europe/Moscow").format('D.MM.YYYY  HH:mm')
      let time_ms = Number(moment().tz("Europe/Moscow").format('x'))
      if (user.regEmailAgainSentDate) {
        const lastMailDate = user.regEmailAgainSentDate.split('.')
        if (time_ms - Number(moment(`${lastMailDate[1]}.${lastMailDate[0]}.${lastMailDate[2]}`).format('x')) <= 30000) {
          throw new Error('ToFast')
        } else {

          sendEmail.create({
            title: title,
            text: text,
            date,
            to_user: user._id,
          })
          const massage = {
            to: user.email,
            subject: title,
            text: text,
            html: `${regEmailHtml(emailToken, apiLink, user.firstname)}`
          }
          res.status(200).send({ user })
          mailer(massage)
        }
      } else {
        User.findByIdAndUpdate(user._id, { regEmailAgainSentDate: date }, opts)
          .then((user) => {
            sendEmail.create({
              title: title,
              text: text,
              date,
              to_user: user._id,
            })
            const massage = {
              to: user.email,
              subject: title,
              text: text,
              html: `${regEmailHtml(emailToken, apiLink, user.firstname)}`
            }
            res.status(200).send({ user })
            mailer(massage)

          })
          .catch(next)
      }

    })
    .catch((err) => {
      console.log(err)
      if (err.message === 'NotFound') {
        throw new NotFoundError('Нет пользователя с таким id');
      }
      if (err.message === 'ToFast') {
        throw new ConflictError('Запрос отправки email идет с интервалом 30 сек.');
      }
      if (err.name === 'ValidationError' || err.name === 'CastError') {
        throw new InvalidDataError('Переданы некорректные данные при поиске пользователя по id');
      }
    })
    .catch(next)
}

module.exports.verifyEmail = (req, res, next) => {
  const { token } = req.params
  try {
    // попытаемся верифицировать токен
    payload = jwt.verify(token, jwtEmailSecretPhrase);
  } catch (err) {
    // отправим ошибку, если не получилось
    throw new AuthError('Неправильный токен');
  }
  User.findByIdAndUpdate(payload._id, { emailVerified: true }, opts).orFail(() => new Error('NotFound'))
    .then((user) => {
      // bot.deleteMessage('388856114', '4106')
      // .then((res)=>{
      //   console.log(res)
      // })
      // .catch((error) => {
      //   console.log(error.code);  // => 'ETELEGRAM'
      //   console.log(error.response.body); // => { ok: false, error_code: 400, description: 'Bad Request: chat not found' }
      // });
      res.redirect("http://surikov.mesto.students.nomoredomains.monster")
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

