const router = require('express').Router();
const { celebrate, Joi } = require('celebrate');
const auth = require('../middlewares/auth');
const {
    connect, getUserByChatId, disconnect
} = require('../controllers/users');

router.post('/connect', celebrate({
    body: Joi.object().keys({
        email: Joi.string().required(),
        password: Joi.string().required(),
    }),
    headers: Joi.object().keys({
        chat_id: Joi.string().required(),
    }).unknown(true)
}), connect);
router.post('/disconnect', celebrate({
    headers: Joi.object().keys({
        chat_id: Joi.string().required(),
    }).unknown(true)
}), auth, disconnect);
router.get('/user', celebrate({
    headers: Joi.object().keys({
        chat_id: Joi.string().required(),
    }).unknown(true)
}), getUserByChatId);


module.exports = router;
