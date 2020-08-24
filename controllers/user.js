let User = require('../models/user');
const fs = require('fs');
const path = require('path');



module.exports.create = async(req, res) => {
    let user = await User.create({
        name: req.body.name,
        phone: req.body.phone,
        password: req.body.password,
        service: 'phone',
        type: req.body.type
    });

    req.flash('success', 'Account created successfully.Please Login!');
    return res.redirect('/login');
}

module.exports.createSession = function(req, res) {
    //Todo Later
    return res.redirect('/');
}

module.exports.popup = async function(req, res) {
    let user = await User.findById(req.user.id);
    console.log(user);
    if (!user.type) {
        return res.redirect('/#popup1');
    } else {
        return res.redirect('/');
    }

}

module.exports.updateType = async function(req, res) {
    console.log(req.body);
    let user = await User.findOne({ _id: req.body.user });
    console.log(user);
    user.type = req.body.type;
    user.save();
    console.log(user.type);
    if (user.type == 'Doctor') {
        return res.redirect('/doctor-dashboard');
    }

    if (user.type == 'Patient') {
        return res.redirect('/patient-dashboard');
    }

}


module.exports.destroySession = function(req, res) {
    req.logout();

    return res.redirect('/');
}

module.exports.changePassword = async(req, res) => {
    let user = await User.findOne({ phone: req.body.phone });
    if (req.body.old != user.password) {
        req.flash('error', 'Wrong Old Password!');
        return res.redirect('back');
    }

    if (req.body.password != req.body.confirm) {
        req.flash('error', 'Passwords do not match!')
        return res.redirect('back');
    }

    user.password = req.body.password;
    user.save();

    req.flash('success', 'Password changed successfully!');
    return res.redirect('back');
}

module.exports.docchangePassword = async(req, res) => {
    let user = await User.findOne({ phone: req.body.phone });
    if (req.body.old != user.password) {
        req.flash('error', 'Wrong Old Password!');
        return res.redirect('back');
    }

    if (req.body.password != req.body.confirm) {
        req.flash('error', 'Passwords do not match!')
        return res.redirect('back');
    }

    user.password = req.body.password;
    user.save();

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
        let user = await User.findOne({ phone: req.body.phone });
        user.password = req.body.password;
        user.save();

        req.flash('success', 'Password reset successfully');
        return res.redirect('/login');
    }
}

module.exports.uploadId = async function(req, res)
{
    let user = await User.findById(req.user.id);
    
    User.uploadedAvatar(req, res, function(err) {
        console.log(req.file);
        user.idproofname = req.body.idproofname;
        if (req.file) {
            if (!user.idproof) {
                user.idproof = User.avatarPath + '/' + req.file.filename;
            } else {

                fs.unlinkSync(path.join(__dirname, '..', user.avatar));
                user.idproof = User.avatarPath + '/' + req.file.filename;
            }
        }

        user.save();
        // console.log(user);
    });
    return res.redirect('back');

}
module.exports.uploadDegree = async function(req, res)
{
    let user = await User.findById(req.user.id);
    
    User.uploadedAvatar(req, res, function(err) {
        console.log(req.file);
        user.degreeproof = req.body.degreeproof;
        if (req.file) {
            if (!user.degreephoto) {
                user.degreephoto = User.avatarPath + '/' + req.file.filename;
            } else {

                fs.unlinkSync(path.join(__dirname, '..', user.avatar));
                user.degreephoto = User.avatarPath + '/' + req.file.filename;
            }
        }

        user.save();
        // console.log(user);
    });
    return res.redirect('back');

}

module.exports.profileUpdate = async function(req, res) {

    try {


        let user = await User.findById(req.user.id);
        User.uploadedAvatar(req, res, function(err) {
            if (err) { console.log('*******Multer Error', err); return; }
            user.name = req.body.name;
            user.dob = req.body.dob;
            user.phone = req.body.phone;
            user.email = req.body.email;
            user.address = req.body.address;
            user.city = req.body.city;
            user.state = req.body.state;
            user.pincode = req.body.pincode;
            user.country = req.body.country;
            user.bloodgroup = req.body.bloodgroup;
            user.gender = req.body.gender;



            if (req.file) {
                if (!user.avatar) {
                    user.avatar = User.avatarPath + '/' + req.file.filename;
                } else {

                    fs.unlinkSync(path.join(__dirname, '..', user.avatar));
                    user.avatar = User.avatarPath + '/' + req.file.filename;
                }
            }

            user.save();


        });
        req.flash('success', 'Profile updated!');
        return res.redirect('back');


    } catch (err) {
        console.log('Error', err);
        return;
    }

}

