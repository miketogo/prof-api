const router = require('express').Router();
const { celebrate, Joi } = require('celebrate');
const {
  getUsers, getUserById, updateUserProfile,
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
    firstname: Joi.string().min(2).max(30),
    secondname: Joi.string().min(2).max(30),
  }).unknown(true),
}), updateUserProfile);



module.exports = router;
