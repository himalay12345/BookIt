const passport = require('passport');
const localStrategy = require('passport-local').Strategy;
const User = require('../models/user');

passport.use(new localStrategy({
    usernameField: 'phone',
    passReqToCallback: true
}, function(req, phone, password, done) {
        User.findOne({ phone: phone , service:'phone' }, function(err, user) {
            if (err) {
                console.log('Error in finding patient data in passport', err);
                return done(err);
            }

            if (!user || user.password != password) {

                
                req.flash('error', 'Invalid Username/Password');
                // res.json({
                //     status:true,
                //     msg:'Invalid Username or Password'
                // })
                return done(null, false);
            }

            return done(null, user);
        });
    
}));

passport.serializeUser(function(user, done) {

    return done(null, user);
});

passport.deserializeUser(async function(id, done) {
    let user = await User.findById(id);

        return done(null, user);



});

passport.checkAuthentication = function(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }


    return res.redirect('/login');
}


passport.checkDoctorAuthentication = function(req, res, next) {
    if (req.isAuthenticated() && req.user.type == 'Doctor') {
        return next();
    }


    return res.redirect('/login');
}
passport.checkStaffAuthentication = function(req, res, next) {
    if (req.isAuthenticated() && req.user.type == 'Staff') {
        return next();
    }


    return res.redirect('/login');
}
passport.checkPatientAuthentication = function(req, res, next) {
    if (req.isAuthenticated() && req.user.type == 'Patient') {
        return next();
    }


    return res.redirect('/login');
}




passport.checkAdminAuthentication = function(req, res, next) {
    if (req.isAuthenticated() && req.user.type == 'Adminstrator') {
        return next();
    }


    return res.redirect('/admin/login');
}

passport.setAuthenticatedUser = function(req, res, next) {
    
    if (req.isAuthenticated()) {
        res.locals.user = req.user;
    }
    next();
}

module.exports = passport;