const router = require('express').Router();
const { celebrate, Joi } = require('celebrate');
const {
    connect, getUserByChatId, disconnect
} = require('../controllers/users');

router.post('/connect', celebrate({
    body: Joi.object().keys({
        email: Joi.string().required(),
        password: Joi.string().required(),
        chat_id: Joi.string().required(),
    })
}), connect);
router.post('/disconnect', celebrate({
    body: Joi.object().keys({
        chat_id: Joi.string().required(),
    })
}), disconnect);
router.get('/user', celebrate({
    body: Joi.object().keys({
        chat_id: Joi.string().required(),
    })
}), getUserByChatId);


module.exports = router;
