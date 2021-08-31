const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const moment = require('moment-timezone');
const User = require('../models/user');
const NotFoundError = require('../errors/not-found-err');
const ConflictError = require('../errors/сonflict-err');
const InvalidDataError = require('../errors/invalid-data-err');
const AuthError = require('../errors/auth-err');
const House = require('../models/house');
const mailer = require('../nodemailer');
const regEmailHtml = require('../emails/regEmail')
const meterReadingsEmailHtml = require('../emails/meterReadingsEmail')
const sendEmail = require('../models/sendEmail');

const { NODE_ENV, JWT_SECRET } = process.env;

const apiLink = 'http://renat-hamatov.ru/emailCheck/'

const jwtSecretPhrase = NODE_ENV !== 'production' ? 'e20f5a33bee3a1991d9da7e4db38281f9e97b36e0b1293af2c58035fbe34075f' : JWT_SECRET;
const opts = {
  new: true,
  runValidators: true,
};

module.exports.getUsers = (req, res, next) => {
  User.find({})
    .populate('house')
    .then((users) => res.status(200).send({ users }))
    .catch(next);
};

module.exports.getSentEmails = (req, res, next) => {
  sendEmail.find({})
    .populate('to_user')
    .then((emails) => res.status(200).send({ emails }))
    .catch(next);
};

module.exports.createUser = (req, res, next) => {
  const {
    fullname, email, password, house, flat, phone,
  } = req.body;

  House.findOne({ formValue: house }).orFail(() => new Error('HouseNotFound'))
    .then((house) => {
      let entnum
      if (flat > house.entranceArray[house.entranceArray.length - 1]) {
        throw new Error('FlatDoesntExist')
      } else {
        for (let i = 0; i < house.entranceArray.length; i++) {

          if (flat <= house.entranceArray[i]) {
            console.log(i + 1);
            entnum = i + 1;
            break
          }
          continue
        }
      };
      let names = fullname.trim().split(/\s+/);
      if (names.length != 3) {
        throw new Error('NotCorrectFullname')
      }
      let emailLowerCase = email.toLowerCase();
      const realDate = new Date
      let date = moment(realDate.toISOString()).tz("Europe/Moscow").format('D.MM.YYYY  HH:mm')
      console.log(names, emailLowerCase, house, house._id)

      bcrypt.hash(password, 10)
        .then((hash) => User.create({
          fullname: fullname.trim(),
          lastname: names[0].trim(),
          firstname: names[1].trim(),
          patronymic: names[2].trim(),
          house: house._id,
          email: emailLowerCase.trim(),
          flat,
          registrationDate: date,
          entranceNumber: entnum,
          password: hash,
          phone: phone.trim(), // записываем хеш в базу
        }))
        .then(() => {
          return User.findUserByCredentials(emailLowerCase, password)
            .then((user) => {
              const token = jwt.sign({ _id: user._id }, jwtSecretPhrase, { expiresIn: '7d' });
              res.cookie('jwt', token, {
                maxAge: 3600000 * 24 * 7,
                httpOnly: true,
                sameSite: true,
              });
              const title = 'Подтвердите адресс электронной почты'
              const text = `Подтвердите адрес электронной почты
            
Пожалуйста нажмите кнопку или перейдите по ссылке ниже для подтверждения адреса электронной почты
${apiLink}${token}`
              sendEmail.create({
                title: title,
                text: text,
                date,
                to_user: user._id,
              })
              const massage = {
                to: emailLowerCase.trim(),
                subject: title,
                text: text,
                html: `${regEmailHtml(token, apiLink, user.firstname)}`
              }
              mailer(massage)
              res.send({ token });
            })
            .catch(next);
        }
        )
        .catch((err) => {
          if (err.name === 'MongoError' && err.code === 11000) {
            console.log(err)
            throw new ConflictError('При регистрации указан email, который уже существует на сервере');
          }
          if (err.name === 'ValidationError') {
            console.log(err)
            throw new InvalidDataError('Переданы некорректные данные при создании пользователя');
          }
        })
        .catch(next);
    })
    .catch((err) => {
      if (err.message === 'HouseNotFound') {
        throw new NotFoundError('Нет дома с таким formValue');
      }
      if (err.message === 'FlatDoesntExist') {
        throw new InvalidDataError('Такой квартиры нет в доме');
      }
      if (err.message === 'NotCorrectFullname') {
        throw new InvalidDataError('Переданны некоректные данные в поле fullname, оно должно содержать только Фамилию, Имя, и Отчество');
      }
    })
    .catch(next)


};

