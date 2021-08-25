const router = require('express').Router();
const { celebrate, Joi } = require('celebrate');
const {
    verifyEmail
} = require('../controllers/emailCheck');

router.get('/:token',celebrate({
    // валидируем параметры
    params: Joi.object().keys({
        token: Joi.string().alphanum().min(3).max(200).required(),
    }),
  }), verifyEmail);

module.exports = router;
