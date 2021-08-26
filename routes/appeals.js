const router = require('express').Router();
const { celebrate, Joi } = require('celebrate');

const checkSuperUser = require('../middlewares/checkSuperUser');
const {
  getAppeals, createAppeal, getUserAppeals, changeStatus, uploadImage
} = require('../controllers/appeals');

router.get('/all', checkSuperUser, getAppeals);

router.post('/create/:chat_id', uploadImage, createAppeal);
router.get('/my/:chat_id', getUserAppeals);
router.patch('/change-status', checkSuperUser, changeStatus)

module.exports = router;
