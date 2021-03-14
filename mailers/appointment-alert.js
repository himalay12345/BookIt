const nodeMailer = require('../config/nodemailer');
const path = require('path');

exports.newAlert = (date, time, email, doctor, patient) => {
    let htmlString = nodeMailer.renderTemplate(
        {
            date:date,
            time:time,
            doctor:doctor,
            patient:patient
        },'/appointment-alert/booking-success.ejs');

    nodeMailer.transporter.sendMail({
       
        from:'support@aarogyahub.com',
        to: email,
        subject:"AarogyaHub Appointment Alerts",
        html:htmlString
},(err,info) => {
    if(err)
    {
        console.log('Error in sending mail',err);
        return;
    }
    console.log('Message sent',info);
    return;
});
} 

exports.newDoctorAlert = (name,age,phone,address,number,date,day, time, fee,email) => {
    let htmlString = nodeMailer.renderTemplate(
        {
            name:name,
            age:age,
            phone:phone,
            address:address,
            number:number,
            date:date,
            day:day,
            time:time,
            fee:fee
        },'/appointment-alert/d-booking-success.ejs');

    nodeMailer.transporter.sendMail({
        // from:'himalayshankar31@gmail.com',
        // from:'AarogyaHub',
        from:'support@aarogyahub.com',
        to: email,
        subject:"AarogyaHub Appointment Alerts",
        html:htmlString
},(err,info) => {
    if(err)
    {
        console.log('Error in sending mail',err);
        return;
    }
    console.log('Message sent',info);
    return;
});
} 

exports.newDoctorAlertPOC = (name,age,phone,address,number,date,day, time, fee,email) => {
    let htmlString = nodeMailer.renderTemplate(
        {
            name:name,
            age:age,
            phone:phone,
            address:address,
            number:number,
            date:date,
            day:day,
            time:time,
            fee:fee
        },'/appointment-alert/d-booking-success1.ejs');

    nodeMailer.transporter.sendMail({
        // from:'himalayshankar31@gmail.com',
        // from:'AarogyaHub',
        from:'support@aarogyahub.com',
        to: email,
        subject:"AarogyaHub Appointment Alerts",
        html:htmlString
},(err,info) => {
    if(err)
    {
        console.log('Error in sending mail',err);
        return;
    }
    console.log('Message sent',info);
    return;
});
}

exports.adminAlert = (name,age,phone,address,number,date,day, time, fee,email,dname) => {
    let htmlString = nodeMailer.renderTemplate(
        {
            name:name,
            age:age,
            phone:phone,
            address:address,
            number:number,
            date:date,
            day:day,
            time:time,
            fee:fee,
            dname:dname
        },'/appointment-alert/admin-booking-success.ejs');

    nodeMailer.transporter.sendMail({
        // from:'himalayshankar31@gmail.com',
        // from:'AarogyaHub',
        from:'support@aarogyahub.com',
        to: email,
        subject:"AarogyaHub Appointment Alerts",
        html:htmlString
},(err,info) => {
    if(err)
    {
        console.log('Error in sending mail',err);
        return;
    }
    console.log('Message sent',info);
    return;
});
} 


exports.covidAlert = (name,aadhar,dob,gender,email,phone,address,chronic,medication,symptoms, past) => {
    let htmlString = nodeMailer.renderTemplate(
        {
            name:name,
            aadhar:aadhar,
            dob:dob,
            gender:gender,
            email:email,
            phone:phone,
            address:address,
            chronic:chronic,
            medication:medication,
            symptoms:symptoms,
            past:past
        },'/vaccine-alert.ejs');

    nodeMailer.transporter.sendMail({
        from:'support@aarogyahub.com',
        to: email,
        subject:"AarogyaHub Appointment Alerts",
        html:htmlString
},(err,info) => {
    if(err)
    {
        console.log('Error in sending mail',err);
        return;
    }
    console.log('Message sent',info);
    return;
});
} 

exports.adminCovidAlert = (name,aadhar,dob,gender,email,phone,address,chronic,medication,symptoms, past) => {
    let htmlString = nodeMailer.renderTemplate(
        {
            name:name,
            aadhar:aadhar,
            dob:dob,
            gender:gender,
            email:email,
            phone:phone,
            address:address,
            chronic:chronic,
            medication:medication,
            symptoms:symptoms,
            past:past
        },'/vaccine-alert.ejs');

    nodeMailer.transporter.sendMail({
        from:'support@aarogyahub.com',
        to:'himalayshankar32@gmail.com',
        subject:"AarogyaHub Covid Alerts",
        html:htmlString
},(err,info) => {
    if(err)
    {
        console.log('Error in sending mail',err);
        return;
    }
    console.log('Message sent',info);
    return;
});
} 