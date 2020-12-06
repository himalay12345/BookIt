const express = require('express');
const router = express.Router();
const passport = require('passport');



const userController = require('../controllers/user');

router.post('/create', userController.create);
router.post('/create-staff', userController.createStaff);

router.post('/create-session', passport.authenticate('local', {
    failureRedirect: '/login'
}), userController.createSession);
router.post('/create-staff-session', passport.authenticate('local', {
    failureRedirect: '/staff-login-page'
}), userController.createStaffSession);
router.get('/logout', userController.destroySession);
router.get('/auth/google', passport.authenticate('google', { scope: ['profile email'] }));
router.get('/auth/google/callback', passport.authenticate('google', { failureRedirect: '/login' }), userController.popup);
router.get('/auth/facebook', passport.authenticate('facebook', { scope: ['email'] }));
router.get('/auth/facebook/callback', passport.authenticate('facebook', { failureRedirect: '/login' }), userController.popup);
router.post('/add-more-seats',passport.checkStaffAuthentication,userController.addMoreSeat);
router.post('/profile/update', userController.profileUpdate);
router.post('/update-type', userController.updateType);
router.post('/update-profile',userController.updateProfile);
router.post('/update-medical-registration',userController.updateMedicalRegistration);
router.post('/update-education',userController.updateEducation);
router.post('/update-establishment',userController.updateEstablishment);
router.post('/confirm-pay',userController.confirmPay);
router.post('/manage-booking-service',userController.manageBookingService);
router.post('/manage-notification',userController.manageNotification);
router.post('/doctor-review',passport.checkAuthentication,userController.doctorReview);
router.post('/set-schedule-timing', userController.setScheduleTiming);
router.post('/staff-set-old-patient', userController.staffSetOldPatient);
router.post('/staff-set-schedule-timing', userController.staffSetScheduleTiming);
router.post('/staff-set-old-schedule-timing', userController.staffSetOldScheduleTiming);
router.post('/update-schedule', userController.updateSchedule);
router.post('/staff-update-schedule', userController.staffUpdateSchedule);
router.post('/staff-old-update-schedule', userController.staffOldUpdateSchedule);
router.post('/verify-payment',userController.verifyPayment);
router.get('/verify-email',userController.verifyEmail);
router.post('/payments/refund',userController.refund)
router.post('/search-doctor',userController.searchDoctor);
router.post('/change-bank-account',userController.changeBankAccount);
router.post('/set-booking-fee', userController.setBookingFee);
router.post('/staff-set-booking-fee', userController.staffSetBookingFee);
router.post('/staff-old-checkout', userController.staffOldCheckout);
router.post('/doctor-profile/update', userController.doctorProfileUpdate);
router.post('/reset-password', userController.resetPassword);
router.post('/change-password', userController.changePassword);
router.post('/doc-change-password', userController.docchangePassword);
router.post('/bank-details', userController.bankDetails);
router.post('/filter', userController.Filter);
router.post('/book-appointment',userController.bookAppointment);
router.post('/staff-book-appointment',userController.staffBookAppointment);
router.post('/book-old-appointment', userController.bookOldAppointment)
router.post('/old-checkout', userController.oldCheckout)
router.post('/payment',userController.payment);
router.post('/offline-pay',userController.offlinePay);
router.post('/old-offline-pay',userController.oldOfflinePay);
router.post('/offline-cancel',userController.offlineCancel);
router.post('/sort-by-date',userController.sortByDate);
router.post('/doctor-sort-by-date',userController.doctorSortByDate);
router.get('/add-favourite',passport.checkAuthentication, userController.addFavourite);
router.post('/upload-id', userController.uploadId);
router.post('/upload-idproof', userController.uploadIdProof);
router.post('/upload-degree', userController.uploadDegree);
router.post('/upload-eproof', passport.checkDoctorAuthentication, userController.uploadEProof);
router.post('/accept-agreement', userController.acceptAgreement);
router.get('/delete-registration', userController.deleteRegistration);
router.post('/delete-account',userController.deleteAccount);
router.get('/delete-award', userController.deleteAward);
router.get('/delete-experience', userController.deleteExperience);
router.get('/delete-education', userController.deleteEducation);
router.get('/delete-clinic-photo', userController.deleteClinicPhoto);

module.exports = router;