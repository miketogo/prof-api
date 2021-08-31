const router = require('express').Router();
const { celebrate, Joi } = require('celebrate');
const checkSuperUser = require('../middlewares/checkSuperUser');
const {
    addHouse, getStatements, getHouses
} = require('../controllers/houses');

router.post('/add', celebrate({
    body: Joi.object().keys({
        name: Joi.string().required(),
        formValue: Joi.string().required(),
        city: Joi.string().required(),
        address: Joi.string().required(),
        statements: Joi.array().required(),
        entranceArray: Joi.array().items(Joi.number().min(1)).required(),
    }),
}), checkSuperUser, addHouse);
router.get('/statements', getStatements);



module.exports = router;
