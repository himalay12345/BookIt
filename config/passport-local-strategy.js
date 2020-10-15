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

                console.log('Invalid username or password');
                req.flash('error', 'Invalid Username/Password');
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

passport.setAuthenticatedUser = function(req, res, next) {
    if (req.isAuthenticated()) {
        res.locals.user = req.user;
    }
    next();
}

module.exports = passport;