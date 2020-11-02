const express = require('express');
const port = 4000;
const app = express();
const expressLayouts = require('express-ejs-layouts');
const db = require('./config/mongoose');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const passport = require('passport');
const passportLocal = require('./config/passport-local-strategy');
const passportGoogle = require('./config/google_passport_auth2');
const passportFacebook = require('./config/passport-facebook-oauth-strategy');
const MongoStore = require('connect-mongo')(session);
const flash = require('connect-flash');
const customMiddleware = require('./config/noty');
const bodyParser = require('body-parser');
const trackServer = require('http').Server(app);
const trackSockets = require('./config/track_socket').trackSockets(trackServer);
trackServer.listen(5000);
console.log('Patient Tracking server is running on port 5000');


app.use(expressLayouts);
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static('./assets'));
app.use('/uploads', express.static(__dirname + '/uploads'));
app.set('view engine', 'ejs');
app.set('views', './views');

// app.use((req, res, next)=>{
//     res.locals.message = req.session.message
//     delete req.session.message
//     next()
//   });

app.use(session({
    name: 'Bookit',
    // To be changed at deployment
    secret: 'blahsomething',
    saveUninitialized: false,
    resave: false,
    cookie: {
        maxAge: (20000 * 60 * 100)
    },
    store: new MongoStore({
        mongooseConnection: db,
        autoRemove: 'disabled'

    }, function(err) {
        if (err) {
            console.log('Error in MongoStore');
        }
    })

}));

app.use(passport.initialize());
app.use(passport.session());
app.use(passport.setAuthenticatedUser);
app.use(flash());
app.use(customMiddleware.setFlash);
app.use('/', require('./routes/index'));

app.listen(port, function(err) {
    if (err) {
        console.log('Error', err);
        return;
    }

    console.log('Server is running on port ', port);
})