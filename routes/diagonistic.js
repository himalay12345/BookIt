const express = require('express');
const router = express.Router();
const passport = require('passport');




const diagController = require('../controllers/diagonistic');

router.get('/register',diagController.register);
router.post('/verify-new', diagController.verifyNew);
router.post('/create-account', diagController.createAccount);
router.post('/create', diagController.create);
router.post('/create-session', passport.authenticate('local', {
    failureRedirect: '/login'
}), diagController.createSession);
router.get('/steps', diagController.steps)
router.post('/update-profile',diagController.updateProfile);
router.get('/profile-info',  diagController.profileInfo);
router.get('/establishment', diagController.establishment);
router.post('/upload-eproof', diagController.uploadEProof);
router.get('/terms', diagController.terms);
router.post('/accept-agreement', diagController.acceptAgreement);
router.get('/add-bank', diagController.addBank);
router.post('/bank-details', diagController.bankDetails);
router.get('/add-test', diagController.addTest);
router.post('/add-test', diagController.addTestData);
router.get('/delete-test', diagController.deleteTest);
router.post('/update-test', diagController.updateTest);
router.get('/lab-profile',diagController.labProfile)
router.get('/all-tests',diagController.allTests)
router.get('/all-labs',diagController.allLabs)
router.get('/select-lab',diagController.selectLab)


module.exports = router;