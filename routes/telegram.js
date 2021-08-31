const router = require('express').Router();
const { celebrate, Joi } = require('celebrate');
const auth = require('../middlewares/auth');
const authByChatId = require('../middlewares/authByChatId');
const {
    connect, getUserByChatId, disconnect, updateMeterReadings
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
}), authByChatId, disconnect);
router.get('/user/:chat_id', celebrate({
    params: Joi.object().keys({
        chat_id: Joi.string().required(),
    }).unknown(true)
}), getUserByChatId);
router.post('/user/meter-update/:chat_id', celebrate({
    body: Joi.object().keys({
        hotWater: Joi.number().min(0).required(),
        coldWater: Joi.number().min(0).required(),
    }),
    params: Joi.object().keys({
        chat_id: Joi.string().required(),
    }).unknown(true)
}), authByChatId, updateMeterReadings);


module.exports = router;