module.exports.getUserById = (req, res, next) => {
  User.findById(req.params.userId === 'me'
    ? req.user._id
    : req.params.userId).orFail(() => new Error('NotFound'))
    .populate('house')
    .then((user) => res.status(200).send({ user }))
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

module.exports.getUserByChatId = (req, res, next) => {
  const { chat_id } = req.params;
  User.findOne({ telegram_id: chat_id }).orFail(() => new Error('NotFound'))
    .populate('house')
    .then((user) => res.status(200).send({ user }))
    .catch((err) => {
      if (err.message === 'NotFound') {
        throw new NotFoundError('Нет пользователя с таким chat id');
      }
      if (err.name === 'ValidationError' || err.name === 'CastError') {
        throw new InvalidDataError('Переданы некорректные данные при поиске пользователя по chat id');
      }
    })
    .catch(next);
};

module.exports.updateMeterReadings = (req, res, next) => {
  User.findById(req.user._id).orFail(() => new Error('NotFound'))
    .then((user) => {
      const realDate = new Date
      let date = moment(realDate.toISOString()).tz("Europe/Moscow").format('D.MM.YYYY  HH:mm')
      const { hotWater, coldWater } = req.body;
      if (user.meterReadings.length === 0) {
        if (Number(date.split('.')[0]) >= 1 && Number(date.split('.')[0]) <= 31) {
          let meterReadings = {
            time: date,
            hotWaterSupply: hotWater,
            coldWaterSupply: coldWater,
          }
          User.findByIdAndUpdate(req.user._id, {
            meterReadings: meterReadings,
          }, opts).orFail(() => new Error('NotFound'))
            .then((user) => {
              res.status(200).send({ user })
              const title = 'Показания счётчиков приняты'
              const text = `Вы отправили показания счётчиков,

Посмотреть историю показаний можно в разделе "Мои счётчики".
Если Вы допустили ошибку при отправке, отправьте жалобу в разделе "Мои жалобы" с объяснением произошедшего`
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
                html: `${meterReadingsEmailHtml(title, hotWater, coldWater, date)}`
              }
              mailer(massage)
            })
            .catch((err) => {
              if (err.message === 'NotFound') {
                throw new NotFoundError('Нет пользователя с таким id');
              }
              if (err.name === 'ValidationError' || err.name === 'CastError') {
                throw new InvalidDataError('Переданы некорректные данные при отправки показаний счетчиков');
              }
            }).catch(next);
        }
        else {
          throw new Error('NotRightDate')
        }

      } else {
        if (Number(date.split('.')[0]) >= 1 && Number(date.split('.')[0]) <= 31) {
          if (Number(user.meterReadings[user.meterReadings.length - 1].time.split('.')[1]) !== Number(date.split('.')[1])) {
            if (Number(user.meterReadings[user.meterReadings.length - 1].hotWaterSupply) <= hotWater && Number(user.meterReadings[user.meterReadings.length - 1].coldWaterSupply) <= coldWater) {
              let meterReadings = {
                time: date,
                hotWaterSupply: hotWater,
                coldWaterSupply: coldWater,
              }
              let newMeterReadings = user.meterReadings
              newMeterReadings.push(meterReadings)
              User.findByIdAndUpdate(req.user._id, {
                meterReadings: newMeterReadings,
              }, opts).orFail(() => new Error('NotFound'))
                .then((user) => {
                  res.status(200).send({ user })
                  const title = 'Показания счётчиков приняты'
                  const text = `Вы отправили показания счётчиков,

Посмотреть историю показаний можно в разделе "Мои счётчики".
Если Вы допустили ошибку при отправке, отправьте жалобу в разделе "Мои жалобы" с объяснением произошедшего`
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
                    html: `${meterReadingsEmailHtml(title, hotWater, coldWater, date)}`
                  }
                  mailer(massage)
                })
                .catch((err) => {
                  if (err.message === 'NotFound') {
                    throw new NotFoundError('Нет пользователя с таким id');
                  }
                  if (err.name === 'ValidationError' || err.name === 'CastError') {
                    throw new InvalidDataError('Переданы некорректные данные при отправки показаний счетчиков');
                  }
                }).catch(next);
            } else {
              throw new Error('InvalidDataError')
            }

          } else {
            throw new Error('ResendingError')
          }
        } else {
          throw new Error('NotRightDate')
        }

      }
    })


    .catch((err) => {
      console.log(err)
      if (err.message === 'NotFound') {
        throw new NotFoundError('Нет пользователя с таким id');
      }
      if (err.message === 'InvalidDataError') {
        throw new InvalidDataError('Показания счетчиков не могут быть меньше чем при прошлой подаче');
      }
      if (err.message === 'ResendingError') {
        throw new ConflictError('Подать показания можно только один раз в месяц');
      }
      if (err.message === 'NotRightDate') {
        throw new AuthError('Подать показания счетчиков можно только в 20-25 числа каждого месяца');
      }
    })
    .catch(next);

}

