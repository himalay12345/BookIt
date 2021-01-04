const express = require('express');
const router = express.Router();
const passport = require('passport');



const apiController = require('../controllers/api');

router.get('/home',apiController.home);

module.exports = router;