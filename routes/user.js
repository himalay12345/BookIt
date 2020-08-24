const express = require('express');
const router = express.Router();
const passport = require('passport');

const userController = require('../controllers/user');

router.post('/create', userController.create);
router.post('/doctor-create', userController.createDoctor);
router.post('/create-session', passport.authenticate('local', {
    failureRedirect: '/login'
}), userController.createSession);
router.get('/logout', userController.destroySession);
router.get('/auth/google', passport.authenticate('google', { scope: ['profile email'] }));
router.get('/auth/google/callback', passport.authenticate('google', { failureRedirect: '/login' }), userController.createSession);
router.get('/auth/facebook', passport.authenticate('facebook', { scope: ['email'] }));
router.get('/auth/facebook/callback', passport.authenticate('facebook', { failureRedirect: '/login' }), userController.createSession);
router.post('/profile/update', userController.profileUpdate);
router.post('/doctor-profile/update', userController.doctorProfileUpdate);
router.post('/reset-password', userController.resetPassword);
router.post('/change-password', userController.changePassword);
router.post('/doc-change-password', userController.docchangePassword);
router.get('/delete-registration', userController.deleteRegistration);
router.get('/delete-award', userController.deleteAward);
router.get('/delete-experience', userController.deleteExperience);
router.get('/delete-education', userController.deleteEducation);

module.exports = router;