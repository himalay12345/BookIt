const express = require('express');
const router = express.Router();

router.use('/admin', require('./admin'));
router.use('/user', require('./user'));
const homeController = require('../controllers/index');

router.get('/', homeController.home);
router.get('/account-setting', homeController.accountSetting);
router.get('/add-billing', homeController.addBilling);

router.get('/add-prescription', homeController.addPrescription);
router.get('/appointments', homeController.appointments);
router.get('/blank-page', homeController.blankPage);
router.get('/booking', homeController.booking);
router.get('/booking-success', homeController.bookingSuccess);
router.get('/calendar', homeController.calendar);
router.get('/change-password', homeController.changePassword);
router.get('/chat', homeController.chat);
router.get('/chat-doctor', homeController.chatDoctor);
router.get('/checkout', homeController.checkout);
router.get('/components', homeController.components);
router.get('/doctor-change-password', homeController.doctorChangePassword);
router.get('/doctor-terms-and-condition', homeController.doctorTermsAndCondition);
router.get('/doctor-dashboard', homeController.doctorDashboard);
router.get('/doctor-profile', homeController.doctorProfile);
router.get('/doctor-profile-settings', homeController.doctorProfileSettings);
router.get('/doctor-register', homeController.doctorRegister);
router.get('/edit-billing', homeController.editBilling);
router.get('/edit-prescription', homeController.editPrescription);
router.get('/favourites', homeController.favourites);
router.get('/forgot-password', homeController.forgotPassword);
router.get('/index-2', homeController.home2);
router.get('/invoice-view', homeController.invoiceView);
router.get('/invoices', homeController.invoices);
router.get('/login', homeController.login);
router.get('/my-patients', homeController.myPatients);
router.get('/patient-dashboard', homeController.patientDashboard);
router.get('/patient-profile', homeController.patientProfile);
router.get('/privacy-policy', homeController.privacyPolicy);
router.get('/profile-settings', homeController.profileSettings);
router.get('/preview-profile', homeController.previewProfile);
router.get('/register', homeController.register);
router.get('/reviews', homeController.reviews);
router.get('/schedule-timings', homeController.scheduleTimings);
router.get('/search', homeController.search);
router.get('/social-media', homeController.socialMedia);
router.get('/term-condition', homeController.termCondition);
router.get('/upload-documents', homeController.uploadDocuments);
router.get('/video-call', homeController.videoCall);
router.get('/voice-call', homeController.voiceCall);
router.post('/verify', homeController.verify);
router.post('/signup', homeController.signUp);
router.get('/specialist', homeController.Specialist);
router.get('/doc-register', homeController.docRegister);
router.get('/bank-details', homeController.bankDetails);
router.get('/doctors', homeController.Doctors);




module.exports = router;