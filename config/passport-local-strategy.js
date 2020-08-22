const passport = require('passport');
const localStrategy = require('passport-local').Strategy;
const Patient = require('../models/patient');
const Doctor = require('../models/doctor');

passport.use(new localStrategy({
    usernameField: 'phone',
    passReqToCallback: true
}, function(req, phone, password, done) {
    if (req.body.type == 'Doctor') {
        Doctor.findOne({ phone: phone }, function(err, user) {
            if (err) {
                console.log('Error in finding doctor data in passport', err);
                return done(err);
            }

            if (!user || user.password != password) {

                console.log('Invalid username or password');
                req.flash('error', 'Invalid Username/Password');
                return done(null, false);
            }

            return done(null, user);
        });

    } else {
        Patient.findOne({ phone: phone }, function(err, user) {
            if (err) {
                console.log('Error in finding patient data in passport', err);
                return done(err);
            }

            if (!user || user.password != password) {

                console.log('Invalid username or password');
                req.flash('error', 'Invalid Username/Password');
                return done(null, false);
            }

            return done(null, user);
        });
    }
}));

passport.serializeUser(function(user, done) {

    return done(null, user);
});

passport.deserializeUser(async function(id, done) {
    let user = await Patient.findById(id);
    if (user) {
        return done(null, user);
    } else {
        let user = await Doctor.findById(id);

        return done(null, user);
    }



});

passport.checkAuthentication = function(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }


    return res.redirect('/login');
}

passport.setAuthenticatedUser = function(req, res, next) {
    if (req.isAuthenticated()) {
        res.locals.user = req.user;
    }
    next();
}

module.exports = passport;