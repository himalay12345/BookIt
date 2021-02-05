const express = require('express');
const passport = require('passport');
const router = express.Router();

router.use('/admin', require('./admin'));
router.use('/user', require('./user'));
router.use('/test', require('./test'));
router.use('/api', require('./api'));
const homeController = require('../controllers/index');

router.get('/', homeController.home);

router.get('/add-billing', passport.checkDoctorAuthentication, homeController.addBilling);
router.get('/add-bank', passport.checkDoctorAuthentication, homeController.addBank);
router.get('/add-doctor', passport.checkStaffAuthentication, homeController.addDoctor);
router.post('/add-entries', passport.checkStaffAuthentication, homeController.addEntries);
router.get('/add-bill', passport.checkStaffAuthentication, homeController.addBill);
router.get('/lab-bill', passport.checkStaffAuthentication, homeController.addBill1);
router.get('/add-prescription', passport.checkDoctorAuthentication, homeController.addPrescription);
router.get('/appointments', passport.checkDoctorAuthentication, homeController.appointments);
router.get('/app-coming-soon', homeController.appComingSoon);
router.get('/appointment-detail', passport.checkPatientAuthentication, homeController.appointmentDetail);
router.get('/blank-page', passport.checkAuthentication, homeController.blankPage);
router.get('/booking', homeController.booking);
router.get('/booking-pdf', homeController.bookingPdf);
router.get('/billing-pdf', homeController.billingPdf);
router.get('/billing-pdf1', homeController.billingPdf1);
router.get('/booking-success', passport.checkAuthentication, homeController.bookingSuccess);
router.get('/booking-service', passport.checkDoctorAuthentication, homeController.bookingServiceSetting);
router.get('/calendar', passport.checkAuthentication, homeController.calendar);
router.get('/change-password', passport.checkAuthentication, homeController.changePassword);
router.get('/chat', passport.checkAuthentication, homeController.chat);
router.get('/consult', homeController.consult);
router.get('/edit-patient', homeController.editPatient);
router.get('/test', homeController.test);
router.get('/test1', homeController.test1);
router.get('/today-bill', homeController.todayBill);
router.get('/coming-soon', homeController.comingSoon);
router.post('/create-account', homeController.createAccount);
router.post('/create-new-password', homeController.createNewPassword);
router.post('/change-password', homeController.changePasswordPost);
router.get('/change-bank-account', passport.checkDoctorAuthentication, homeController.changeBankAccount);
router.get('/chat-doctor', passport.checkAuthentication, homeController.chatDoctor);
router.get('/checkout', passport.checkAuthentication, homeController.checkout);
router.get('/components', passport.checkAuthentication, homeController.components);
router.get('/delete-account', passport.checkAuthentication, homeController.deleteAccount);
router.get('/doctor-change-password', passport.checkAuthentication, homeController.doctorChangePassword);
router.get('/doctor-terms-and-condition', passport.checkDoctorAuthentication, homeController.doctorTermsAndCondition);
router.get('/doctor-dashboard', passport.checkDoctorAuthentication, homeController.doctorDashboard);
router.get('/doctor-profile', homeController.doctorProfile);
router.get('/doctor-profile-settings', passport.checkDoctorAuthentication, homeController.doctorProfileSettings);
router.get('/doctor-register', passport.checkAuthentication, homeController.doctorRegister);
router.get('/edit-billing', passport.checkDoctorAuthentication, homeController.editBilling);
router.get('/edit-prescription', passport.checkDoctorAuthentication, homeController.editPrescription);
router.get('/educational', passport.checkDoctorAuthentication, homeController.educational);
router.get('/email-verified', homeController.emailVerified);
router.get('/email-not-verified', homeController.emailNotVerified);
router.get('/establishment', passport.checkDoctorAuthentication, homeController.establishment);
router.get('/favourites', passport.checkPatientAuthentication, homeController.favourites);
router.get('/fees', passport.checkDoctorAuthentication, homeController.fees);
router.get('/forgot-password', homeController.forgotPassword);
router.get('/index-2', homeController.home);
router.get('/invoice-view', passport.checkAuthentication, homeController.invoiceView);
router.get('/invoice-user-view', passport.checkAuthentication, homeController.invoiceUserView);
router.get('/invoices', passport.checkDoctorAuthentication, homeController.invoices);
router.get('/id-proof', passport.checkDoctorAuthentication, homeController.idProof);
router.get('/login', homeController.login);
router.get('/live-patient-tracking', homeController.livePatientTracking);
router.get('/my-patients', passport.checkDoctorAuthentication, homeController.myPatients);
router.get('/medical-registration', passport.checkDoctorAuthentication, homeController.medicalRegistration);
router.get('/medical-proof', passport.checkDoctorAuthentication, homeController.medicalProof);
router.get('/medical-records', passport.checkPatientAuthentication, homeController.medicalRecords);
router.get('/my-billing', passport.checkPatientAuthentication, homeController.myBilling);
router.get('/my-appointments', passport.checkPatientAuthentication, homeController.myAppointments);
router.get('/notification-settings', passport.checkAuthentication, homeController.notificationSettings);
router.get('/not-available', passport.checkAuthentication, homeController.notAvailable);
router.get('/old-booking', homeController.oldBooking);
router.get('/add-entries', passport.checkStaffAuthentication, homeController.addEntry);
router.get('/pay', passport.checkAuthentication, homeController.pay);
router.post('/razorpay', homeController.razorPay);
router.get('/remove-flag', homeController.removeFlag);
router.get('/refund', homeController.refund);
router.get('/refund-checkout', homeController.refundCheckout);
router.get('/patient-dashboard', passport.checkPatientAuthentication, homeController.patientDashboard);
router.get('/prescription', passport.checkPatientAuthentication, homeController.prescription);
router.get('/patient-profile', passport.checkDoctorAuthentication, homeController.patientProfile);
router.get('/patient-tracking', homeController.patientTracking);
router.get('/privacy-policy', homeController.privacyPolicy);
router.get('/profile-settings', passport.checkPatientAuthentication, homeController.profileSettings);
router.get('/profile-info', passport.checkDoctorAuthentication, homeController.profileInfo);
router.get('/preview-profile', passport.checkAuthentication, homeController.previewProfile);
router.get('/prescription-pad', passport.checkAuthentication, homeController.prescriptionPad);
router.get('/pdf', homeController.pdf);
router.get('/register', homeController.register);
router.get('/reviews', passport.checkDoctorAuthentication, homeController.reviews);
router.get('/schedule-timings', passport.checkDoctorAuthentication, homeController.scheduleTimings);
router.get('/staff-schedule-timings', passport.checkStaffAuthentication, homeController.staffScheduleTimings);
router.get('/search', homeController.search);
router.get('/social-media', passport.checkAuthentication, homeController.socialMedia);
router.get('/two-factor', passport.checkAuthentication, homeController.twoFactorSetting);
router.post('/two-factor',passport.checkAuthentication,homeController.twoFactor);
router.post('/verify-2factor',passport.checkAuthentication,homeController.verify2Factor)
router.post('/verify-2factor1',homeController.verify2Factor1)
router.post('/enable-2factor',passport.checkAuthentication, homeController.enable2Factor)
router.post('/enable-2factorverify', homeController.enable2FactorVerify)
router.get('/encrypt-password',homeController.encryptPassword)
router.get('/select-doctor', homeController.selectDoctor);
router.get('/settings', passport.checkAuthentication, homeController.settings);
router.get('/staff-login', homeController.staffLogin);
router.get('/staff-profile', passport.checkStaffAuthentication, homeController.staffProfile);
router.get('/staff-booking-service', passport.checkStaffAuthentication, homeController.staffBookingService);
router.get('/staff-forgot-password', homeController.staffForgotPassword);
router.get('/staff-dashboard', passport.checkStaffAuthentication, homeController.staffDashboard);
// router.get('/staff-add-doctor', passport.checkStaffAuthentication, homeController.staffAddDoctor);
router.get('/staff-login-page', homeController.staffLoginPage);
router.get('/customer_service', homeController.customerService);

