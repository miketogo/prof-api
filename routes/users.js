const router = require('express').Router();
const { celebrate, Joi } = require('celebrate');
const {
  getUsers, getUserById, updateUserProfile, getUserByChatId,
} = require('../controllers/users');

router.get('/', getUsers);
router.get('/telegram', getUserByChatId);
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
