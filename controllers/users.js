const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const NotFoundError = require('../errors/not-found-err');
const ConflictError = require('../errors/сonflict-err');
const InvalidDataError = require('../errors/invalid-data-err');
const AuthError = require('../errors/auth-err');
const House = require('../models/house');
const mailer = require('../nodemailer');
const regEmailHtml = require('../emails/regEmail')

const { NODE_ENV, JWT_SECRET } = process.env;

const jwtSecretPhrase = NODE_ENV !== 'production' ? 'e20f5a33bee3a1991d9da7e4db38281f9e97b36e0b1293af2c58035fbe34075f' : JWT_SECRET;
const opts = {
  new: true,
  runValidators: true,
};

module.exports.getUsers = (req, res, next) => {
  User.find({})
    .then((users) => res.status(200).send({ users }))
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
              const massage = {
                to: emailLowerCase.trim(),
                subject: 'Подтвердите адресс электронной почты',
                text: ` Подтвердите адрес электронной почты
            
                    Пожалуйста нажмите кнопку или перейдите по ссылке ниже для подтверждения адреса электронной почты
                    http://renat-hamatov.ru/emailCheck/${token}`, //!! ИСПРАВИТЬ АДРЕСС ПОТОМ
                html: `${regEmailHtml(token, 'http://renat-hamatov.ru/emailCheck/', names[1])}`
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
  const { chat_id } = req.body;
  User.findOne({ telegram_id: chat_id }).orFail(() => new Error('NotFound'))
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

module.exports.updateUserProfile = (req, res, next) => {
  User.findById(req.user._id).orFail(() => new Error('NotFound'))
    .then((user) => {
      const { fullname = user.fullname, flat = user.flat, email = user.email } = req.body;
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
            }, opts).orFail(() => new Error('NotFound'))
              .then((user) => {
                const token = jwt.sign({ _id: user._id }, jwtSecretPhrase, { expiresIn: '7d' });
                res.cookie('jwt', token, {
                  maxAge: 3600000 * 24 * 7,
                  httpOnly: true,
                  sameSite: true,
                });
                const massage = {
                  to: emailLowerCase.trim(),
                  subject: 'Подтвердите адресс электронной почты',
                  text: ` Подтвердите адрес электронной почты
            
                    Пожалуйста нажмите кнопку или перейдите по ссылке ниже для подтверждения адреса электронной почты
                    http://renat-hamatov.ru/emailCheck/${token}`, //!! ИСПРАВИТЬ АДРЕСС ПОТОМ
                  html: `${regEmailHtml(token, 'http://renat-hamatov.ru/emailCheck/', names[1])}`
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
              entranceNumber: entnum
            }, opts).orFail(() => new Error('NotFound'))
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
        User.findByIdAndUpdate(req.user._id, {
          fullname: fullname.trim(),
          lastname: names[0].trim(),
          firstname: names[1].trim(),
          patronymic: names[2].trim(),
          email: emailLowerCase.trim(),
          emailVerified: false
        }, opts).orFail(() => new Error('NotFound'))
          .then((user) => {
            const token = jwt.sign({ _id: user._id }, jwtSecretPhrase, { expiresIn: '7d' });
            res.cookie('jwt', token, {
              maxAge: 3600000 * 24 * 7,
              httpOnly: true,
              sameSite: true,
            });
            const massage = {
              to: emailLowerCase.trim(),
              subject: 'Подтвердите адресс электронной почты',
              text: ` Подтвердите адрес электронной почты
      
              Пожалуйста нажмите кнопку или перейдите по ссылке ниже для подтверждения адреса электронной почты
              http://renat-hamatov.ru/emailCheck/${token}`, //!! ИСПРАВИТЬ АДРЕСС ПОТОМ
              html: `${regEmailHtml(token, 'http://renat-hamatov.ru/emailCheck/', names[1])}`
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
      } else {
        User.findByIdAndUpdate(req.user._id, {
          fullname: fullname.trim(),
          lastname: names[0].trim(),
          firstname: names[1].trim(),
          patronymic: names[2].trim(),
        }, opts).orFail(() => new Error('NotFound'))
          .then((user) => res.status(200).send({ user }))
          .catch((err) => {
            if (err.message === 'NotFound') {
              throw new NotFoundError('Нет пользователя с таким id');
            }
            if (err.name === 'ValidationError' || err.name === 'CastError') {
              throw new InvalidDataError('Переданы некорректные данные при обновлении профиля');
            }
          }).catch(next);
      }
    })
}

module.exports.connect = (req, res, next) => {
  const { email, password, chat_id } = req.body;
  let emailLowerCase = email.toLowerCase();
  User.findUserByCredentials(emailLowerCase, password)
    .then((user) => {
      console.log(user.telegram_id)
      if (user.telegram_id !== '') {
        throw new ConflictError('К этому аккаунту уже привязан профиль телеграмм');
      }
      else {
        User.findByIdAndUpdate(user._id, { telegram_id: chat_id }, opts).orFail(() => new Error('NotFound'))
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
  const { chat_id } = req.body;
  console.log(chat_id)
  if (chat_id !== '') {
    User.findByIdAndUpdate(req.user._id, { telegram_id: '' }, opts).orFail(() => new Error('NotFound'))
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
