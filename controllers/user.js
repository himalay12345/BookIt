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

module.exports.updateProfile = async(req, res) => {
    console.log(req.body);
    let doctor = await User.findById(req.body.id);
    doctor.name = req.body.name;
    doctor.department = req.body.department;
    doctor.gender = req.body.gender;
    doctor.contacts.city = req.body.city;
    doctor.save();



    return res.redirect('/medical-registration');
}

module.exports.updateMedicalRegistration = async(req, res) => {
    console.log(req.body);
    let doctor = await User.findById(req.body.id);
    doctor.registrations.registration = req.body.registration;
    doctor.registrations.regYear = req.body.regYear;
    doctor.registrations.regCouncil = req.body.regCouncil;
   
    doctor.save();

    return res.redirect('/educational');
}

module.exports.updateEducation = async(req, res) => {
    console.log(req.body);
    let doctor = await User.findById(req.body.id);
    doctor.education.push(req.body);
    
   
    doctor.save();
    console.log(doctor);

    return res.redirect('/establishment');
}


module.exports.updateEstablishment = async(req, res) => {
    console.log(req.body);
    let doctor = await User.findById(req.body.id);
    doctor.clinicname = req.body.clinicname;
    doctor.clinicaddr = req.body.clinicaddr;
    doctor.cliniccity = req.body.cliniccity;
    doctor.contacts.city = req.body.city;
    doctor.step1 = true;
    
   
    doctor.save();
    console.log(doctor);

    return res.redirect('/steps');
}

module.exports.addFavourite = async(req, res) => {
    let patient = await User.findById(
        req.user.id);
    patient.favourites.push(req.query.id);
    patient.save();
    return res.redirect('back');
}

module.exports.createSession = function(req, res) {

    if(req.user.type == 'Doctor')
    {

         if(req.user.approve == true)
    {
        
        return res.redirect('/doctor-dashboard');
    }

    else{
        return res.redirect('/steps');
    }
    }

    else{
        return res.redirect('/patient-dashboard');
    }

    //Todo Later
  
}

module.exports.popup = async function(req, res) {
    let user = await User.findById(req.user.id);
    console.log(user);
    if (!user.type) {
        return res.redirect('/#popup1');
    } else {

         if(req.user.type == 'Doctor')
    {
        if(req.user.approve == true)
        {
            
            return res.redirect('/doctor-dashboard');
        }
    
        else{
            return res.redirect('/steps');
        }
    }

    else{
        return res.redirect('/patient-dashboard');
    }
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
        return res.redirect('/steps');
    }

    if (user.type == 'Patient') {
        return res.redirect('/patient-dashboard');
    }

}
module.exports.Filter = async function(req, res) {
    console.log(req.body);
    let doctors = [];
    if (req.body.gender_type) {
        doctors = await User.find({
            gender: req.body.gender_type,
            type: "Doctor"
        });
    }
    if (typeof(req.body.select_specialist) == 'string') {
        doctors = await User.find({ department: req.body.specialist });
    }

    return res.render('search', {
        doctors: doctors
    });

}

module.exports.destroySession = function(req, res) {
    req.logout();

    return res.redirect('/');
}

module.exports.payment = async (req, res) => {
      let user = await User.findById(req.body.doctorid);

      if(typeof(user.schedule_time[req.body.dayindex].start) == 'object')
      {
        let available =  [];
        let booked =  [];
        let k = req.body.slotindex;
        let i = req.body.available.split(',');
        let a = parseInt(i[k]);
        a =a-1;
        for(var temp =0;temp<user.schedule_time[req.body.dayindex].start.length;temp++)
            {
                if(temp == k)
                {
                    available.push(a);
                    continue;
                }
                var temp1 = parseInt(i[temp]);
                available.push(temp1);
            }
    let j = req.body.booked.split(',');
    let b = parseInt(j[k]);
    b = b+1;
    // console.log(user.schedule_time[req.body.dayindex].start.length);
    for(var temp =0;temp<user.schedule_time[req.body.dayindex].start.length;temp++)
    {
        if(temp == req.body.slotindex)
        {
            booked.push(b);
            continue;
        }
        var temp1 = parseInt(j[temp]);
        booked.push(temp1);
    }
    let day = await User.update({ 'schedule_time._id': req.body.id }, {
        '$set': {
            'schedule_time.$.booked': booked,
            'schedule_time.$.available': available,
            
        }
    });
    return res.render('booking-success',{
        doctor:user,
        seat:b,
        slotindex:req.body.slotindex,
        dayindex:req.body.dayindex
    });

    }

    if(typeof(user.schedule_time[req.body.dayindex].start) == 'string')
    {
        var k1 = parseInt(req.body.booked);
        k1+=1;
        var k2 = parseInt(req.body.available);
        k2-=1;

        
     let day = await User.update({ 'schedule_time._id': req.body.id }, {
        '$set': {
            'schedule_time.$.booked': k1,
            'schedule_time.$.available': k2,
            
        }
    });

    return res.render('booking-success',{
        doctor:user,
        seat:k1,
        slotindex:req.body.slotindex,
        dayindex:req.body.dayindex
    });

    }
     

  
   
}

