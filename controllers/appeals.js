const moment = require('moment-timezone');

const User = require('../models/user');
const NotFoundError = require('../errors/not-found-err');
const ConflictError = require('../errors/сonflict-err');
const InvalidDataError = require('../errors/invalid-data-err');
const AuthError = require('../errors/auth-err');
const Appeal = require('../models/appeal');
const mailer = require('../nodemailer');
const appealCreateEmailHtml = require('../emails/appelCreateEmail')
const appelChangeStatusEmailHtml = require('../emails/appelChangeStatusEmail')

const { NODE_ENV, JWT_SECRET } = process.env;
const opts = {
    new: true,
    runValidators: true,
};

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
        .populate('owner')
        .then((appeals) => res.status(200).send({ appeals }))
        .catch(next);
};

module.exports.changeStatus = (req, res, next) => {
    const {
        status, appeal_id, rejectReason = 'Не указано',
    } = req.body;
    if (status === 'in_work' || status === 'done' || status === 'waiting') {
        let statusText
        if (status === 'waiting') {
            statusText = 'В ожидании'
        } else if (status === 'in_work') {
            statusText = 'В работе'
        } else if (status === 'done') {
            statusText = 'Выполнено'
        }
        const realDate = new Date
        let date = moment(realDate)
        console.log(date)
        Appeal.findById(appeal_id).orFail(() => new Error('NotFound'))
            .then((appeal) => {

                let adminsChangedStatus = {
                    admin_id: req.user._id,
                    time: date,
                    appeal_previous_status: appeal.status,
                    appeal_new_status: status,
                }
                let newAdminsChangedStatus = appeal.adminsChangedStatus
                newAdminsChangedStatus.push(adminsChangedStatus)
                console.log(newAdminsChangedStatus)
                Appeal.findByIdAndUpdate(appeal_id, {
                    status: status,
                    adminsChangedStatus: newAdminsChangedStatus,
                }, opts).orFail(() => new Error('NotFound'))
                    .populate(['adminsChangedStatus.admin_id', 'owner'])
                    .then((appeal) => {
                        const moscowDate = moment(date).tz("Europe/Moscow")
                        const revertDate = moscowDate.toISOString().split('T')[0]
                        const date = `${revertDate.split('-')[2]}.${revertDate.split('-')[1]}.${revertDate.split('-')[0]}`
                        const massage = {
                            to: appeal.owner.email,
                            subject: 'Статус вашего обращения изменен',
                            text: `Статус вашего обращения изменен на: ${statusText}
                            
                            Отслеживать статус обращения можно в разделе Мои обращения.
                            При изменении статуса Вам будет отправлено письмо.`, //!! ИСПРАВИТЬ АДРЕСС ПОТОМ
                            html: `${appelChangeStatusEmailHtml(`Статус вашего обращения изменен на: ${statusText}`, statusText, date, appeal.text)}`
                        }
                        mailer(massage)
                        res.status(200).send({ appeal })
                    })
                    .catch((err) => {
                        console.log(err)
                        if (err.message === 'NotFound') {
                            throw new NotFoundError('Нет пользователя с таким id');
                        }
                        if (err.name === 'ValidationError') {
                            throw new InvalidDataError('Переданы некорректные данные при создании обращения');
                        }
                    })
                    .catch(next)
            })
            .catch((err) => {
                console.log(err)
                if (err.message === 'NotFound') {
                    throw new NotFoundError('Нет пользователя с таким id');
                }
                if (err.name === 'ValidationError') {
                    throw new InvalidDataError('Переданы некорректные данные при создании обращения');
                }
            })
            .catch(next)
    } else if (status === 'rejected') {
        let statusText = 'Отклонено'
        const realDate = new Date
        let date = moment(realDate)
        console.log(date)
        Appeal.findById(appeal_id).orFail(() => new Error('NotFound'))
            .then((appeal) => {

                let adminsChangedStatus = {
                    admin_id: req.user._id,
                    time: date,
                    appeal_previous_status: appeal.status,
                    appeal_new_status: status,
                }

                let newAdminsChangedStatus = appeal.adminsChangedStatus
                newAdminsChangedStatus.push(adminsChangedStatus)
                console.log(newAdminsChangedStatus)
                Appeal.findByIdAndUpdate(appeal_id, {
                    status: status,
                    rejectReason: rejectReason.trim(),
                    adminsChangedStatus: newAdminsChangedStatus,
                }, opts).orFail(() => new Error('NotFound'))
                    .populate(['adminsChangedStatus.admin_id', 'owner'])
                    .then((appeal) => {
                        const moscowDate = moment(date).tz("Europe/Moscow")
                        const revertDate = moscowDate.toISOString().split('T')[0]
                        const date = `${revertDate.split('-')[2]}.${revertDate.split('-')[1]}.${revertDate.split('-')[0]}`
                        const massage = {
                            to: appeal.owner.email,
                            subject: 'Ваше обращение было отклонено',
                            text: `Статус вашего обращения изменен на: ${statusText}

                            Причина: ${rejectReason.trim()}

                            Отслеживать статус обращения можно в разделе Мои обращения.
                            При изменении статуса вам будет отправлено письмо.`, //!! ИСПРАВИТЬ АДРЕСС ПОТОМ
                            html: `${appelRejectEmailHtml(`Статус вашего обращения изменен на: ${statusText}`, rejectReason.trim(), statusText, date, appeal.text)}`
                        }
                        mailer(massage)
                        res.status(200).send({ appeal })
                    })
                    .catch((err) => {
                        console.log(err)
                        if (err.message === 'NotFound') {
                            throw new NotFoundError('Нет пользователя с таким id');
                        }
                        if (err.name === 'ValidationError') {
                            throw new InvalidDataError('Переданы некорректные данные при создании обращения');
                        }
                    })
                    .catch(next)
            })
            .catch((err) => {
                console.log(err)
                if (err.message === 'NotFound') {
                    throw new NotFoundError('Нет пользователя с таким id');
                }
                if (err.name === 'ValidationError') {
                    throw new InvalidDataError('Переданы некорректные данные при создании обращения');
                }
            })
            .catch(next)

    }
};

module.exports.createAppeal = (req, res, next) => {
    const {
        text, image,
    } = req.body;
    User.findById(req.user._id).orFail(() => new Error('NotFound'))
        .then((user) => {
            if (user.emailVerified) {
                const realDate = new Date
                let date = moment(realDate)
                Appeal.create({
                    text: text.trim(), image, owner: user._id, dateOfRequest: date // записываем хеш в базу
                })
                    .then((appeal) => {
                        let status;
                        if (appeal.status === 'waiting') {
                            status = 'В ожидании'
                        } else if (appeal.status === 'in_work') {
                            status = 'В работе'
                        } else if (appeal.status === 'done') {
                            status = 'Выполнено'
                        } else if (appeal.status === 'rejected') {
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
                            html: `${appealCreateEmailHtml('Ваше обращение принято в обработку', status, date, appeal.text)}`
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
        .catch((err) => {
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