const express = require('express');
const router = express.Router();
const passport = require('passport');
const jwt = require('../config/noty');



const apiController = require('../controllers/api');

router.post('/home',jwt.authenticateToken,apiController.home);
router.post('/specialist',jwt.authenticateToken,apiController.specialist);
// router.get('/doctors',apiController.doctors);

module.exports = router;