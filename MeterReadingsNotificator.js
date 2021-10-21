
const mongoose = require('mongoose');
const TelegramBot = require('node-telegram-bot-api');
const token = 'YOUR_TELEGRAM_BOT_TOKEN';
const bot = new TelegramBot(token, {polling: false});

const User = require('./models/user');
const mailer = require('../nodemailer');
const meterReadingsEmailHtml = require('../emails/meterReadingsEmail')
const sendEmail = require('../models/sendEmail');

mongoose.connect('mongodb://localhost:27017/prof', {
    useUnifiedTopology: true,
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
  });

function MeterReadingsNotificator (){
  
}

MeterReadingsNotificator()

 

