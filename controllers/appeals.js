const moment = require('moment-timezone');
const multer = require('multer')
const path = require('path')


const User = require('../models/user');
const NotFoundError = require('../errors/not-found-err');
const ConflictError = require('../errors/сonflict-err');
const InvalidDataError = require('../errors/invalid-data-err');
const AuthError = require('../errors/auth-err');
const Appeal = require('../models/appeal');
const HeicToChange = require('../models/heicToChange');
const mailer = require('../nodemailer');
const appealCreateEmailHtml = require('../emails/appelCreateEmail')
const appealCreateEmailWithImgHtml = require('../emails/appealCreateEmailWithImg')
const appelChangeStatusEmailHtml = require('../emails/appelChangeStatusEmail')
const appelRejectEmailHtml = require('../emails/appelRejectEmail');
const appelStatmentOrderEmailHtml = require('../emails/appelStatmentOrderEmail');
const appelStatmentRejectEmailHtml = require('../emails/appelStatmentRejectEmail');
const sendEmail = require('../models/sendEmail');


const { NODE_ENV, JWT_SECRET } = process.env;
const opts = {
    new: true,
    runValidators: true,
};



// async function heicToJpg(file, output) {
//     console.log(file, output);
//     const inputBuffer = await promisify(fs.readFile)(file);
//     const outputBuffer = convert({
//         buffer: inputBuffer, // the HEIC file buffer
//         format: 'PNG', // output format
//     });
//     return promisify(fs.writeFile)(output, outputBuffer);
// }
module.exports.uploadImage = (req, res, next) => {
    let fileName
    let fileNameWithExt
    let fileExt
    const storage = multer.diskStorage({
        destination: (req, file, cb) => {
            const ext = path.extname(file.originalname);
            if (ext === '.heic') {
                cb(null, 'uploads/heic')
            } else {
                cb(null, 'uploads')
            }
        },
        filename: (req, file, cb) => {
            fileName = `${req.user._id}_${Date.now()}`
            fileExt = `${path.extname(file.originalname)}`
            fileNameWithExt = `${fileName}${path.extname(file.originalname)}`
            if (fileExt === '.heic') {
                HeicToChange.create({ name: fileName })
                    .then(cb(null, fileNameWithExt))
                    .catch(next)
            }
            else {
                cb(null, fileNameWithExt)
            }


        }
    })

    const upload = multer({
        storage,
        limits: { fileSize: 10 * 1024 * 1024 },
        fileFilter: (req, file, cb) => {
            const ext = path.extname(file.originalname);
            if (ext !== '.jpg' && ext !== '.jpeg' && ext !== '.png' && ext !== '.heic') {
                const err = new Error('ExtentionError')
                return cb(err)
            }
            cb(null, true)
        }
    }).single('image')

    upload(req, res, err => {
        const formData = req.body;
        console.log(req.body)
        let error = err
        if (err && err.code === 'LIMIT_FILE_SIZE') {
            error = 'Слишком большое изображение';
        }
        if (err && err.message === 'ExtentionError') {
            error = 'Можно загружать только картинки(png, jpg, jpeg)';
        }
        if (err) {
            console.log(err)
            res.status(err.code).send({ error: err.message })
        } else {
            req.text = formData.text
            if (fileExt === '.heic') {
                req.imageLink = `/uploads/${fileName}.jpg`
                setTimeout(next, 7000);
            } else {
                req.imageLink = `/uploads/${fileNameWithExt}`
                setTimeout(next, 2000)
            }
        }

    })
}
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

        const realDate = new Date
        let date = moment(realDate.toISOString()).tz("Europe/Moscow").format('D.MM.YYYY  HH:mm')
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
                        let date = moment(realDate.toISOString()).tz("Europe/Moscow").format('D.MM.YYYY  HH:mm')

                        if (appeal.type === 'complaint') {
                            let statusText
                            if (status === 'waiting') {
                                statusText = 'В ожидании'
                            } else if (status === 'in_work') {
                                statusText = 'В работе'
                            } else if (status === 'done') {
                                statusText = 'Выполнено'
                            }
                            let title = 'Статус вашего обращения изменен'
                            let text = `Статус вашего обращения изменен на: ${statusText}
                            
Отслеживать статус обращения можно в разделе Мои обращения.
При изменении статуса Вам будет отправлено письмо.`
                            const massage = {
                                to: appeal.owner.email,
                                subject: title,
                                text: text, //!! ИСПРАВИТЬ АДРЕСС ПОТОМ
                                html: `${appelChangeStatusEmailHtml(`Статус вашего обращения изменен на: ${statusText}`, statusText, date, appeal.text)}`
                            }
                            sendEmail.create({
                                title: title,
                                text: text,
                                to_user: appeal.owner._id,
                                date
                            })

                            mailer(massage)
                        } else if (appeal.type === 'statement') {
                            let statusText
                            if (appeal.status === 'waiting') {
                                statusText = 'В ожидании'
                            } else if (appeal.status === 'in_work') {
                                statusText = 'В работе'
                            } else if (appeal.status === 'done') {
                                statusText = 'Доставлено до почтового ящика ✅'
                            }
                            let title = 'Изменился статус вашей справки'
                            let text = `Отслеживать статус изготовления справки можно в разделе Мои Справки.
                            
При изменении статуса Вам будет отправлено письмо.`
                            const massage = {
                                to: appeal.owner.email,
                                subject: title,
                                text: text, //!! ИСПРАВИТЬ АДРЕСС ПОТОМ
                                html: `${appelStatmentOrderEmailHtml('Изменился статус вашей справки', statusText, date, appeal.text.substring(15))}`
                            }
                            sendEmail.create({
                                title: title,
                                text: text,
                                to_user: appeal.owner._id,
                                date
                            })

                            mailer(massage)
                        }



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
        let date = moment(realDate.toISOString()).tz("Europe/Moscow").format('D.MM.YYYY  HH:mm')
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
                        const date = moment(realDate.toISOString()).tz("Europe/Moscow").format('D.MM.YYYY  HH:mm')
                        if (appeal.type === 'complaint') {
                            const title = 'Ваше обращение было отклонено'
                            const text = `Статус Вашего обращения изменен на: ${statusText}
    
    Причина: ${rejectReason.trim()}
    
    Отслеживать статус обращения можно в разделе Мои обращения.
    При изменении статуса Вам будет отправлено письмо.`
                            sendEmail.create({
                                title: title,
                                text: text,
                                date,
                                to_user: appeal.owner._id,
                            })
                            const massage = {
                                to: appeal.owner.email,
                                subject: title,
                                text: text, //!! ИСПРАВИТЬ АДРЕСС ПОТОМ
                                html: `${appelRejectEmailHtml(`Статус вашего обращения изменен на: ${statusText}`, rejectReason.trim(), statusText, date, appeal.text)}`
                            }
                            mailer(massage)
                        } else if (appeal.type === 'statement') {
                            const title = 'Запрос на изготовление справки был отклонен'
                            const text = `Статус изготовления справки изменен на: ${statusText}
    
    Причина: ${rejectReason.trim()}
    
    Отслеживать статус изготовление справки можно в разделе Мои Справки.
    При изменении статуса Вам будет отправлено письмо.`
                            sendEmail.create({
                                title: title,
                                text: text,
                                date,
                                to_user: appeal.owner._id,
                            })
                            const massage = {
                                to: appeal.owner.email,
                                subject: title,
                                text: text, //!! ИСПРАВИТЬ АДРЕСС ПОТОМ
                                html: `${appelStatmentRejectEmailHtml(`Статус изготовления справки изменен на: ${statusText}`, rejectReason.trim(), statusText, date, appeal.text.substring(15))}`
                            }
                            mailer(massage)
                        }


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

