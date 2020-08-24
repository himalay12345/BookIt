const passport = require('passport');
const googleStrategy = require('passport-google-oauth20').Strategy;
const crypto = require('crypto');
const Patient = require('../models/patient');



passport.use(new googleStrategy({
        clientID: '728803225175-al2tlmub7iis0rdnnfdkq5tggr919a5o.apps.googleusercontent.com',
        clientSecret: 'wFsBm1QsFDCogvFAHxstSfQh',
        callbackURL: "http://localhost:4000/user/auth/google/callback",
    },
    function(accessToken, refreshToken, profile, done) {

        Patient.findOne({ email: profile.emails[0].value }).exec(function(err, patient) {
            if (err) {
                console.log('Error in google passport strategy', err);
                return;
            }

            console.log(profile);



            if (patient) {
                return done(null, patient);
            } else {
                Patient.create({
                        name: profile.displayName,
                        email: profile.emails[0].value,
                        password: crypto.randomBytes(20).toString('hex')


                    }, function(err, patient)

                    {
                        if (err) {
                            console.log('Error in creating google passport strategy', err);
                            return;
                        }
                        return done(null, patient);

                    });
            }
        });
    }
));