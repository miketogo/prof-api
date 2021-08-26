const moment =  require('moment-timezone');

const User = require('../models/user');
const NotFoundError = require('../errors/not-found-err');
const ConflictError = require('../errors/сonflict-err');
const InvalidDataError = require('../errors/invalid-data-err');
const AuthError = require('../errors/auth-err');
const Appeal = require('../models/appeal');
const mailer = require('../nodemailer');
const appealCreateEmailHtml = require('../emails/appelCreateEmail')

const { NODE_ENV, JWT_SECRET } = process.env;

// const massage = {
//     to: email,
//     subject: 'Ваше обращение принято в обработку',
//     text: `Отслеживать статус обращения можно в разделе Мои обращения.

//     При изменении статуса вам будет отправлено письмо.`, //!! ИСПРАВИТЬ АДРЕСС ПОТОМ
//     html: `${appealCreateEmailHtml(status, date, text)}`
//   }
//   mailer(massage)

// const opts = {
//     new: true,
//     runValidators: true,
// };

module.exports.getAppeals = (req, res, next) => {
    Appeal.find({})
        .then((appeals) => res.status(200).send({ appeals }))
        .catch(next);
};

module.exports.createAppeal = (req, res, next) => {
    const {
        text, image,
    } = req.query;
    User.findById(req.user._id).orFail(() => new Error('NotFound'))
    .then((user)=>{
        if (user.emailVerified){
            Appeal.create({
                text, image, owner: user._id, // записываем хеш в базу
            })
                .then((appeal) => {
                    let status;
                    if (appeal.status === 'waiting'){
                        status = 'В ожидании'
                    } else if (appeal.status === 'in_work'){
                        status = 'В работе'
                    } else if (appeal.status === 'done'){
                        status = 'Выполнено'
                    } else if (appeal.status === 'rejected'){
                        status = 'Отклонено'
                    }
                    const moscowDate = moment(appeal.dateOfRequest).tz("Europe/Moscow")
                    
                    const revertDate = moscowDate.toISOString().split('T')[0]
                    const date = `${revertDate.split('-')[2]}.${revertDate.split('-')[1]}.${revertDate.split('-')[0]}`
                    const massage = {
                        to: user.email,
                        subject: 'Ваше обращение принято в обработку',
                        text: `Отслеживать статус обращения можно в разделе Мои обращения.
                    
                        При изменении статуса вам будет отправлено письмо.`, //!! ИСПРАВИТЬ АДРЕСС ПОТОМ
                        html: `${appealCreateEmailHtml(status, date, appeal.text)}`
                      }
                      mailer(massage)
                    res.send({ appeal });
                }
                )
                .catch((err) => {
                    if (err.name === 'ValidationError') {
                        throw new InvalidDataError('Переданы некорректные данные при создании обращения');
                    }
                })
                .catch(next);
        } else {
            throw new Error('EmailError');
        }
        
    })
    .catch((err)=>{
        if (err.message === 'NotFound') {
            throw new NotFoundError('Нет пользователя с таким id');
          }
          if (err.message === 'EmailError') {
            throw new AuthError('Email не подтвержден, для доступа к этой функции подтвердите email');
          }
    })
    .catch(next)
    
};

module.exports.getUserAppeals = (req, res, next) => {
    console.log(req.user._id)
    Appeal.find({ owner: req.user._id })
        .then((appeals) => res.status(200).send({ appeals }))
        .catch(next);
};