const express = require('express');
const router = express.Router();
const passport = require('passport');

const adminController = require('../controllers/admin');

router.get('/appointment-list',passport.checkAdminAuthentication, adminController.appointmentList);
router.get('/application-request',passport.checkAdminAuthentication, adminController.applicationRequest);
router.get('/account-change',passport.checkAdminAuthentication, adminController.accountChange);
router.post('/approve-documents',passport.checkAdminAuthentication, adminController.approveDocuments);
router.post('/approve-bank',passport.checkAdminAuthentication, adminController.approveBank);
router.post('/approve-requested-bank',passport.checkAdminAuthentication,adminController.approveRequestedBank);
router.post('/addconsult',passport.checkAdminAuthentication, adminController.addConsultData);
router.get('/addtest',passport.checkAdminAuthentication, adminController.addtest);
router.get('/a-consult',passport.checkAdminAuthentication, adminController.aconsult);
router.get('/addconsult',passport.checkAdminAuthentication, adminController.addconsult);
router.post('/addtest',passport.checkAdminAuthentication, adminController.atest);
router.post('/updatetest',passport.checkAdminAuthentication, adminController.updatetest);
router.get('/blank-page',passport.checkAdminAuthentication, adminController.blankPage);
router.get('/components',passport.checkAdminAuthentication, adminController.componentsList);
router.post('/create-account',adminController.createAccount);
router.post('/create-session', passport.authenticate('local', {
    failureRedirect: '/admin/login'
}), adminController.createSession);
router.get('/change-profile',passport.checkAdminAuthentication, adminController.changeProfile);
router.get('/data-tables',passport.checkAdminAuthentication, adminController.dataTables);
router.get('/delete-test',passport.checkAdminAuthentication, adminController.deletetest);
router.get('/delete-consult',passport.checkAdminAuthentication, adminController.deleteconsult);
router.get('/edit-test',passport.checkAdminAuthentication, adminController.edittest);
router.get('/doctor-list',passport.checkAdminAuthentication, adminController.doctorList);
router.get('/error-404',passport.checkAdminAuthentication, adminController.error404);
router.get('/error-500',passport.checkAdminAuthentication, adminController.error500);
router.get('/forgot-password',passport.checkAdminAuthentication, adminController.forgotPassword);
router.get('/form-basic-inputs',passport.checkAdminAuthentication, adminController.formBasicInputs);
router.get('/form-horizontal',passport.checkAdminAuthentication, adminController.formHorizontal);
router.get('/form-input-groups',passport.checkAdminAuthentication, adminController.formInputGroups);
router.get('/form-mask',passport.checkAdminAuthentication, adminController.formMask);
router.get('/form-validation',passport.checkAdminAuthentication, adminController.formValidation);
router.get('/form-vertical',passport.checkAdminAuthentication, adminController.formVertical);
router.get('/index', passport.checkAdminAuthentication , adminController.index);
router.get('/invoice',passport.checkAdminAuthentication, adminController.invoice);
router.get('/invoice-report',passport.checkAdminAuthentication, adminController.invoiceReport);
router.get('/lock-screen',passport.checkAdminAuthentication, adminController.lockScreen);
router.get('/login', adminController.login);
router.get('/a-test',passport.checkAdminAuthentication, adminController.test);
router.get('/patient-list',passport.checkAdminAuthentication, adminController.patientList);
router.get('/profile',passport.checkAdminAuthentication, adminController.profile);
router.get('/phone-login',adminController.phoneLogin)
router.post('/verify',adminController.verify);
router.post('/signup',adminController.signUp);
router.get('/register', adminController.register);
router.get('/reviews',passport.checkAdminAuthentication, adminController.reviews);
router.get('/settings',passport.checkAdminAuthentication, adminController.settings);
router.get('/specialities',passport.checkAdminAuthentication, adminController.specialities);
router.get('/tables-basic',passport.checkAdminAuthentication, adminController.tablesBasic);
router.get('/transactions-list',passport.checkAdminAuthentication, adminController.transactionsList);

module.exports = router;