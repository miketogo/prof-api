const router = require('express').Router();
const { celebrate, Joi } = require('celebrate');
const auth = require('../middlewares/auth');
const {
    connect, getUserByChatId, disconnect
} = require('../controllers/users');

router.post('/connect/:chat_id', celebrate({
    body: Joi.object().keys({
        email: Joi.string().required(),
        password: Joi.string().required(),
    }),
    params: Joi.object().keys({
        chat_id: Joi.string().required(),
    }).unknown(true)
}), connect);
router.post('/disconnect/:chat_id', celebrate({
    params: Joi.object().keys({
        chat_id: Joi.string().required(),
    }).unknown(true)
}), auth, disconnect);
router.get('/user/:chat_id', celebrate({
    params: Joi.object().keys({
        chat_id: Joi.string().required(),
    }).unknown(true)
}), getUserByChatId);


module.exports = router;
