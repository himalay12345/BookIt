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
router.get('/lab-all-tests',diagController.labAllTests)
router.get('/select-lab',diagController.selectLab)
router.post('/select-lab',diagController.selectLab1)
router.post('/change-lab',diagController.changeLab)
router.get('/change-lab',diagController.changeLab1)
router.get('/remove-cart-item',diagController.removeCartItem);
router.get('/add-cart-item',diagController.addCartItem);
router.get('/cart',diagController.cart);
router.get('/schedule_timing',diagController.scheduleTiming);
router.get('/add-patient',diagController.addPatient);
router.get('/get-patient-data',diagController.getPatientData);
router.get('/get-address-data',diagController.getAddressData);
router.get('/get-all-patients',diagController.getallPatients);
router.get('/get-all-address',diagController.getallAddress);
router.get('/get-patient-by-index',diagController.getPatientByIndex);
router.get('/get-address-by-index',diagController.getAddressByIndex);
router.post('/add-address',diagController.addAddressData);
router.post('/add-patient',diagController.addPatientData);
router.post('/switch-lab',diagController.switchLab);
router.post('/set-schedule-timing', diagController.setScheduleTiming);
router.post('/update-schedule', diagController.updateSchedule);
router.get('/booking', diagController.booking);
router.post('/book-test', diagController.bookTest);
router.post('/book-test-by-cash', diagController.bookTestByCash);
router.get('/review-order', diagController.createOrder);
router.get('/track-test', diagController.trackTest);
router.get('/track-order', diagController.trackOrder);
router.get('/print-bill', diagController.printBill);
router.get('/amount-payable', diagController.amountPayable);
router.get('/order-success', diagController.orderSuccess);
router.get('/booked-test', diagController.bookedTest);


module.exports = router;