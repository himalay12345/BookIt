const express = require('express');
const router = express.Router();
const passport = require('passport');
const jwt = require('../config/noty');





const apiController = require('../controllers/api');


router.post('/home',jwt.authenticateToken,apiController.home);
router.post('/doctor-profile',jwt.authenticateToken,apiController.doctorProfile);
router.post('/specialist',jwt.authenticateToken,apiController.specialist);
router.post('/doctors',jwt.authenticateToken,apiController.doctors);
router.post('/booking',jwt.authenticateToken,apiController.booking);

// router.get('/doctors',apiController.doctors);

module.exports = router;