module.exports.bookAppointment = async (req, res) => {
    console.log(req.body);
    let doctor = await User.findById(req.body.doctorid);

    return res.render('checkout',{
        booked:req.body.booked,
        available:req.body.available,
        slotindex:req.body.slotindex,
        dayindex:req.body.dayindex,
        id:req.body.id,
        doctor:doctor

    })
}

module.exports.setBookingFee = async function(req, res) {
    let user = await User.findById(req.user.id);
    user.booking_fee = req.body.fee;
    user.save();

    if(req.body.flag == 'true')
    {
        return res.redirect('/terms');
    }

    else{
        return res.redirect('back');

    }

}
module.exports.bankDetails = async function(req, res) {
    if (!req.body.bankname) {
        req.flash('error', 'Please Fill all the  fields');
        return res.redirect('back');
    }
    if (!req.body.accountnumber) {
        req.flash('error', 'Please Fill all the  fields');
        return res.redirect('back');
    }
    if (!req.body.accountholdername) {
        req.flash('error', 'Please Fill all the  fields');
        return res.redirect('back');
    }
    if (!req.body.ifsccode) {
        req.flash('error', 'Please Fill all the  fields');
        return res.redirect('back');
    }
    let user = await User.findById(req.user.id);
    user.bank = {
            bankname: req.body.bankname,
            accountnumber: req.body.accountnumber,
            accountholdername: req.body.accountholdername,
            ifsccode: req.body.ifsccode
        }
        // user.bankname = req.body.bankname;
        // user.accountnumber = req.body.accountnumber;
        // user.accountholdername = req.body.accountholdername;
        // user.ifsccode = req.body.ifsccode;
    console.log(req.body);
    user.save();

    req.flash('success', 'Bank Detials Updated');
    return res.redirect('back');
}
module.exports.updateClinic = function(req, res) {
    User.uploadedAvatar(req, res, function(err) {
        if (err) { console.log('*******Multer Error', err); return; }

        console.log(req.file);
    });

    return res.redirect('back');
}

module.exports.updateSchedule = async function(req, res) {


    if ((!req.body.start) || (!req.body.end)) {
        let user = await User.findById(req.user.id);
        user.schedule_time.pull({ _id: req.body.id });
        user.save();
        return res.redirect('back');
    }
    let day = await User.update({ 'schedule_time._id': req.body.id }, {
        '$set': {
            'schedule_time.$.start': req.body.start,
            'schedule_time.$.end': req.body.end,
            'schedule_time.$.max_count': req.body.max_count,
            'schedule_time.$.available': req.body.max_count
        }
    });


        return res.redirect('back');

}


