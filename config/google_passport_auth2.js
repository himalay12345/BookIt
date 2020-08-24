const passport = require('passport');
const googleStrategy = require('passport-google-oauth2').Strategy;
const crypto = require('crypto');
const User = require('../models/user');



passport.use(new googleStrategy({
        clientID: '728803225175-al2tlmub7iis0rdnnfdkq5tggr919a5o.apps.googleusercontent.com',
        clientSecret: 'wFsBm1QsFDCogvFAHxstSfQh',
        callbackURL: "http://localhost:4000/user/auth/google/callback"
    },
    function(accessToken, refreshToken, profile, done) {
        User.findOne({ email: profile.emails[0].value }).exec(function(err, user) {
            if (err) {
                console.log('Error in google passport strategy', err);
                return;
            }

            console.log(profile);



            if (user) {
                return done(null, user);
            } else {
                User.create({
                        name: profile.displayName,
                        email: profile.emails[0].value,
                        password: crypto.randomBytes(20).toString('hex'),


                    }, function(err, user)

                    {
                        if (err) {
                            console.log('Error in creating google passport strategy', err);
                            return;
                        }
                        return done(null, user);

                    });
            }
        });
    }
));