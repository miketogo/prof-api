const router = require('express').Router();
const { celebrate, Joi } = require('celebrate');
const {
  getUsers, getUserById, updateUserProfile, updateMeterReadings
} = require('../controllers/users');

router.get('/', getUsers);
router.get('/:userId', celebrate({
  // валидируем параметры
  params: Joi.object().keys({
    userId: Joi.string(),
  }),
}), getUserById);
router.patch('/me', celebrate({
  body: Joi.object().keys({
    fullname: Joi.string().min(2).required(),
    flat: Joi.number().min(1).required(),
    phone: Joi.string().min(11).required(),
    email: Joi.string().min(3).required(),
  }),
}), updateUserProfile);
router.post('/meter-update', celebrate({
  body: Joi.object().keys({
    hotWater: Joi.number().min(0).required(),
    coldWater: Joi.number().min(0).required(),
  }),
}), updateMeterReadings);



module.exports = router;
