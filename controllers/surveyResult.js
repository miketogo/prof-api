const moment = require('moment-timezone');

const SurveyResult = require('../models/surveyResult');
const NotFoundError = require('../errors/not-found-err');
const ConflictError = require('../errors/сonflict-err');
const InvalidDataError = require('../errors/invalid-data-err');
const AuthError = require('../errors/auth-err');

const opts = {
  new: true,
  runValidators: true,
};

module.exports.getResults = (req, res, next) => {
  SurveyResult.find({})
    .then((results) => res.status(200).send({ results }))
    .catch(next);
};

module.exports.createAnswer = (req, res, next) => {
  const {
    firstname, secondname, email, phone, address, area, homeOrg, monthPay
  } = req.body;
  const realDate = new Date
  let date = moment(realDate.toISOString()).tz("Europe/Moscow").format('D.MM.YYYY  HH:mm')
  SurveyResult.create({
    firstname, secondname, email, phone, address, area, homeOrg, date , monthPay
  })
    .then((result) => res.status(200).send({ result }))
    .catch((err) => {
      if (err.name === 'MongoError' && err.code === 11000) {
        throw new ConflictError('При регистрации указан email, который уже существует на сервере');
      }
      if (err.name === 'ValidationError') {
        throw new InvalidDataError('Переданы некорректные данные при создании пользователя');
      }
    })
    .catch(next);
};