module.exports.updateUserProfile = (req, res, next) => {
  User.findById(req.user._id).orFail(() => new Error('NotFound'))
    .then((user) => {
      const realDate = new Date
      let date = moment(realDate.toISOString()).tz("Europe/Moscow").format('D.MM.YYYY  HH:mm')
      const { fullname = user.fullname, flat = user.flat, email = user.email, phone = user.phone } = req.body;
      let names = fullname.trim().split(/\s+/);
      if (flat != user.flat && email.trim() != user.email) {
        House.findById(user.house).orFail(() => new Error('HouseNotFound'))
          .then((house) => {
            let entnum
            if (flat > house.entranceArray[house.entranceArray.length - 1]) {
              throw new Error('FlatDoesntExist')
            } else {
              for (let i = 0; i < house.entranceArray.length; i++) {

                if (flat <= house.entranceArray[i]) {
                  console.log(i + 1);
                  entnum = i + 1;
                  break
                }
                continue
              }
            };
            if (names.length != 3) {
              throw new Error('NotCorrectFullname')
            }
            let emailLowerCase = email.toLowerCase();
            User.findByIdAndUpdate(req.user._id, {
              fullname: fullname.trim(),
              lastname: names[0].trim(),
              firstname: names[1].trim(),
              patronymic: names[2].trim(),
              flat,
              email: emailLowerCase.trim(),
              entranceNumber: entnum,
              emailVerified: false,
              phone: phone.trim(),
            }, opts).orFail(() => new Error('NotFound'))
              .populate('house')
              .then((user) => {
                const token = jwt.sign({ _id: user._id }, jwtSecretPhrase, { expiresIn: '7d' });
                res.cookie('jwt', token, {
                  maxAge: 3600000 * 24 * 7,
                  httpOnly: true,
                  sameSite: true,
                });
                const title = 'Подтвердите адресс электронной почты'
                const text = `Подтвердите адрес электронной почты
            
Пожалуйста нажмите кнопку или перейдите по ссылке ниже для подтверждения адреса электронной почты
${apiLink}${token}`
                sendEmail.create({
                  title: title,
                  text: text,
                  date,
                  to_user: user._id,
                })
                const massage = {
                  to: emailLowerCase.trim(),
                  subject: title,
                  text: text, //!! ИСПРАВИТЬ АДРЕСС ПОТОМ
                  html: `${regEmailHtml(token, apiLink, user.firstname)}`
                }
                mailer(massage)
                res.status(200).send({ user })
              })
              .catch((err) => {

                if (err.message === 'NotFound') {
                  throw new NotFoundError('Нет пользователя с таким id');
                }
                if (err.name === 'ValidationError' || err.name === 'CastError') {
                  throw new InvalidDataError('Переданы некорректные данные при обновлении профиля');
                }
              }).catch(next);
          }
          )
          .catch((err) => {
            if (err.message === 'FlatDoesntExist') {
              throw new InvalidDataError('Такой квартиры нет в доме');
            }
            if (err.message === 'NotCorrectFullname') {
              throw new InvalidDataError('Переданны некоректные данные в поле fullname, оно должно содержать только Фамилию, Имя, и Отчество');
            }
            if (err.message === 'NotFound') {
              throw new NotFoundError('Нет пользователя с таким id');
            }
            if (err.name === 'ValidationError' || err.name === 'CastError') {
              throw new InvalidDataError('Переданы некорректные данные при поиске пользователя по id');
            }
          })

          .catch(next)
      } else if (flat != user.flat && email === user.email) {
        House.findById(user.house).orFail(() => new Error('HouseNotFound'))
          .then((house) => {
            let entnum
            if (flat > house.entranceArray[house.entranceArray.length - 1]) {
              throw new Error('FlatDoesntExist')
            } else {
              for (let i = 0; i < house.entranceArray.length; i++) {

                if (flat <= house.entranceArray[i]) {
                  console.log(i + 1);
                  entnum = i + 1;
                  break
                }
                continue
              }
            };
            if (names.length != 3) {
              throw new Error('NotCorrectFullname')
            }
            User.findByIdAndUpdate(req.user._id, {
              fullname: fullname.trim(),
              lastname: names[0].trim(),
              firstname: names[1].trim(),
              patronymic: names[2].trim(),
              flat,
              entranceNumber: entnum,
              phone: phone.trim(),
            }, opts).orFail(() => new Error('NotFound'))
              .populate('house')
              .then((user) => {
                res.status(200).send({ user })
              })
              .catch((err) => {
                if (err.message === 'NotFound') {
                  throw new NotFoundError('Нет пользователя с таким id');
                }
                if (err.name === 'ValidationError' || err.name === 'CastError') {
                  throw new InvalidDataError('Переданы некорректные данные при обновлении профиля');
                }
              }).catch(next);
          }
          )
          .catch((err) => {
            if (err.message === 'FlatDoesntExist') {
              throw new InvalidDataError('Такой квартиры нет в доме');
            }
            if (err.message === 'NotCorrectFullname') {
              throw new InvalidDataError('Переданны некоректные данные в поле fullname, оно должно содержать только Фамилию, Имя, и Отчество');
            }
            if (err.message === 'NotFound') {
              throw new NotFoundError('Нет пользователя с таким id');
            }
            if (err.name === 'ValidationError' || err.name === 'CastError') {
              throw new InvalidDataError('Переданы некорректные данные при поиске пользователя по id');
            }
          })

          .catch(next)
      }
      else if (flat === user.flat && email.trim() != user.email) {
        let emailLowerCase = email.toLowerCase();
        if (names.length != 3) {
          throw new Error('NotCorrectFullname')
        }
        User.findByIdAndUpdate(req.user._id, {
          fullname: fullname.trim(),
          lastname: names[0].trim(),
          firstname: names[1].trim(),
          patronymic: names[2].trim(),
          email: emailLowerCase.trim(),
          emailVerified: false,
          phone: phone.trim(),
        }, opts).orFail(() => new Error('NotFound'))
          .populate('house')
          .then((user) => {
            const token = jwt.sign({ _id: user._id }, jwtSecretPhrase, { expiresIn: '7d' });
            res.cookie('jwt', token, {
              maxAge: 3600000 * 24 * 7,
              httpOnly: true,
              sameSite: true,
            });
            const title = 'Подтвердите адресс электронной почты'
            const text = `Подтвердите адрес электронной почты
        
Пожалуйста нажмите кнопку или перейдите по ссылке ниже для подтверждения адреса электронной почты
${apiLink}${token}`
            sendEmail.create({
              title: title,
              text: text,
              date,
              to_user: user._id,
            })
            const massage = {
              to: emailLowerCase.trim(),
              subject: title,
              text: text, //!! ИСПРАВИТЬ АДРЕСС ПОТОМ
              html: `${regEmailHtml(token, apiLink, user.firstname)}`
            }
            mailer(massage)
            res.status(200).send({ user })
          })
          .catch((err) => {
            if (err.message === 'NotFound') {
              throw new NotFoundError('Нет пользователя с таким id');
            }
            if (err.message === 'NotCorrectFullname') {
              throw new InvalidDataError('Переданны некоректные данные в поле fullname, оно должно содержать только Фамилию, Имя, и Отчество');
            }
            if (err.name === 'ValidationError' || err.name === 'CastError') {
              throw new InvalidDataError('Переданы некорректные данные при обновлении профиля');
            }
          }).catch(next);
      } else {
        if (names.length != 3) {
          throw new Error('NotCorrectFullname')
        }
        User.findByIdAndUpdate(req.user._id, {
          fullname: fullname.trim(),
          lastname: names[0].trim(),
          firstname: names[1].trim(),
          patronymic: names[2].trim(),
          phone: phone.trim(),
        }, opts).orFail(() => new Error('NotFound'))
          .populate('house')
          .then((user) => res.status(200).send({ user }))
          .catch((err) => {
            if (err.message === 'NotFound') {
              throw new NotFoundError('Нет пользователя с таким id');
            }
            if (err.message === 'NotCorrectFullname') {
              throw new InvalidDataError('Переданны некоректные данные в поле fullname, оно должно содержать только Фамилию, Имя, и Отчество');
            }
            if (err.name === 'ValidationError' || err.name === 'CastError') {
              throw new InvalidDataError('Переданы некорректные данные при обновлении профиля');
            }
          }).catch(next);
      }
    })
}

