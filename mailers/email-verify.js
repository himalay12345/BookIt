const nodeMailer = require('../config/nodemailer');
const path = require('path');

exports.newAlert = (user,link,email) => {
    let htmlString = nodeMailer.renderTemplate(
        {
            user:user,
            link:link
           
        },'/email-verify/email-verification.ejs');

    nodeMailer.transporter.sendMail({
        from:'himalayshankar31@gmail.com',
        to: email,
        subject:"BookIt Email verification",
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