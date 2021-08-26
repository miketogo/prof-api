const router = require('express').Router();
const { celebrate, Joi } = require('celebrate');
const checkSuperUser = require('../middlewares/checkSuperUser');
const {
    getAppeals, createAppeal, getUserAppeals,
} = require('../controllers/appeals');

router.get('/all',checkSuperUser, getAppeals);
router.post('/create', celebrate({
    body: Joi.object().keys({
      text: Joi.string().min(1).required(),
      image: Joi.string(),
    }).unknown(true),
  }), createAppeal);
router.get('/my', getUserAppeals);

module.exports = router;
