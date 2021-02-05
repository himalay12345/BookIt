const express = require('express');
const router = express.Router();
const passport = require('passport');
const jwt = require('../config/noty');



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
router.get('/auth/google', function(req, res, next) {
    req.session.info = req.query;
    next();
 },passport.authenticate('google', { scope: ['profile email'] }));
router.get('/auth/google/callback', passport.authenticate('google', { failureRedirect: '/login' }), userController.popup);
router.get('/auth/facebook', passport.authenticate('facebook', { scope: ['email'] }));
router.get('/auth/facebook/callback', passport.authenticate('facebook', { failureRedirect: '/login' }), userController.popup);
router.post('/add-more-seats',passport.checkStaffAuthentication,userController.addMoreSeat);
router.post('/old-add-more-seats',passport.checkStaffAuthentication,userController.oldAddMoreSeat);
router.post('/profile/update', userController.profileUpdate);
router.post('/update-type', userController.updateType);
router.post('/update-profile',userController.updateProfile);
router.post('/update-medical-registration',userController.updateMedicalRegistration);
router.post('/update-education',userController.updateEducation);
router.post('/update-establishment',userController.updateEstablishment);
router.post('/confirm-pay',userController.confirmPay);
router.post('/check-two-factor',userController.checkTwoFactor);
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
router.post('/verification',userController.verification);
router.get('/verify-email',userController.verifyEmail);
router.get('/webhooks/razorpay',userController.webhooks);
router.get('/payments/refund',userController.refund);
router.post('/pause-booking-service',userController.pauseBookingService);
router.post('/search-doctor',userController.searchDoctor);
router.post('/remove-doctor',userController.removeDoctor);
router.get('/delete-date',userController.deleteDate);
router.post('/change-bank-account',userController.changeBankAccount);
router.post('/set-booking-fee', userController.setBookingFee);
router.post('/staff-set-booking-fee', userController.staffSetBookingFee);
router.post('/staff-old-checkout', userController.staffOldCheckout);
router.post('/doctor-profile/update', userController.doctorProfileUpdate);
router.post('/reset-password', userController.resetPassword);
router.post('/reset-staff-password', userController.resetStaffPassword);
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
router.post('/old-sort-by-date',userController.oldSortByDate);
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
router.post('/edit-patient',userController.editPatient)
router.post('/add-bill',userController.addBill)
router.post('/add-expenses',userController.addExpenses)
router.post('/billing-sort-by-date',userController.billingSortByDate)
router.post('/update-bill',userController.updateBill)
router.post('/update-expenses',userController.updateExpenses)
router.get('/delete-bill',userController.deleteBill)
router.get('/delete-expenses',userController.deleteExpenses)
router.post('/add-bill1',userController.addBill1)
router.post('/add-expenses1',userController.addExpenses1)
router.post('/billing-sort-by-date1',userController.billingSortByDate1)
router.post('/update-bill1',userController.updateBill1)
router.post('/update-expenses1',userController.updateExpenses1)
router.get('/delete-bill1',userController.deleteBill1)
router.get('/delete-expenses1',userController.deleteExpenses1)
router.get('/delete-entry',userController.deleteEntry)
// -------------------------------------------
router.get('/validate-user',jwt.authenticateToken, userController.demo);
router.post('/check-authentication',userController.checkAuthentication);
router.post('/create-user-account',userController.createUserAccount);
router.post('/create-user-session', passport.authenticate('local', {
    failureRedirect: '/fail'
}), userController.createUserSession);
module.exports = router;