module.exports.setScheduleTiming = async function(req, res) {

    let user = await User.findById(req.user.id);




    if (typeof(req.body.start) == 'string') {
        user.schedule_time.push({
            start: req.body.start,
            end: req.body.end,
            day: req.body.day,
            max_count:req.body.max_count,
            available:req.body.max_count,
            booked:0
        })
    }

    if (typeof(req.body.start) == 'object') {
        user.schedule_time.push({ 
            day: req.body.day,
            start:req.body.start,
            end:req.body.end,
            max_count:req.body.max_count,
            available:req.body.max_count,
            booked:['0','0']
        } );
        
    }



    user.save();
    console.log(req.body);
  
        return res.redirect('back');

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

module.exports.uploadId = async function(req, res) {
    let user = await User.findById(req.user.id);

    User.uploadedAvatar(req, res, function(err) {
        // console.log(req.file);
        user.idproofname = req.body.idproofname;
        if (req.files['avatar']) {
            if (!user.idproof) {
                user.idproof = User.avatarPath + '/' + req.files['avatar'][0].filename;

            } else {

                fs.unlinkSync(path.join(__dirname, '..', user.idproof));
                user.idproof = User.avatarPath + '/' + req.files['avatar'][0].filename;
            }
        }

        if (user.degreeproof) {
            user.request = true;
        }

        user.save();
        // console.log(user);
    });
    return res.redirect('back');

}

module.exports.uploadIdProof = async function(req, res) {
    let user = await User.findById(req.user.id);

    User.uploadedAvatar(req, res, function(err) {
        
        user.idproofname = req.body.idproofname;
        if (req.files['avatar']) {
            if (!user.idproof) {
                console.log('hii');
                user.idproof = User.avatarPath + '/' + req.files['avatar'][0].filename;

            } else {
                console.log('hello');
                fs.unlinkSync(path.join(__dirname, '..', user.idproof));
                user.idproof = User.avatarPath + '/' + req.files['avatar'][0].filename;
            }
        }

        if (user.degreeproof) {
            user.request = true;
        }

        user.save();
        
    });

    console.log(req.body);
    return res.redirect('/medical-proof');

}
module.exports.uploadDegree = async function(req, res) {
    let user = await User.findById(req.user.id);

    User.uploadedAvatar(req, res, function(err) {
        
        if (req.files['avatar']) {
            if (!user.degreephoto) {
                user.degreephoto = User.avatarPath + '/' + req.files['avatar'][0].filename;
            } else {

                fs.unlinkSync(path.join(__dirname, '..', user.degreephoto));
                user.degreephoto = User.avatarPath + '/' + req.files['avatar'][0].filename;
            }
        }

        if (user.idproof) {
            user.step2 = true;
        }

        user.save();
        
    });
    return res.redirect('/steps');

}
module.exports.acceptAgreement = async(req, res) => {
    let user = await User.findById(req.user.id);
    user.step3 = true;
    user.save();
    return res.redirect('/steps');
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





            if (req.files['avatar']) {
                if (!user.avatar) {
                    user.avatar = User.avatarPath + '/' + req.files['avatar'][0].filename;
                } else {

                    fs.unlinkSync(path.join(__dirname, '..', user.avatar));
                    user.avatar = User.avatarPath + '/' + req.files['avatar'][0].filename;
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
module.exports.deleteClinicPhoto = async function(req, res) {
    let user = await User.findById(req.user.id);
    user.clinicphoto.pull(req.query.path);
    user.save();

    fs.unlinkSync(path.join(__dirname, '..', req.query.path));

    req.flash('error', 'Clinic photo deleted!')
    return res.redirect('back');
}


module.exports.doctorProfileUpdate = async function(req, res) {

    try {
        let user = await User.findById(req.user.id);
        User.uploadedAvatar(req, res, function(err) {
            if (err) { console.log('*******Multer Error', err); return; }

            user.services = req.body.services;
            user.specialisation = req.body.specialisation;
            // user.pincode = req.body.pincode;
            // user.state = req.body.state;
            // user.country = req.body.country;
            // user.city = req.body.city;
            // user.address = req.body.address;
            user.clinicname = req.body.clinicname;
            user.clinicaddr = req.body.clinicaddr;
            user.department = req.body.department;
            user.name = req.body.name;
            user.email = req.body.email;
            user.phone = req.body.phone;
            user.gender = req.body.gender;
            user.dob = req.body.dob;
            user.facebook = req.body.facebook;
            user.instagram = req.body.instagram;
            user.twitter = req.body.twitter;
            user.biodata = req.body.biodata;
            user.contacts = {
                address: req.body.address,
                city: req.body.city,
                state: req.body.state,
                pincode: req.body.pincode,
                country: req.body.country
            };




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



            // if (typeof(req.body.registration) == 'object') {
            //     for (let i = 0; i < req.body.registration.length; i++) {
            //         user.registrations.push({ registration: req.body.registration[i], regYear: req.body.regYear[i] });
            //     }
            // }



            // if (typeof(req.body.registration) == 'string' && req.body.registration != '') {
            //     user.registrations.push({ registration: req.body.registration, regYear: req.body.regYear });
            // }




            if (req.files['avatar']) {
                if (!user.avatar) {
                    user.avatar = User.avatarPath + '/' + req.files['avatar'][0].filename;
                } else {

                    fs.unlinkSync(path.join(__dirname, '..', user.avatar));
                    user.avatar = User.avatarPath + '/' + req.files['avatar'][0].filename;
                }
            }
            if (req.files['clinicphoto']) {
                for (let i = 0; i < req.files['clinicphoto'].length; i++) {
                    user.clinicphoto.push(User.avatarPath + '/' + req.files['clinicphoto'][i].filename);
                }
            }


            user.save();
            // console.log(user);


        });
        req.flash('success', 'Profile updated!');
        return res.redirect('back');


    } catch (err) {
        console.log('Error', err);
        return;
    }

}