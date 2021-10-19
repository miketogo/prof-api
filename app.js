const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const { errors, celebrate, Joi } = require('celebrate');
const { login, createUser, getSentEmails} = require('./controllers/users');
const NotFoundError = require('./errors/not-found-err');
const { requestLogger, errorLogger } = require('./middlewares/logger');
const auth = require('./middlewares/auth');
const authByChatId = require('./middlewares/authByChatId');
const checkSuperUser = require('./middlewares/checkSuperUser');
const {
  getHouses
} = require('./controllers/houses');
require('dotenv').config();
console.log(process.env.NODE_ENV);
const { PORT = 3000 } = process.env; //PORT

const CORS_WHITELIST = [
  'http://localhost:3000',
  'https://localhost:3000',
  'http://surikov.mesto.students.nomoredomains.monster',
  'https://surikov.mesto.students.nomoredomains.monster',
  ];
  const app = express();
  app.use(helmet());
  const corsOption = {
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE'],
    preflightContinue: false,
    optionsSuccessStatus: 204,
    allowedHeaders: ['Content-Type', 'origin', 'Authorization'],
    credentials: true,
    origin: [
      'http://localhost:3000',
      'https://localhost:3000',
      'https://prof-uk.ru',
      'http://prof-uk.ru',
      'http://192.168.0.215:3000',
      'https://192.168.0.215:3000',
      'http://www.localhost:3000',
      'https://www.localhost:3000',
      'https://www.prof-uk.ru',
      'http://www.prof-uk.ru',
      'http://www.192.168.0.215:3000',
      'https://www.192.168.0.215:3000'
      ],
  };
  app.use('*', cors(corsOption));
  app.use(cookieParser());
  mongoose.connect('mongodb://localhost:27017/boom-lead', {
    useUnifiedTopology: true,
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
  });
  

  app.get('/all-houses', getHouses);
  app.get('/sent-emails', auth, checkSuperUser, getSentEmails);
  app.use('/uploads', express.static('uploads'));
  app.use('/emailCheck', require('./routes/emailCheck'));
  app.use('/survey', require('./routes/surveyResults'));
  app.use('/telegram', require('./routes/telegram'));
  app.use('/users', auth, require('./routes/users'));
  app.use('/houses', auth, require('./routes/houses'));
  app.use('/houses-from-tg/:chat_id', authByChatId , require('./routes/houses'));
  app.use('/appeals', auth, require('./routes/appeals'));
  app.use('/appeals-from-tg/:chat_id', authByChatId, require('./routes/appeals'));
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
  