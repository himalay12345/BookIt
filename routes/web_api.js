const express = require('express');
const router = express.Router();
const passport = require('passport');






const webApiController = require('../controllers/web_api');

router.post('/create-session', passport.authenticate('local', {
    failureRedirect: '/fail'
}), webApiController.createSession);

router.post('/home',webApiController.home);
router.post('/doctors',webApiController.doctors);
router.post('/doctor-profile',webApiController.doctorProfile);
router.post('/booking',webApiController.booking);
router.post('/specialist',webApiController.specialist);
router.post('/send-otp',webApiController.sendOtp)
router.post('/verify-otp',webApiController.verifyOtp)
router.post('/verify-2factor',webApiController.verify2FactorOtp)
router.post('/create-user-account',webApiController.createUserAccount)
router.post('/login',webApiController.login)


module.exports = router;