const router = require('express').Router();
const auth = require('../middlewares/auth');
const checkSuperUser = require('../middlewares/checkSuperUser');
const { celebrate, Joi } = require('celebrate');
const {
  getResults, createAnswer,
} = require('../controllers/surveyResult');

router.get('/', auth, checkSuperUser,  getResults);
router.post('/', celebrate({
  body: Joi.object().keys({
    email: Joi.string().required(),
    phone: Joi.string().required(),
    firstname: Joi.string().required(),
    secondname: Joi.string().required(),
    address: Joi.string().required(),
    homeOrg: Joi.string().required(),
    area: Joi.number().min(1).required(),
    monthPay: Joi.string().required(),
  }),
}), createAnswer);


module.exports = router;
