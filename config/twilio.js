const env = require('./environment');
module.exports = {
    serviceID: env.twilio_sid,
    accountSID: env.twilio_account_sid,
    authToken: env.twilio_auth_token
}