module.exports.connect = (req, res, next) => {
  const { email, password } = req.body;
  const { chat_id } = req.params;
  let emailLowerCase = email.toLowerCase();
  User.findUserByCredentials(emailLowerCase, password)
    .then((user) => {
      console.log(user.telegram_id)
      if (user.telegram_id !== '') {
        throw new ConflictError('К этому аккаунту уже привязан профиль телеграмм');
      }

      else {
        if (!user.emailVerified) {
          const token = jwt.sign({ _id: user._id }, jwtSecretPhrase, { expiresIn: '7d' });
          res.cookie('jwt', token, {
            maxAge: 3600000 * 24 * 7,
            httpOnly: true,
            sameSite: true,
          });
          const title = 'Подтвердите адресс электронной почты'
          const text = `Подтвердите адрес электронной почты
      
Пожалуйста нажмите кнопку или перейдите по ссылке ниже для подтверждения адреса электронной почты
${apiLink}${token}`
          sendEmail.create({
            title: title,
            text: text,
            to_user: user._id,
          })
          const massage = {
            to: emailLowerCase.trim(),
            subject: title,
            text: text, //!! ИСПРАВИТЬ АДРЕСС ПОТОМ
            html: `${regEmailHtml(token, apiLink, user.firstname)}`
          }
          mailer(massage)
        }
        User.findByIdAndUpdate(user._id, { telegram_id: chat_id }, opts).orFail(() => new Error('NotFound'))
          .populate('house')
          .then((user) => {
            res.send({ user });
          })
          .catch((err) => {
            if (err.message === 'NotFound') {
              throw new NotFoundError('Нет пользователя с таким id');
            }

          }).catch(next);
      }

    })
    .catch(next);
}

