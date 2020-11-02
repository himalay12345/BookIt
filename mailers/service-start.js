const nodeMailer = require('../config/nodemailer');
const path = require('path');

exports.newAlert = (user,email) => {
    let htmlString = nodeMailer.renderTemplate(
        {
            user:user
           
        },'/account-confirmation/service-start.ejs');

    nodeMailer.transporter.sendMail({
        from:'himalayshankar31@gmail.com',
        to: email,
        subject:"BookIt Booking Service Activation Confirmation",
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