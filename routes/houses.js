const router = require('express').Router();
const { celebrate, Joi } = require('celebrate');
const checkSuperUser = require('../middlewares/checkSuperUser');
const {
    addHouse, getEntranceNumber
} = require('../controllers/houses');

router.post('/add', celebrate({
    body: Joi.object().keys({
        name: Joi.string().required(),
        formValue: Joi.string().required(),
        city: Joi.string().required(),
        address: Joi.string().required(),
        entranceArray: Joi.array().items(Joi.number().min(1)).required(),
    }),
}), checkSuperUser, addHouse);
router.get('/entnum', checkSuperUser, getEntranceNumber);


module.exports = router;
