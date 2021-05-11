const express = require('express');
const router = express.Router();
const passport = require('passport');
const { authenticateWebToken } = require('../config/noty');





const webApiController = require('../controllers/web_api');

// router.post('/create-session', passport.authenticate('local', {
//     failureRedirect: '/fail'
// }), webApiController.createSession);

router.post('/home',webApiController.home);
router.post('/get-user-info',webApiController.getUserInfo);
router.post('/renew-refresh-token',webApiController.renewRefreshToken);
router.post('/get-user-details',authenticateWebToken,webApiController.getUserDetails);
router.post('/logout',webApiController.logout);
router.post('/doctors',webApiController.doctors);
router.post('/filter-doctor',webApiController.Filter);
router.post('/doctor-profile',webApiController.doctorProfile);
router.post('/booking',webApiController.booking);
router.post('/specialist',webApiController.specialist);
router.post('/send-otp',webApiController.sendOtp)
router.post('/forgot-send-otp',webApiController.forgotSendOtp)
router.post('/reset-password',webApiController.resetPassword)
router.post('/verify-otp',webApiController.verifyOtp)
router.post('/verify-2factor',webApiController.verify2FactorOtp)
router.post('/create-user-account',webApiController.createUserAccount)
router.post('/login',webApiController.login)
router.post('/jwt-login',passport.authenticate('local', {
    failureRedirect: '/fail'
}),webApiController.jwtLogin)
router.post('/profile-settings',webApiController.profileSettings)
router.post('/profile-settings',webApiController.profileSettings)
router.post('/update-profile',webApiController.updateProfile)
router.post('/my-appointments',webApiController.myAppointments)
router.post('/my-billings',webApiController.myBillings)
router.post('/my-favourites',webApiController.myFavourites);
router.post('/change-password',webApiController.changePassword);


module.exports = router;