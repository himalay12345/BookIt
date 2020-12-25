const nodeMailer = require('../config/nodemailer');
const path = require('path');

exports.newAlert = (date, time, email, doctor, patient) => {
    let htmlString = nodeMailer.renderTemplate(
        {
            date:date,
            time:time,
            doctor:doctor,
            patient:patient
        },'/appointment-alert/booking-cancel1.ejs');

    nodeMailer.transporter.sendMail({
        // from:'himalayshankar31@gmail.com',
        from:'support@aarogyahub.com',
        to: email,
        subject:"AarogyaHub Appointment Cancellation Alerts",
        html:htmlString
},(err,info) => {
    if(err)
    {
        console.log('Error in sending mail',err);
        return;
    }
    // console.log('Message sent',info);
    return;
});
} 