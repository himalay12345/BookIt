const express = require('express');
const router = express.Router();
const passport = require('passport');

const userController = require('../controllers/user');

router.post('/create', userController.create);
router.post('/create-session', passport.authenticate('local', {
    failureRedirect: '/login'
}), userController.createSession);
router.get('/logout', userController.destroySession);
router.get('/auth/google', passport.authenticate('google', { scope: ['profile email'] }));
router.get('/auth/google/callback', passport.authenticate('google', { failureRedirect: '/login' }), userController.createSession);
router.get('/auth/facebook', passport.authenticate('facebook', { scope: ['email'] }));
router.get('/auth/facebook/callback', passport.authenticate('facebook', { failureRedirect: '/login' }), userController.createSession);
router.post('/profile/update', userController.profileUpdate);
router.post('/reset-password',userController.resetPassword);
router.post('/change-password',userController.changePassword);

module.exports = router;