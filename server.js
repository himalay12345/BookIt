const express = require('express');
const port = 4000;
const app = express();
const db = require('./config/mongoose');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const passport = require('passport');
const passportLocal = require('./config/passport-local-strategy');
const MongoStore = require('connect-mongo')(session);
// const twilio = require('./config/twilio');

app.use(express.urlencoded());
app.use(cookieParser());
app.use(express.static('./assets'));
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
    secret:'blahsomething',
    saveUninitialized:false,
    resave:false,
    cookie:{
        maxAge:(5000*60*100)
    },
    store: new MongoStore({
            mongooseConnection: db ,
            autoRemove: 'disabled'

    },function(err)
    {
        if(err){
        console.log('Error in MongoStore');
        }
    })

}));

app.use(passport.initialize());
app.use(passport.session());
app.use(passport.setAuthenticatedUser);
app.use('/', require('./routes/index'));

app.listen(port, function(err) {
    if (err) {
        console.log('Error', err);
        return;
    }

    console.log('Server is running on port ', port);
})