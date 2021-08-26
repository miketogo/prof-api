const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const { errors, celebrate, Joi } = require('celebrate');
const { login, createUser} = require('./controllers/users');
const NotFoundError = require('./errors/not-found-err');
const { requestLogger, errorLogger } = require('./middlewares/logger');
const auth = require('./middlewares/auth');

const { PORT = 3000 } = process.env;

const CORS_WHITELIST = [
    '*',
  ];
  const app = express();
  app.use(helmet());
  const corsOption = {
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE'],
    preflightContinue: false,
    optionsSuccessStatus: 204,
    allowedHeaders: ['Content-Type', 'origin', 'Authorization'],
    credentials: true,
    origin: function checkCorsList(origin, callback) {
      if (CORS_WHITELIST.indexOf(origin) !== -1 || !origin) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
  };
  app.use('*', cors(corsOption));
  app.use(cookieParser());
  mongoose.connect('mongodb://localhost:27017/prof', {
    useUnifiedTopology: true,
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
  });
  
  app.use(express.json());
  app.use(requestLogger);
  // app.use(cors(corsOption));
  app.post('/signin', celebrate({
    body: Joi.object().keys({
      email: Joi.string().min(3).required(),
      password: Joi.string().min(8).required(),
    })
  }), login);
  app.post('/signup', celebrate({
    body: Joi.object().keys({
      email: Joi.string().min(3).required(),
      password: Joi.string().min(8).required(),
      fullname: Joi.string().min(1).required(),
      house: Joi.string().min(1).required(),
      flat: Joi.number().min(1).required(),
      phone: Joi.string().min(11).required(),
    }),
  }), createUser);
  app.use('/uploads', express.static('uploads'));
  app.use('/emailCheck', require('./routes/emailCheck'));
  app.use('/survey', require('./routes/surveyResults'));
  app.use('/telegram', require('./routes/telegram'));
  app.use('/users', auth, require('./routes/users'));
  app.use('/houses', auth, require('./routes/houses'));
  app.use('/appeals', auth, require('./routes/appeals'));
  app.use('/appeals/:chat_id', auth, require('./routes/appeals'));
  // app.use('/cards', auth, require('./routes/cards'));
  
  // eslint-disable-next-line no-unused-vars
  app.use((req, res) => {
    throw new NotFoundError('Запрашиваемый ресурс не найден');
  });
  app.use(errorLogger);
  app.use(errors());
  
  // eslint-disable-next-line no-unused-vars
  app.use((err, req, res, next) => {
    // если у ошибки нет статуса, выставляем 500
    const { statusCode = 500, message } = err;
  
    res
      .status(statusCode)
      .send({
        // проверяем статус и выставляем сообщение в зависимости от него
        message: statusCode === 500
          ? 'На сервере произошла ошибка'
          : message,
      });
  });
  
  app.listen(PORT, () => {
  
  });
  