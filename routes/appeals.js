const router = require('express').Router();
const { celebrate, Joi } = require('celebrate');
const checkSuperUser = require('../middlewares/checkSuperUser');
const {
    getAppeals, createAppeal, getUserAppeals,
} = require('../controllers/appeals');

router.get('/all',checkSuperUser, getAppeals);
router.post('/create', createAppeal);
router.get('/my', getUserAppeals);

module.exports = router;
