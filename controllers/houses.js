const User = require('../models/user');
const NotFoundError = require('../errors/not-found-err');
const ConflictError = require('../errors/сonflict-err');
const InvalidDataError = require('../errors/invalid-data-err');
const AuthError = require('../errors/auth-err');
const House = require('../models/house');

const { NODE_ENV, JWT_SECRET } = process.env;

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



module.exports.addHouse = (req, res, next) => {
    const {
        name, formValue, city, address, entranceArray
    } = req.body;
    House.create({
        name, formValue, city, address, entranceArray // записываем хеш в базу
    })
    .then((house)=>{
        res.send({ house });
    })
    .catch((err) => {
        if (err.name === 'ValidationError') {
            throw new InvalidDataError('Переданы некорректные данные при создании дома');
        }
    })
    .catch(next);
};

module.exports.getEntranceNumber = (req, res, next) => {
    const {
        flat, formValue
    } = req.body;
    
    
};

