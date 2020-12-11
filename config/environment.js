const fs = require('fs');
const rfs = require('rotating-file-stream');
const path = require('path');
const os = require('os');


const logDirectory = path.join(__dirname, '../production_logs');
fs.existsSync(logDirectory) || fs.mkdirSync(logDirectory);

const accessLogStream = rfs.createStream('access.log', {
    interval: '1d',
    path: logDirectory
});


const development = {
    name: 'development',
    asset_path: './assets',
    session_cookie_key: 'aarogya@123',
    db: 'Aarogyahub',
    smtp: {
        host: "smtpout.secureserver.net",  
        secure: true,
        secureConnection: false,
        tls: {
            ciphers:'SSLv3'
        },
        requireTLS:true,
        port: 465,
        debug: true,
        auth: {
            user: 'support@aarogyahub.com',
            pass: 'Himalay@NIXXIT'
        }
    },
    // razorpay_key_id: 'rzp_test_KPgD2YFDnBI7Ib',
    razorpay_key_id: 'rzp_live_JBEggrx7YLvrh2',
    // razorpay_key_secret: 'dlb3M9b3nEWXU6TYSzRlDhTJ',
    razorpay_key_secret: '24qtmFj0IqbCVjpj3aofbyaN',
    google_client_id: '962720186337-l6gu83hkfs1qhh6f4vhv4ej0gad3e1ed.apps.googleusercontent.com',
    google_client_secret: 'OcauqQn-wvQezypG9ZMsJEf7',
    // google_callback_url: "/user/auth/google/callback",
    google_callback_url:"https://aarogyahub.com/user/auth/google/callback",
    fb_client_id: '247163950066857',
    fb_client_secret: 'c522c88a2060f9d8861cf47228f1964d',
    fb_callback_url: "/user/auth/facebook/callback",
    fb_profile_fields: ['id', 'displayName', 'picture.type(large)', 'email'],
    twilio_sid: "VA8bd100c88cde205a490376c7a1a6273a",
    twilio_account_sid: "AC072f252c5635d5be8d199882a12ea742",
    twilio_auth_token: "eb88d830e6c104e726dc011b442eedd1",
    gmail_passw: 'Himalay@NIXXIT',
    morgan: {
        mode: 'dev',
        options: { stream: accessLogStream }
    }
}

const production = {
    name: 'production',
    asset_path: process.env.ASSET_PATH,
    session_cookie_key: process.env.SESSION_COOKIE_KEY,
    db: process.env.DB,
    smtp: {
        host: "smtpout.secureserver.net",  
        secure: true,
        secureConnection: false,
        tls: {
            ciphers:'SSLv3'
        },
        requireTLS:true,
        port: 465,
        debug: true,
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASSWORD,
        }
    },
    razorpay_key_id: process.env.R_KEY_ID,
    razorpay_key_secret: process.env.R_KEY_SECRET,
    google_client_id: process.env.G_CLIENT_ID,
    google_client_secret: process.env.G_SECRET,
    google_callback_url: process.env.G_CALLBACK_URL,
    fb_client_id: process.env.FB_CLIENT_ID,
    fb_client_secret: process.env.FB_CLIENT_SECRET,
    fb_callback_url: process.env.FB_CALLBACK_URL,
    fb_profile_fields: ['id', 'displayName', 'picture.type(large)', 'email'],
    twilio_sid: process.env.T_SID,
    twilio_account_sid: process.env.T_ACC_SID,
    twilio_auth_token: process.env.T_AUTH_TOKEN,
    gmail_passw: process.env.GMAIL_PASSW,
    morgan: {
        mode: 'combined',
        options: { stream: accessLogStream }
    }
}


// module.exports = eval(process.env.AAROGYAHUB_ENVIRONMENT == undefined) ? development : eval(process.env.AAROGYAHUB_ENVIRONMENT);
module.exports = development;