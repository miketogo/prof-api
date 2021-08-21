const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const { errors, celebrate, Joi } = require('celebrate');
const { login, createUser, conectTg, getUserByChatId, disconectTg} = require('./controllers/users');
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
      email: Joi.string().required(),
      password: Joi.string().required(),
    })
  }), login);
  app.post('/conect-tg', celebrate({
    body: Joi.object().keys({
      email: Joi.string().required(),
      password: Joi.string().required(),
      chat_id: Joi.string().required(),
    })
  }), conectTg);
  app.post('/disconect-tg', celebrate({
    body: Joi.object().keys({
      chat_id: Joi.string().required(),
    })
  }), disconectTg);
  app.get('/tg-user', celebrate({
    body: Joi.object().keys({
      chat_id: Joi.string().required(),
    })
  }), getUserByChatId);
  app.post('/signup', celebrate({
    body: Joi.object().keys({
      email: Joi.string().required(),
      password: Joi.string().required(),
      firstname: Joi.string().required(),
      secondname: Joi.string().required(),
      house: Joi.string().required(),
      flat: Joi.number().min(1).required(),
    }),
  }), createUser);

  app.use('/survey', require('./routes/surveyResults'));
  app.use('/users', auth, require('./routes/users'));
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
  