module.exports.deleteRegistration = async function(req, res) {
    let user = await User.findById(req.user.id);
    user.registrations.pull({ _id: req.query.id });
    user.save();
    req.flash('error', 'Registration deleted!')
    return res.redirect('back');
}
module.exports.deleteAward = async function(req, res) {
    let user = await User.findById(req.user.id);
    user.awards.pull({ _id: req.query.id });
    user.save();
    req.flash('error', 'Award deleted!')
    return res.redirect('back');
}
module.exports.deleteExperience = async function(req, res) {
    let user = await User.findById(req.user.id);
    user.experience.pull({ _id: req.query.id });
    user.save();
    req.flash('error', 'Experience deleted!')
    return res.redirect('back');
}
module.exports.deleteEducation = async function(req, res) {
    let user = await User.findById(req.user.id);
    user.education.pull({ _id: req.query.id });
    user.save();
    req.flash('error', 'Education deleted!')
    return res.redirect('back');
}
module.exports.doctorProfileUpdate = async function(req, res) {

    try {
        let user = await User.findById(req.user.id);
        User.uploadedAvatar(req, res, function(err) {
            if (err) { console.log('*******Multer Error', err); return; }

            user.services = req.body.services;
            user.specialisation = req.body.specialisation;
            user.pincode = req.body.pincode;
            user.state = req.body.state;
            user.country = req.body.country;
            user.city = req.body.city;
            user.address = req.body.address;
            user.clinicname = req.body.clinicname;
            user.clinicaddr = req.body.clinicaddr;
            user.department = req.body.department;
            user.name = req.body.name;
            user.email = req.body.email;
            user.phone = req.body.phone;
            user.gender = req.body.gender;
            user.dob = req.body.dob;


            if (typeof(req.body.degree) == 'object') {
                for (let i = 0; i < req.body.degree.length; i++) {
                    user.education.push({
                        degree: req.body.degree[i],
                        college: req.body.college[i],
                        yoc: req.body.yoc[i]
                    });
                }
            }


            if (typeof(req.body.degree) == 'string' && req.body.degree != '') {
                user.education.push({
                    degree: req.body.degree,
                    college: req.body.college,
                    yoc: req.body.yoc
                });
            }


            if (typeof(req.body.institutionname) == 'object') {
                for (let i = 0; i < req.body.institutionname.length; i++) {
                    user.experience.push({
                        institutionname: req.body.institutionname[i],
                        from: req.body.from[i],
                        to: req.body.to[i],
                        designation: req.body.designation[i]
                    });
                }
            }


            if (typeof(req.body.institutionname) == 'string' && req.body.institutionname != '') {
                user.experience.push({
                    institutionname: req.body.institutionname,
                    from: req.body.from,
                    to: req.body.to,
                    designation: req.body.designation
                });
            }

            if (typeof(req.body.award) == 'object') {
                for (let i = 0; i < req.body.award.length; i++) {
                    user.awards.push({ award: req.body.award[i], year: req.body.year[i] });
                }
            }


            if (typeof(req.body.award) == 'string' && req.body.award != '') {
                user.awards.push({ award: req.body.award, year: req.body.year });
            }



            if (typeof(req.body.registration) == 'object') {
                for (let i = 0; i < req.body.registration.length; i++) {
                    user.registrations.push({ registration: req.body.registration[i], regYear: req.body.regYear[i] });
                }
            }



            if (typeof(req.body.registration) == 'string' && req.body.registration != '') {
                user.registrations.push({ registration: req.body.registration, regYear: req.body.regYear });
            }




            if (req.file) {
                if (!user.avatar) {
                    user.avatar = User.avatarPath + '/' + req.file.filename;
                } else {

                    fs.unlinkSync(path.join(__dirname, '..', user.avatar));
                    user.avatar = User.avatarPath + '/' + req.file.filename;
                }
            }

            user.save();
            console.log(user);


        });
        req.flash('success', 'Profile updated!');
        return res.redirect('back');


    } catch (err) {
        console.log('Error', err);
        return;
    }

}