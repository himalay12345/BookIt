const passport = require('passport');
const FacebookStrategy = require('passport-facebook').Strategy;
const crypto = require('crypto');
const User = require('../models/patient');


passport.use(new FacebookStrategy({
        clientID: '307867103814688',
        clientSecret: '732c295e4ae72f2638770811193af75f',
        callbackURL: "http://localhost:4000/user/auth/facebook/callback",
        profileFields: ['id', 'displayName', 'picture.type(large)', 'email']
    },
    function(accessToken, refreshToken, profile, done) {
        // console.log(profile);
        User.findOne({ fbid: profile.id }).exec(function(err, user) {
            if (err) {
                console.log('Error in facebook passport strategy', err);
                return;
            }

            console.log(profile);

            if (user) {
                return done(null, user);
            } else {
                User.create({
                        name: profile.displayName,
                        password: crypto.randomBytes(20).toString('hex'),
                        avatar: profile.photos[0].value
                    }),
                    function(err, user) {
                        if (err) {
                            console.log('Error in creating facebook passport strategy', err);
                            return;
                        }
                        return done(null, user);
                    }
            }
        });
    }
));