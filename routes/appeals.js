const router = require('express').Router();
const { celebrate, Joi } = require('celebrate');

const checkSuperUser = require('../middlewares/checkSuperUser');
const {
  getAppeals, createAppealComplaint, getUserAppeals, changeStatus, uploadImage, createAppealStatement
} = require('../controllers/appeals');

router.get('/all', checkSuperUser, getAppeals);

router.post('/create-complaint', uploadImage, createAppealComplaint);
router.post('/order-statement', celebrate({
  body: Joi.object().keys({
     value: Joi.string().required(),
  }),
  params: Joi.object().keys({
      chat_id: Joi.string().required(),
  }).unknown(true)
}), createAppealStatement);
router.get('/my', getUserAppeals);
router.patch('/change-status', checkSuperUser, changeStatus)

module.exports = router;