router.get('/staff-booking', passport.checkStaffAuthentication, homeController.staffBooking);
router.get('/staff-old-booking', passport.checkStaffAuthentication, homeController.staffOldBooking);
router.get('/steps', passport.checkDoctorAuthentication, homeController.steps)
router.get('/term-condition', homeController.termCondition);
router.get('/timing', passport.checkDoctorAuthentication, homeController.timing);
router.get('/upload-documents', passport.checkDoctorAuthentication, homeController.uploadDocuments);
router.get('/upload-eproof', passport.checkDoctorAuthentication, homeController.uploadEProof);
router.get('/video-call', passport.checkAuthentication, homeController.videoCall);
router.get('/voice-call', passport.checkAuthentication, homeController.voiceCall);
router.post('/verify', homeController.verify);
router.post('/verify-new', homeController.verifyNew);
router.post('/verify-forgot', homeController.verifyForgot);
router.post('/verify-staff-forgot', homeController.verifyStaffForgot);
router.post('/verify-doctor', homeController.verifyDoctor);
router.post('/verify-add-doctor', homeController.verifyAddDoctor);
router.post('/verify-doctor-mobile', homeController.verifyDoctorMobile);
router.post('/signup', homeController.signUp);
router.post('/staff-signup', homeController.staffSignup);
router.post('/staff-add-doctor', homeController.staffAddDoctor);
router.post('/staff-signup-new', homeController.staffSignupNew);
router.get('/specialist', homeController.Specialist);
router.get('/specialist-all', homeController.SpecialistAll);
router.get('/terms', passport.checkDoctorAuthentication, homeController.terms);
router.get('/doc-register', homeController.docRegister);
router.get('/bank-details', passport.checkDoctorAuthentication, homeController.bankDetails);
router.get('/doctors', homeController.Doctors);

// ---------------------------------------------------

router.post('/verify-user', homeController.verifyUser);
router.post('/user-signup', homeController.userSignup);
router.get('/fail',homeController.fail);



module.exports = router;