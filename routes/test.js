const express = require('express');
const router = express.Router();

const testController = require('../controllers/test');

router.get('/Pregancy-test', testController.Pregancy);
router.get('/Blood-test', testController.Blood);
router.get('/Malarial-test', testController.Malarial);
router.get('/Hba1c-test', testController.Hba1c);
router.get('/sugar-test', testController.sugar);
router.get('/thyroid-test', testController.thyroid);













module.exports = router;






















module.exports = router;