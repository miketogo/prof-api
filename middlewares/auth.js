const jwt = require('jsonwebtoken');
const AuthError = require('../errors/auth-err');
const User = require('../models/user');

const { NODE_ENV, JWT_SECRET } = process.env;

const jwtSecretPhrase = NODE_ENV !== 'production' ? 'e20f5a33bee3a1991d9da7e4db38281f9e97b36e0b1293af2c58035fbe34075f' : JWT_SECRET;

module.exports = (req, res, next) => {
  const { authorization } = req.headers;
  const { chat_id } = req.body;
  console.log(chat_id)
  if (!authorization || !authorization.startsWith('Bearer ')) {
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
    
  } else {
    const token = authorization.replace('Bearer ', '');
    let payload;
  
    try {
      // попытаемся верифицировать токен
      payload = jwt.verify(token, jwtSecretPhrase);
    } catch (err) {
      // отправим ошибку, если не получилось
      throw new AuthError('Необходима авторизация');
    }
    
    req.user = payload; // записываем пейлоуд в объект запроса
  
    next();
  }

  // извлечём токен
  
};
