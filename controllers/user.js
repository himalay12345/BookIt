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

module.exports.deleteRegistration = async function(req, res)
{
    let doctor = await Doctor.findById(req.user.id);
    doctor.registrations.pull({_id:req.query.id});
    doctor.save();
    req.flash('error','Registration deleted!')
    return res.redirect('back');
}
module.exports.deleteAward = async function(req, res)
{
    let doctor = await Doctor.findById(req.user.id);
    doctor.awards.pull({_id:req.query.id});
    doctor.save();
    req.flash('error','Award deleted!')
    return res.redirect('back');
}
module.exports.deleteExperience = async function(req, res)
{
    let doctor = await Doctor.findById(req.user.id);
    doctor.experience.pull({_id:req.query.id});
    doctor.save();
    req.flash('error','Experience deleted!')
    return res.redirect('back');
}
module.exports.deleteEducation = async function(req, res)
{
    let doctor = await Doctor.findById(req.user.id);
    doctor.education.pull({_id:req.query.id});
    doctor.save();
    req.flash('error','Education deleted!')
    return res.redirect('back');
}
module.exports.doctorProfileUpdate = async function(req, res) {

    try {
        let doctor = await Doctor.findById(req.user.id);
        Doctor.uploadedAvatar(req, res, function(err) {
            if (err) { console.log('*******Multer Error', err); return; }

            doctor.services = req.body.services;
            doctor.specialisation = req.body.specialisation;
            doctor.pincode = req.body.pincode;
            doctor.state = req.body.state;
            doctor.country = req.body.country;
            doctor.city = req.body.city;
            doctor.address = req.body.address;
            doctor.clinicname = req.body.clinicname;
            doctor.clinicaddr = req.body.clinicaddr;
            doctor.department = req.body.department;
            doctor.name = req.body.name;
            doctor.email = req.body.email;
            doctor.phone = req.body.phone;
            doctor.gender = req.body.gender;
            doctor.dob = req.body.dob;


            if(typeof(req.body.degree) == 'object')
            {
                for(let i=0;i<req.body.degree.length;i++)
                {
                    doctor.education.push({degree:req.body.degree[i],
                        college:req.body.college[i],
                        yoc:req.body.yoc[i]
                    });
                }
            }
            
           
            if(typeof(req.body.degree) == 'string')
                {
                    doctor.education.push({degree:req.body.degree,
                    college:req.body.college,
                    yoc:req.body.yoc
                });
                }
           

            if(typeof(req.body.institutionname) == 'object')
            {
                for(let i=0;i<req.body.institutionname.length;i++)
                {
                    doctor.experience.push({institutionname:req.body.institutionname[i],
                        from:req.body.from[i],
                        to:req.body.to[i],
                        designation:req.body.designation[i]
                    });
                }
            }
            
           
            if(typeof(req.body.institutionname) == 'string')
                {
                    doctor.experience.push({institutionname:req.body.institutionname,
                    from:req.body.from,
                    to:req.body.to,
                    designation:req.body.designation
                });
                }
           

            if(typeof(req.body.award) == 'object')
            {
                for(let i=0;i<req.body.award.length;i++)
                {
                    doctor.awards.push({award:req.body.award[i],year:req.body.year[i]});
                }
            }
            
           
            if(typeof(req.body.award) == 'string')
                {
                doctor.awards.push({award:req.body.award,year:req.body.year});
                }
           

            
            if(typeof(req.body.registration) == 'object')
            {
                for(let i=0;i<req.body.registration.length;i++)
                {
                    doctor.registrations.push({registration:req.body.registration[i],regYear:req.body.regYear[i]});
                }
            }

            
               
               if(typeof(req.body.registration) == 'string') {
                    doctor.registrations.push({registration:req.body.registration,regYear:req.body.regYear});
                }

           
         

            if (req.file) {
                if (!doctor.avatar) {
                    doctor.avatar = Doctor.avatarPath + '/' + req.file.filename;
                } else {

                    fs.unlinkSync(path.join(__dirname, '..', doctor.avatar));
                    doctor.avatar = Doctor.avatarPath + '/' + req.file.filename;
                }
            }

            doctor.save();
            console.log(doctor);


        });
        req.flash('success', 'Profile updated!');
        return res.redirect('back');


    } catch (err) {
        console.log('Error', err);
        return;
    }

}