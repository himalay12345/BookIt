const nodeMailer = require('../config/nodemailer');
const path = require('path');

exports.newAlert = (user,email) => {
    let htmlString = nodeMailer.renderTemplate(
        {
            user:user
           
        },'/account-confirmation/service-start.ejs');

    nodeMailer.transporter.sendMail({
        // from:'himalayshankar31@gmail.com',
        from:'support@aarogyahub.com',
        to: email,
        subject:"AarogyaHub Booking Service Activation Confirmation",
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