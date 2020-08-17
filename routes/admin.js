const express = require('express');
const router = express.Router();

const adminController = require('../controllers/admin');

router.get('/appointment-list',adminController.appointmentList);

module.exports = router;