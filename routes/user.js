const express = require('express');
const router = express.Router();
const passport = require('passport');

const userController = require('../controllers/user');

router.post('/create',userController.create);
router.post('/create-session',passport.authenticate('local',{
    failureRedirect:'/login'
}),userController.createSession);
router.get('/logout',userController.destroySession);
module.exports = router;