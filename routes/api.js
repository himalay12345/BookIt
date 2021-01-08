const express = require('express');
const router = express.Router();
const passport = require('passport');



const apiController = require('../controllers/api');

router.get('/home',apiController.home);
router.get('/specialist',apiController.specialist);
// router.get('/doctors',apiController.doctors);

module.exports = router;