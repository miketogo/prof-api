const router = require('express').Router();
const { celebrate, Joi } = require('celebrate');
const {
    verifyEmail, sendMailAgain
} = require('../controllers/emailCheck');
const auth = require('../middlewares/auth');

router.get('/:token', celebrate({
    // валидируем параметры
    params: Joi.object().keys({
        token: Joi.string().min(3).max(200).required(),
    }),
}), verifyEmail);

router.post('/send-again', auth, sendMailAgain);

module.exports = router;
