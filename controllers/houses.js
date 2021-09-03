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
        name, formValue, city, address, entranceArray, statements
    } = req.body;
    House.create({
        name, formValue, city, address, entranceArray, statements // записываем хеш в базу
    })
        .then((house) => {
            res.send({ house });
        })
        .catch((err) => {
            if (err.name === 'ValidationError') {
                throw new InvalidDataError('Переданы некорректные данные при создании дома');
            }
        })
        .catch(next);
};

module.exports.getStatements = (req, res, next) => {
    User.findById(req.user._id).orFail(() => new Error('NotFound'))
        .populate('house')
        .then((user) => {
            if (!user.emailVerified) {
                throw new Error('EmailNotVerified')
            }
            res.status(200).send({ statements: user.house.statements })
        })
        .catch((err) => {
            if (err.message === 'EmailNotVerified') {
                throw new AuthError('Для доступа в этот раздел необходимо подтвердить email');
            }
            if (err.message === 'NotFound') {
                throw new NotFoundError('Нет пользователя с таким id');
            }
        })
        .catch(next)
};

module.exports.getHouses = (req, res, next) => {
    House.find({})
        .orFail(() => new Error('NotFound'))
        .then((houses) => {
            res.status(200).send({ houses })
        })
        .catch((err) => {
            if (err.message === 'NotFound') {
                throw new NotFoundError('Нет пользователя с таким id');
            }
        })
        .catch(next)
};


