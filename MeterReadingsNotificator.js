require('dotenv').config();
const moment = require('moment-timezone');
const mongoose = require('mongoose');
const TelegramBot = require('node-telegram-bot-api');
const token = process.env.TELEGRAM_TOKEN;
const bot = new TelegramBot(token, { polling: false });

const User = require('./models/user');
const mailer = require('./nodemailer');
const meterReadingsNotifiEmailHtml = require('./emails/meterReadingsNotifiEmail')
const sendEmail = require('./models/sendEmail');

mongoose.connect('mongodb://localhost:27017/prof', {
  useUnifiedTopology: true,
  useNewUrlParser: true,
  useCreateIndex: true,
  useFindAndModify: false,
});

function timer(ms) {
  return new Promise(function (resolve, reject) {
    setTimeout(function () {
      resolve();
    }, ms);
  });
}

async function sendNotification(user, date) {
  let regdate = user.registrationDate.split('.')
  
  if (Number(moment().tz("Europe/Moscow").format('x')) - Number(moment(`${regdate[1]}.${regdate[0]}.${regdate[2]}`).format('x')) >= 86400000 * 15 && !user.emailVerified) {
    console.log(user.email, 'Прошло 15 дней после рега')
    User.findByIdAndRemove(user._id)
      .then(() => {
        console.log('Пользователь удален')
      })
      .catch((err) => {
        console.log(err)
      })
  }
  if (user.emailVerified && date === '20 15') {
    await timer(3000)
      .then(() => {
        console.log(date)
        console.log(user.email)
        const title = 'Передача показаний счётчиков ГВС и ХВС'
        const text = `${user.firstname}, напоминаем что с 20 по 25 числа включительно можно передать показания счетчиков онлайн.
            
Для этого прейдите в раздел "Мои счётчики" и внесите новые показания`
        sendEmail.create({
          title: title,
          text: text,
          date: moment().tz("Europe/Moscow").format('D.MM.YYYY  HH:mm'),
          to_user: user._id,
        })
        const massage = {
          to: user.email,
          subject: title,
          text: text,
          html: `${meterReadingsNotifiEmailHtml(`C 20 по 25 числа включительно можно передать показания счетчиков онлайн`, `${user.firstname}, в данный период вы можете передать новые показания в соответствуеющем разделе`)}`
        }
        mailer(massage)
        if (user.telegram_id !== '') {

          const opts = {
            reply_markup: {
              inline_keyboard: [
                [
                  {
                    text: 'Нажми на меня',
                    callback_data: 'delete_notification'
                  }
                ]
              ]
            }
          };

          bot.sendMessage(user.telegram_id, `${user.firstname}, напоминаем: в период с 20 по 25 числа включительно в разделе "Мои счётчики" можно передать показания ГВС и ХВС`, opts);
        }
      })
  }
}

async function MeterReadingsNotificator() {

  let date = moment().tz("Europe/Moscow").format('D HH')
  User.find({})
    .then((users) => {
      console.log('___Обход начат___')
      users.reduce(async (a, user) => {
        // Wait for the previous item to finish processing
        await a;
        // Process this item
        await sendNotification(user, date);
      }, Promise.resolve())
        .then(() => {
          console.log('___Обход завершен___')
          setTimeout(MeterReadingsNotificator, 3600000)
        })

    })
}


MeterReadingsNotificator()



