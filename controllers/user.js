const Patient = require('../models/patient');
const Doctor = require('../models/doctor');
const fs = require('fs');
const path = require('path');


module.exports.create = async(req, res) => {
    let patient = await Patient.create({
        name: req.body.name,
        phone: req.body.phone,
        password: req.body.password,
        service: 'phone',
        type: 'Patient'
    });

    req.flash('success', 'Account created successfully.Please Login!');
    return res.redirect('/login');
}
module.exports.createDoctor = async(req, res) => {
    let doctor = await Doctor.create({
        name: req.body.name,
        phone: req.body.phone,
        password: req.body.password,
        type: 'Doctor',
        service: 'phone'
    });

    req.flash('success', 'Account created successfully.Please Login!');
    return res.redirect('/login');
}

module.exports.createSession = function(req, res) {
    //Todo Later
    return res.redirect('/');
}

module.exports.destroySession = function(req, res) {
    req.logout();

    return res.redirect('/');
}

module.exports.changePassword = async(req, res) => {
    let patient = await Patient.findOne({ phone: req.body.phone });
    if (req.body.old != patient.password) {
        req.flash('error', 'Wrong Old Password!');
        return res.redirect('back');
    }

    if (req.body.password != req.body.confirm) {
        req.flash('error', 'Passwords do not match!')
        return res.redirect('back');
    }

    patient.password = req.body.password;
    patient.save();

    req.flash('success', 'Password changed successfully!');
    return res.redirect('back');
}

module.exports.resetPassword = async(req, res) => {
    if (req.body.password != req.body.confirm) {
        req.flash('error', 'Passwords do not match!');
        return res.render('set-password', {
            title: 'Reset-password',
            phone: req.body.phone
        })
    } else {
        let patient = await Patient.findOne({ phone: req.body.phone });
        patient.password = req.body.password;
        patient.save();

        req.flash('success', 'Password reset successfully');
        return res.redirect('/login');
    }
}
module.exports.profileUpdate = async function(req, res) {

    try {


        let patient = await Patient.findById(req.user.id);
        Patient.uploadedAvatar(req, res, function(err) {
            if (err) { console.log('*******Multer Error', err); return; }
            patient.name = req.body.name;
            patient.dob = req.body.dob;
            patient.phone = req.body.phone;
            patient.email = req.body.email;
            patient.address = req.body.address;
            patient.city = req.body.city;
            patient.state = req.body.state;
            patient.pincode = req.body.pincode;
            patient.country = req.body.country;
            patient.bloodgroup = req.body.bloodgroup;
            patient.gender = req.body.gender;



            if (req.file) {
                if (!patient.avatar) {
                    patient.avatar = Patient.avatarPath + '/' + req.file.filename;
                } else {

                    fs.unlinkSync(path.join(__dirname, '..', patient.avatar));
                    patient.avatar = Patient.avatarPath + '/' + req.file.filename;
                }
            }

            patient.save();


        });
        req.flash('success', 'Profile updated!');
        return res.redirect('back');


    } catch (err) {
        console.log('Error', err);
        return;
    }

}
module.exports.doctorProfileUpdate = async function(req, res) {

    try {


        let doctor = await Doctor.findById(req.user.id);
        Doctor.uploadedAvatar(req, res, function(err) {
            if (err) { console.log('*******Multer Error', err); return; }
            // patient.name = req.body.name;
            // patient.dob = req.body.dob;
            // patient.phone = req.body.phone;
            // patient.email = req.body.email;
            // patient.address = req.body.address;
            // patient.city = req.body.city;
            // patient.state = req.body.state;
            // patient.pincode = req.body.pincode;
            // patient.country = req.body.country;
            // patient.bloodgroup = req.body.bloodgroup;
            // patient.gender = req.body.gender;



            // if (req.file) {
            //     if (!patient.avatar) {
            //         patient.avatar = Patient.avatarPath + '/' + req.file.filename;
            //     } else {

            //         fs.unlinkSync(path.join(__dirname, '..', patient.avatar));
            //         patient.avatar = Patient.avatarPath + '/' + req.file.filename;
            //     }
            // }

            // patient.save();
            console.log(req.body);


        });
        req.flash('success', 'Profile updated!');
        return res.redirect('back');


    } catch (err) {
        console.log('Error', err);
        return;
    }

}