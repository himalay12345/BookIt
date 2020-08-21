const Patient = require('../models/patient');
const fs = require('fs');
const path = require('path');


module.exports.create = async(req, res) => {
    let patient = await Patient.create({
        name: req.body.name,
        phone: req.body.phone,
        password: req.body.password,
        service:'phone'
    });

    console.log(patient);
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
            patient.country = req.body.country;
            patient.bloodgroup = req.body.bloodgroup;



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
        return res.redirect('back');


    } catch (err) {
        console.log('Error', err);
        return;
    }

}