module.exports.disconnect = (req, res, next) => {
  const { chat_id } = req.params;
  console.log(chat_id)
  if (chat_id !== '') {
    User.findByIdAndUpdate(req.user._id, { telegram_id: '' }, opts).orFail(() => new Error('NotFound'))
      .then(() => res.status(200).send({ disconnected: true }))
      .catch((err) => {
        if (err.message === 'NotFound') {
          throw new NotFoundError('Нет пользователя с таким chat id');
        }
        if (err.name === 'ValidationError' || err.name === 'CastError') {
          throw new InvalidDataError('Переданы некорректные данные при поиске пользователя по chat id');
        }
      })
      .catch(next);
  }
  else {
    throw new ConflictError('Недопустимое значение chat id');
  }
};


module.exports.login = (req, res, next) => {
  const { email, password } = req.body;
  let emailLowerCase = email.toLowerCase();
  return User.findUserByCredentials(emailLowerCase, password)
    .then((user) => {

      const token = jwt.sign({ _id: user._id }, jwtSecretPhrase, { expiresIn: '7d' });
      res.cookie('jwt', token, {
        maxAge: 3600000 * 24 * 7,
        httpOnly: true,
        sameSite: true,
      });
      res.send({ token });
    })
    .catch(() => {
      throw new AuthError('Передан неверный логин или пароль');
    })
    .catch(next);
};
