const express = require('express');
const passport = require('passport');
const router = express.Router();

router.use('/admin', require('./admin'));
router.use('/user', require('./user'));
const homeController = require('../controllers/index');

router.get('/', homeController.home);
router.get('/account-setting', passport.checkAuthentication, homeController.accountSetting);
router.get('/add-billing', passport.checkAuthentication, homeController.addBilling);
router.get('/active-device', passport.checkAuthentication, homeController.activeDevice);
router.get('/add-prescription', passport.checkAuthentication, homeController.addPrescription);
router.get('/appointments', passport.checkAuthentication, homeController.appointments);
router.get('/blank-page', passport.checkAuthentication, homeController.blankPage);
router.get('/booking', homeController.booking);
router.get('/booking-success', homeController.bookingSuccess);
router.get('/calendar', homeController.calendar);
router.get('/change-password', passport.checkAuthentication, homeController.changePassword);
router.get('/chat', passport.checkAuthentication, homeController.chat);
router.get('/consult', homeController.consult);
router.get('/test', homeController.test);
router.get('/test1', homeController.test1);

router.get('/chat-doctor', passport.checkAuthentication, homeController.chatDoctor);
router.get('/checkout', passport.checkAuthentication, homeController.checkout);
router.get('/components', homeController.components);
router.get('/delete-account', passport.checkAuthentication, homeController.deleteAccount);
router.get('/doctor-change-password', passport.checkAuthentication, homeController.doctorChangePassword);
router.get('/doctor-terms-and-condition', passport.checkAuthentication, homeController.doctorTermsAndCondition);
router.get('/doctor-dashboard', passport.checkAuthentication, homeController.doctorDashboard);
router.get('/doctor-profile', passport.checkAuthentication, homeController.doctorProfile);
router.get('/doctor-profile-settings', passport.checkAuthentication, homeController.doctorProfileSettings);
router.get('/doctor-register', passport.checkAuthentication, homeController.doctorRegister);
router.get('/edit-billing', passport.checkAuthentication, homeController.editBilling);
router.get('/edit-prescription', passport.checkAuthentication, homeController.editPrescription);
router.get('/educational', passport.checkAuthentication, homeController.educational);
router.get('/establishment', passport.checkAuthentication, homeController.establishment);
router.get('/favourites', passport.checkAuthentication, homeController.favourites);
router.get('/fees', passport.checkAuthentication, homeController.fees);
router.get('/forgot-password', homeController.forgotPassword);
router.get('/index-2', homeController.home2);
router.get('/invoice-view', passport.checkAuthentication, homeController.invoiceView);
router.get('/invoices', passport.checkAuthentication, homeController.invoices);
router.get('/id-proof', passport.checkAuthentication, homeController.idProof);
router.get('/login', homeController.login);
router.get('/my-patients', passport.checkAuthentication, homeController.myPatients);
router.get('/medical-registration', passport.checkAuthentication, homeController.medicalRegistration);
router.get('/medical-proof', passport.checkAuthentication, homeController.medicalProof);
router.get('/notification-settings', passport.checkAuthentication, homeController.notificationSettings);
router.get('/pay', homeController.pay);
router.get('/patient-dashboard', passport.checkAuthentication, homeController.patientDashboard);
router.get('/patient-profile', passport.checkAuthentication, homeController.patientProfile);
router.get('/privacy-policy', homeController.privacyPolicy);
router.get('/profile-settings', passport.checkAuthentication, homeController.profileSettings);
router.get('/profile-info', passport.checkAuthentication, homeController.profileInfo);
router.get('/preview-profile', passport.checkAuthentication, homeController.previewProfile);
router.get('/register', homeController.register);
router.get('/reviews', passport.checkAuthentication, homeController.reviews);
router.get('/schedule-timings', passport.checkAuthentication, homeController.scheduleTimings);
router.get('/search', homeController.search);
router.get('/social-media', passport.checkAuthentication, homeController.socialMedia);
router.get('/settings', passport.checkAuthentication, homeController.settings);
router.get('/steps', passport.checkAuthentication, homeController.steps)
router.get('/term-condition', homeController.termCondition);
router.get('/timing', passport.checkAuthentication, homeController.timing);
router.get('/upload-documents', passport.checkAuthentication, homeController.uploadDocuments);
router.get('/video-call', passport.checkAuthentication, homeController.videoCall);
router.get('/voice-call', passport.checkAuthentication, homeController.voiceCall);
router.post('/verify', homeController.verify);
router.post('/signup', homeController.signUp);
router.get('/specialist', homeController.Specialist);
router.get('/terms', passport.checkAuthentication, homeController.terms);
router.get('/doc-register', homeController.docRegister);
router.get('/bank-details', passport.checkAuthentication, homeController.bankDetails);
router.get('/doctors', homeController.Doctors);




module.exports = router;