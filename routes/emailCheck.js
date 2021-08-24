const router = require('express').Router();
const { celebrate, Joi } = require('celebrate');
const {
    verifyEmail
} = require('../controllers/emailCheck');

router.get('/:token', verifyEmail);

module.exports = router;