module.exports.createAppealComplaint = (req, res, next) => {
    let {
        text, image
    } = req.body;
    if (req.text && req.imageLink) {
        text = req.text
        image = req.imageLink
    }
    if (image === '/uploads/undefined') {
        image = 'not image'
    }

    User.findById(req.user._id).orFail(() => new Error('NotFound'))
        .then((user) => {
            if (user.emailVerified) {
                let howReceived
                if (!req.chat_id) {
                    howReceived = 'Через сайт'
                } else {
                    howReceived = 'Через телеграм бота'
                }
                const realDate = new Date
                let date = moment(realDate.toISOString()).tz("Europe/Moscow").format('D.MM.YYYY  HH:mm')
                Appeal.create({
                    text: text.trim(),
                    image,
                    owner: user._id,
                    dateOfRequest: date,
                    howReceived: howReceived,
                    type: 'complaint' // записываем хеш в базу
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

                        const title = 'Ваше обращение принято в обработку'
                        const text = `Отслеживать статус обращения можно в разделе Мои обращения.
                        
При изменении статуса Вам будет отправлено письмо.`
                        sendEmail.create({
                            date,
                            title: title,
                            text: text,
                            to_user: req.user._id,
                        })
                        if (!image || image === 'not image') {
                            const massage = {
                                to: user.email,
                                subject: title,
                                text: text, //!! ИСПРАВИТЬ АДРЕСС ПОТОМ
                                html: `${appealCreateEmailHtml('Ваше обращение принято в обработку', status, date, appeal.text)}`
                            }
                            mailer(massage)
                        } else {
                            const massage = {
                                to: user.email,
                                subject: title,
                                text: text, //!! ИСПРАВИТЬ АДРЕСС ПОТОМ
                                html: `${appealCreateEmailWithImgHtml('Ваше обращение принято в обработку', status, date, appeal.text, `https://api-prof.ru${image}`)}`
                            }
                            mailer(massage)
                        }

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

module.exports.createAppealStatement = (req, res, next) => {
    let {
        value,
    } = req.body;

    User.findById(req.user._id).orFail(() => new Error('NotFound'))
        .populate('house')
        .then((user) => {

            if (user.emailVerified) {
                let howReceived
                if (!req.chat_id) {
                    howReceived = 'Через сайт'
                } else {
                    howReceived = 'Через телеграм бота'
                }
                const statementData = user.house.statements.filter(function (item) {
                    return item.value.trim() === value.trim()
                });

                if (statementData.length === 0) {

                    throw new Error('StatementNotFound');
                } else {
                    const realDate = new Date
                    let date = moment(realDate.toISOString()).tz("Europe/Moscow").format('D.MM.YYYY  HH:mm')
                    console.log(statementData[0].name.trim())
                    Appeal.create({
                        text: `Заказ справки: "${statementData[0].name.trim()}"`,
                        owner: user._id,
                        dateOfRequest: date,
                        howReceived: howReceived,
                        type: 'statement' // записываем хеш в базу
                    })
                        .then((appeal) => {
                            let status;
                            if (appeal.status === 'waiting') {
                                status = 'В ожидании'
                            } else if (appeal.status === 'in_work') {
                                status = 'В работе'
                            } else if (appeal.status === 'done') {
                                status = 'Доставлено до почтового ящика ✅'
                            } else if (appeal.status === 'rejected') {
                                status = 'Отклонено'
                            }

                            const title = 'Заказ справки оформлен'
                            const text = `Отслеживать статус изготовления справки можно в разделе Мои Справки.
                            
При изменении статуса Вам будет отправлено письмо.`
                            sendEmail.create({
                                date,
                                title: title,
                                text: text,
                                to_user: req.user._id,
                            })

                            const massage = {
                                to: user.email,
                                subject: title,
                                text: text, //!! ИСПРАВИТЬ АДРЕСС ПОТОМ
                                html: `${appelStatmentOrderEmailHtml('Заказ справки оформлен', status, date, statementData[0].name.trim())}`
                            }
                            mailer(massage)


                            res.send({ appeal });
                        }
                        )
                        .catch((err) => {
                            console.log(err)
                            if (err.name === 'ValidationError') {
                                throw new InvalidDataError('Переданы некорректные данные при создании обращения');
                            }
                        })
                        .catch(next);
                }

            } else {
                throw new Error('EmailError');
            }

        })
        .catch((err) => {
            if (err.message === 'NotFound') {
                throw new NotFoundError('Нет пользователя с таким id');
            }
            if (err.message === 'StatementNotFound') {
                throw new NotFoundError('Нет справки с таким значением value');
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

