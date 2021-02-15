const express = require('express');
const router = express.Router();
const passport = require('passport');






const webApiController = require('../controllers/web_api');



router.post('/home',webApiController.home);
router.post('/doctors',webApiController.doctors);
router.post('/doctor-profile',webApiController.doctorProfile);
router.post('/booking',webApiController.booking);


module.exports = router;