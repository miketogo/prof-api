const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const NotFoundError = require('../errors/not-found-err');
const ConflictError = require('../errors/сonflict-err');
const InvalidDataError = require('../errors/invalid-data-err');
const AuthError = require('../errors/auth-err');

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
    firstname, secondname, email, password, house, flat,
  } = req.body;
  bcrypt.hash(password, 10)
    .then((hash) => User.create({
      firstname,
      secondname,
      house,
      email,
      flat,
      password: hash, // записываем хеш в базу
    }))
    .then((user) => {
      return User.findUserByCredentials(email, password)
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
    }
    )
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
      const { firstname = user.firstname, secondname = user.secondname, flat = user.flat, house = user.house } = req.body;
      User.findByIdAndUpdate(req.user._id, { firstname, secondname, flat, house }, opts).orFail(() => new Error('NotFound'))
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
    )
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
module.exports.conectTg = (req, res, next) => {
  const { email, password, chat_id } = req.body;

  User.findUserByCredentials(email, password)
    .then((user) => {
      if (user.telegram_id === 'not connected') {
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
      else {
        throw new Error('ConflictError');
      }

    })
    .catch((err) => {
      if (err.message === 'ConflictError') {
        throw new ConflictError('К этому аккаунту уже привязан профиль телеграмм');
      } else {
        throw new AuthError('Передан неверный логин или пароль');
      }

    })
    .catch(next);
};

module.exports.disconectTg = (req, res, next) => {
  const { chat_id } = req.body;
  if (chat_id !== 'not connected'){
    User.findOneAndUpdate({ telegram_id: chat_id }, { telegram_id: 'not connected' }, {
      new: true, // обработчик then получит на вход обновлённую запись
    }).orFail(() => new Error('NotFound'))
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

  return User.findUserByCredentials(email, password)
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
