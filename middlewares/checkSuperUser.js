const NotEnoughRightsError = require('../errors/not-enough-rights-err');
const NotFoundError = require('../errors/not-found-err');
const User = require('../models/user');

module.exports = (req, res, next) => {
    User.findById(req.user._id).select('+user_rights').orFail(() => new Error('NotFound'))
    .then((user) => {
        console.log(user.user_rights)
        if (user.user_rights === 'default'){
            throw new Error('NotEnoughRights')
        }
        else if (user.user_rights === 'superPuperUser'){
            return next();
        }
        else {
            throw new Error('NotEnoughRights')
        }
    })
    .catch((err) => {
        if (err.message === 'NotFound') {
          throw new NotFoundError('Нет пользователя с таким id');
        }
        if (err.message === 'NotEnoughRights') {
            throw new NotEnoughRightsError('Недостаточно прав доступа');
          }
      }).catch(next);
};
