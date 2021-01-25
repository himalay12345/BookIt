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
    session_cookie_key:  process.env.SESSION_COOKIE_KEY,
    db:  process.env.DB,
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
            user:process.env.SMTP_USER,
            pass:process.env.SMTP_PASSWORD

        }
    },

    // razorpay_key_id: process.env.RAZOR_TEST_KEY,
    razorpay_key_id:  process.env.RAZOR_LIVE_KEY,
    // razorpay_key_secret:  process.env.RAZOR_TEST_SECRET,
    razorpay_key_secret: process.env.RAZOR_LIVE_SECRET,
    google_client_id:  process.env.G_CLIENTID,
    google_client_secret:  process.env.G_CLIENTSECRET,
    // google_callback_url:  process.env.G_TESTCALLBACK,
    google_callback_url:  '/user/auth/google/callback',
    // google_callback_url: process.env.G_LIVECALLBACK,
    fb_client_id:  process.env.FB_CLIENTID,
    fb_client_secret:  process.env.FB_CLIENTSECRET,
    fb_callback_url: process.env.FB_CALLBACK,
    fb_profile_fields: ['id', 'displayName', 'picture.type(large)', 'email'],
    twilio_sid:process.env. TW_SID,
    twilio_account_sid:process.env. TW_ASID,
    twilio_auth_token: process.env.TW_AUTH,

    gmail_passw: process.env.G_PASSWORD,
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
    razorpay_key_id: process.env.RAZOR_LIVE_KEY,
    razorpay_key_secret: process.env.RAZOR_LIVE_SECRET,
    google_client_id: process.env.G_CLIENTID,
    google_client_secret: process.env.G_CLIENTSECRET,
    google_callback_url: process.env.G_LIVECALLBACK,
    fb_client_id: process.env.FB_CLIENTID,
    fb_client_secret: process.env.FB_CLIENTSECRET,
    fb_callback_url: process.env.FB_CALLBACK,
    fb_profile_fields: ['id', 'displayName', 'picture.type(large)', 'email'],
    twilio_sid: process.env.TW_SID,
    twilio_account_sid: process.env.TW_ASID,
    twilio_auth_token: process.env.TW_AUTH,
    gmail_passw: process.env.G_PASSWORD,
    morgan: {
        mode: 'combined',
        options: { stream: accessLogStream }
    }
}


// module.exports = eval(process.env.AAROGYAHUB_ENVIRONMENT == undefined) ? development : eval(process.env.AAROGYAHUB_ENVIRONMENT);
module.exports = development;