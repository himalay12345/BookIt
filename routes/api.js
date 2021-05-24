const express = require('express');
const router = express.Router();
const passport = require('passport');
const jwt = require('../config/noty');





const apiController = require('../controllers/api');

// -------------------------------------------
// User Sign Up Process Start
// -------------------------------------------
router.post('/auth/check-authentication',apiController.checkAuthentication)
router.post('/auth/verify-otp',apiController.verifyOtp)
router.post('/auth/resend-otp',apiController.resendOtp)
router.post('/auth/create-user-account',apiController.createUserAccount)
router.post('/auth/login',apiController.login)
router.post('/auth/forgot-password',apiController.forgotSendOtp)
router.post('/auth/reset-password',apiController.resetPassword)
// -------------------------------------------
// User Sign Up Process End
// -------------------------------------------


router.post('/home',jwt.authenticateToken,apiController.home);
router.post('/doctor-profile',jwt.authenticateToken,apiController.doctorProfile);
router.post('/specialist',jwt.authenticateToken,apiController.specialist);
router.post('/doctors',jwt.authenticateToken,apiController.doctors);
router.post('/booking',jwt.authenticateToken,apiController.booking);
router.post('/checkout',jwt.authenticateToken,apiController.checkout);
router.post('/select-payment',jwt.authenticateToken,apiController.selectPayment);
router.post('/confirm-booking',jwt.authenticateToken,apiController.confirmBooking);
router.post('/order-validation',jwt.authenticateToken,apiController.orderValidation);
router.post('/appointments',jwt.authenticateToken,apiController.myAppointments)
router.post('/appointment-detail',jwt.authenticateToken,apiController.appointmentDetail)
router.post('/cancel-appointment',jwt.authenticateToken,apiController.refund)


// router.get('/doctors',apiController.doctors);

module.exports = router;