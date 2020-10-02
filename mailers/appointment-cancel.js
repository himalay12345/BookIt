const nodeMailer = require('../config/nodemailer');
const path = require('path');

exports.newAlert = (date, time, email, doctor, patient) => {
    let htmlString = nodeMailer.renderTemplate(
        {
            date:date,
            time:time,
            doctor:doctor,
            patient:patient
        },'/appointment-alert/booking-cancel.ejs');

    nodeMailer.transporter.sendMail({
        from:'himalayshankar31@gmail.com',
        to: email,
        subject:"BookIt Appointment Alerts",
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