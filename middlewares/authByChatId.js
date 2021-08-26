
const AuthError = require('../errors/auth-err');
const User = require('../models/user');

const { NODE_ENV, JWT_SECRET } = process.env;



module.exports = (req, res, next) => {

  const { chat_id } = req.params;

    if (chat_id){
      
      User.findOne({ telegram_id: chat_id }).orFail(() => new Error('NotFound'))
      .then((user) => {
        
        req.user = user
        next()
      })
      .catch((err)=>{
          throw new AuthError('Отправленный chat id не привязан ни к одному аккаунту');
      })
      .catch(next)
    } else {
      throw new AuthError('Необходима авторизация');
    }
    


  // извлечём токен
  
};
