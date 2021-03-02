const config = require('../config/twilio');
const User = require('../models/user');
const client = require('twilio')(config.accountSID, config.authToken);
const Test = require('../models/test');
const Consult = require('../models/consult');
const bcrypt = require('bcrypt')
const fs = require('fs');
const path = require('path');
const shortid = require('shortid');





module.exports.home = async (req, res) => {
    let doctor = await User.find({ type: "Doctor", approve1: true, approve2: true, booking_service: true });
    let data = [];
    let doctors = [];
    let p_doctors = [];
    
    for (i of doctor) {
        if(i.premium)
        {
            p_doctors.push( {
                name: i.name,
                id: i.id,
                department: i.department,
                avatar: i.avatar,
                fee:i.booking_fee,
                contacts:i.contacts,
                
                premium:i.premium
            });
        }
        else{
        doctors.push( {
            name: i.name,
            id: i.id,
            department: i.department,
            avatar: i.avatar,
            fee:i.booking_fee,
            premium:i.premium
        });
    }
    }

    let consults = await Consult.find({});
    let tests = await Test.find({});
  
   

    res.json({
        premium_doctors:p_doctors,
        doctors:doctors,
        consults:consults,
        tests: tests
    });
}

module.exports.doctors = async (req, res) => {
    let doctor = await User.find({ type: "Doctor", approve1: true, approve2: true, booking_service: true });
 
    let doctors = [];
    let p_doctors = [];
  
    for (i of doctor) {
    let avgrating = 0,cnt=0;
       for(j of i.reviews)
       {
        avgrating = avgrating+j.rating;
        cnt++;
       }
       let rating = parseInt(avgrating/cnt);
       let specialisations;
       let specialisation;
       let specfirst = null;
       let education;
       if(i.education.length>0)
       {
           education = i.education[0].degree;
       }
       if(i.specialisation != undefined)
       {
       specialisations = i.specialisation;
       specialisation = specialisations.split(',');
       specfirst = specialisation[0]
       }
       if(i.premium){
        p_doctors.push( {
            name: i.name,
            experience:i.wexperience,
            contacts:i.contacts,
            clinicphotos:i.clinicphoto,
            services:i.services,
            department: i.department,
            education:education,
            specialist:specfirst,
            fee:i.booking_fee,
            clinicname:i.clinicname,
            clinicaddr:i.clinicaddr,
            id: i.id,
            staff_flag:true,
            avatar: i.avatar,
            ratings:rating,
            rating_count:cnt,
            premium:i.premium
        });
       }

       else{
        doctors.push( {
            name: i.name,
            experience:i.wexperience,
            contacts:i.contacts,
            clinicphotos:i.clinicphoto,
            services:i.services,
            department: i.department,
            education:education,
            specialist:specfirst,
            fee:i.booking_fee,
            clinicname:i.clinicname,
            clinicaddr:i.clinicaddr,
            id: i.id,
            staff_flag:true,
            avatar: i.avatar,
            ratings:rating,
            rating_count:cnt,
            premium:i.premium
        });
       }
       
    }

   

    res.json({
        status:'true',
        premium_doctors:p_doctors,
        doctors:doctors
    });
}

module.exports.doctorProfile = async (req, res) => {
    let i = await User.findById(req.body.id);
 
   

  
    let avgrating = 0,cnt=0;
       for(j of i.reviews)
       {
        avgrating = avgrating+j.rating;
        cnt++;
       }
       let rating = parseInt(avgrating/cnt);
    

   

    res.json({
        avatar: i.avatar,
            name: i.name,
            education:i.education,
            department: i.department,
            contacts:i.contacts,
            clinicphotos:i.clinicphoto,
            specialities:i.specialities,
            services:i.services,
            fee:i.booking_fee,
            id: i.id,
            experience:i.experience,
            experience_count:i.wexperience,
            awards:i.awards,
           clinicname:i.clinicname,
           clinicaddr:i.clinicaddr,
           reviews:i.reviews,
           schedule_time:i.schedule_time,
            staff_flag:true,
            ratings:rating,
            rating_count:cnt,
            premium:i.premium
    });
}

module.exports.booking = async (req, res) => {
    let i = await User.findById(req.body.id);
    if (!i) {
        return res.json({
            status:'false'
        })
    }

    let user1 = await User.findById(i.staff_id);
    var today = new Date();
    // today.setDate(today.getDate() - 1)
    var dd = String(today.getDate()).padStart(2, '0');
    var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
    var yyyy = today.getFullYear();
    var weekday = new Array('Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday');
    var dayOfWeek = weekday[today.getDay()].toUpperCase();
    console.log(dayOfWeek);
    var str = dd + '-' + mm + '-' + yyyy;

    if (user1) {
        for (temp of i.schedule_time) {
            if (temp.day.toUpperCase() == dayOfWeek) {
                var vflag = true;
                var vflag1 = false;

                if (typeof(temp.booked) == 'string') {
                    if (temp.booked != '0') {
                        vflag1 = true;
                    }
                }

                if (typeof(temp.booked) == 'number') {
                    if (temp.booked != '0') {
                        vflag1 = true;
                    }
                }

                if (typeof(temp.booked) == 'object') {

                    for (temp2 of temp.booked) {
                        if (temp2 != '0') {
                            vflag1 = true;
                        }

                    }
                }

                for (temp1 of user1.booking) {
                    if (temp1.date == str) {
                        vflag = false;
                    }
                }
                console.log(vflag, vflag1)

                if (vflag && vflag1) {
                    if (typeof(temp.booked) == 'string') {
                        temp.booked = 0;
                    }

                    if (typeof(temp.booked) == 'number') {
                        temp.booked = 0;
                    }

                    if (typeof(temp.booked) == 'object') {
                        temp.booked = [0, 0];
                    }


                }
                temp.reset_flag = true;

            } else {
                if (temp.reset_flag == true) {
                    if (typeof(temp.booked) == 'string') {
                        temp.booked = 0;
                    }

                    if (typeof(temp.booked) == 'number') {
                        temp.booked = 0;
                    }

                    if (typeof(temp.booked) == 'object') {
                        temp.booked = [0, 0];
                    }

                    temp.reset_flag = false;
                    temp.alt_flag = false;
                }

            }
        }
    } else {
        for (temp of i.schedule_time) {
            if (temp.day.toUpperCase() == dayOfWeek) {
                var vflag = true;
                var vflag1 = false;

                if (typeof(temp.booked) == 'string') {
                    if (temp.booked != '0') {
                        vflag1 = true;
                    }
                }

                if (typeof(temp.booked) == 'number') {
                    if (temp.booked != '0') {
                        vflag1 = true;
                    }
                }

                if (typeof(temp.booked) == 'object') {

                    for (temp2 of temp.booked) {
                        if (temp2 != '0') {
                            vflag1 = true;
                        }

                    }
                }

                for (temp1 of i.patients) {
                    if (temp1.date == str) {
                        vflag = false;
                    }
                }
                console.log(vflag, vflag1)

                if (vflag && vflag1) {
                    if (typeof(temp.booked) == 'string') {
                        temp.booked = 0;
                    }

                    if (typeof(temp.booked) == 'number') {
                        temp.booked = 0;
                    }

                    if (typeof(temp.booked) == 'object') {
                        temp.booked = [0, 0];
                    }


                }
                temp.reset_flag = true;

            } else {
                if (temp.reset_flag == true) {
                    if (typeof(temp.booked) == 'string') {
                        temp.booked = 0;
                    }

                    if (typeof(temp.booked) == 'number') {
                        temp.booked = 0;
                    }

                    if (typeof(temp.booked) == 'object') {
                        temp.booked = [0, 0];
                    }

                    temp.reset_flag = false;
                    temp.alt_flag = false;
                }

            }
        }
    }

    i.save();
   

  
    let avgrating = 0,cnt=0;
       for(j of i.reviews)
       {
        avgrating = avgrating+j.rating;
        cnt++;
       }
       let rating = parseInt(avgrating/cnt);
    

//    console.log(i.schedule_time)

    res.json({
        status:true,
        avatar: i.avatar,
            name: i.name,
            department: i.department,
            contacts:i.contacts,
            fee:i.booking_fee,
            id: i.id,
            schedule_time:i.schedule_time,
            staff_flag:true,
            ratings:rating,
            rating_count:cnt,
            premium:i.premium
    });
}

module.exports.specialist = async (req, res) => {
    let doctor = await User.find({ type: "Doctor", approve1: true, approve2: true, booking_service: true ,department:req.body.department});
 
    let doctors = [];
    let p_doctors = [];
  
    for (i of doctor) {
    let avgrating = 0,cnt=0;
       for(j of i.reviews)
       {
        avgrating = avgrating+j.rating;
        cnt++;
       }
       let rating = parseInt(avgrating/cnt);
       let specialisations;
       let specialisation;
       let specfirst = null;
       let education;
       if(i.education.length>0)
       {
           education = i.education[0].degree;
       }
       if(i.specialisation != undefined)
       {
       specialisations = i.specialisation;
       specialisation = specialisations.split(',');
       specfirst = specialisation[0]
       }
       if(i.premium){
        p_doctors.push( {
            name: i.name,
            experience:i.wexperience,
            contacts:i.contacts,
            clinicphotos:i.clinicphoto,
            services:i.services,
            department: i.department,
            education:education,
            specialist:specfirst,
            fee:i.booking_fee,
            clinicname:i.clinicname,
            clinicaddr:i.clinicaddr,
            id: i.id,
            staff_flag:true,
            avatar: i.avatar,
            ratings:rating,
            rating_count:cnt,
            premium:i.premium
        });
       }

       else{
        doctors.push( {
            name: i.name,
            experience:i.wexperience,
            contacts:i.contacts,
            clinicphotos:i.clinicphoto,
            services:i.services,
            department: i.department,
            education:education,
            specialist:specfirst,
            fee:i.booking_fee,
            clinicname:i.clinicname,
            clinicaddr:i.clinicaddr,
            id: i.id,
            staff_flag:true,
            avatar: i.avatar,
            ratings:rating,
            rating_count:cnt,
            premium:i.premium
        });
       }
       
    }

   

    res.json({
        status:'true',
        premium_doctors:p_doctors,
        doctors:doctors
    });
}

module.exports.sendOtp = async(req,res) => {
    if(req.body.phone.length>10)
    {
        req.flash('error', 'Please do not use (+91 or 0) before your phone number.');
        return res.json({
            status:'false'
        })
    }
    
    let user = await User.findOne({ phone: req.body.phone, service: 'phone' });

    if (user) {
        req.flash('error', 'Account already linked with this mobile number');
        return res.json({
            status:'false'
        })
    } else {

        client
            .verify
            .services(config.serviceID)
            .verifications
            .create({
                to: `+91${req.body.phone}`,
                channel: req.body.service
            }).then((data) => {
                console.log('verify',req.body)
         return res.json({
             status:'true'
            })
            });

    }
}

module.exports.verifyOtp = async(req, res) => {
  

    let data = await client
        .verify
        .services(config.serviceID)
        .verificationChecks
        .create({
            to: `+91${req.body.phone}`,
            code: req.body.otp
        });


    if (data.status == 'approved') {
       return res.json({
           status:'true'
       })

    } else {
        return res.json({
            status:'false'
        })

    }
}

module.exports.createUserAccount = async(req, res) => {
    let davatar = path.join(__dirname, '..', '/assets/img/bg.png');
    if(req.body.password != req.body.cpassword)
    {
       return res.json({
           status:'false',
           msg:'password mismatch'
       })
    }
    let hashedPass = await bcrypt.hash(req.body.password,10)
   

    
    let user = await User.create({
        name: req.body.name,
        phone: req.body.phone,
        email:req.body.email,
        avatar: davatar,
        service: 'phone',
        type: req.body.type,
        password : hashedPass,
        encrypt : true
    });
    const rand = Math.floor((Math.random() * 100) + 54);
            
            if (req.body.email) {
                
                    console.log('sent');
                    user.emailkey = rand;
                    emailVerification.newAlert(user, rand, req.body.email);
                    user.email = req.body.email;
                    user.emailverify = false;
                    user.save();
            }
                
                   

return res.json({
    status:'true',
    user:user
})

}


module.exports.login = async function(req, res) {
    let user = await User.findOne({phone:req.body.phone,service:'phone',type:'Patient'})

    if(!user)
    {
        return res.json({
            status:'false',
            msg:'Not registered'
        })
       
    }
  
  else{

    if(user.encrypt)
    {
        let isEqual = await bcrypt.compare(req.body.password,user.password)
       
        if(isEqual){

            if(user.twofactor)
            {
                client
                .verify
                .services(config.serviceID)
                .verifications
                .create({
                    to: `+91${req.body.phone}`,
                    channel: 'sms'
                }).then((data) => {
                    return res.json({
                        twofactor:'true',
                        status:'true',
                        phone:req.body.phone,
                        msg:'Otp Sent To Registered Phone'
                    })
                });
            }

            else{
                return res.json({
                    twofactor:'false',
                    status:'true',
                    user:user
                })
            }
           
            
           
        }
        else{
            return res.json({
                status:'false',
                msg:'Wrong Password'
            })
           
        }
    }
        else {
            if(user.password != req.body.password)
            {
                return res.json({
                    status:'false',
                    msg:'Wrong Password'
                })
            }

            else{

              if(user.twofactor)
            {
                client
                .verify
                .services(config.serviceID)
                .verifications
                .create({
                    to: `+91${req.body.phone}`,
                    channel: 'sms'
                }).then((data) => {
                    return res.json({
                        twofactor:'true',
                        status:'true',
                        msg:'Otp Sent To Registered Phone'
                    })
                });
            }

            else{
                return res.json({
                    twofactor:'false',
                    status:'true',
                    user:user
                })
            }
            }
           
    }

   

  }

}

module.exports.verify2FactorOtp = async(req, res) => {
  
    let user = await User.findOne({phone:req.body.phone,service:'phone',type:'Patient'})
    let data = await client
        .verify
        .services(config.serviceID)
        .verificationChecks
        .create({
            to: `+91${req.body.phone}`,
            code: req.body.otp
        });


    if (data.status == 'approved') {
       return res.json({
           status:'true',
           user:user
       })

    } else {
        return res.json({
            status:'false'
        })

    }
}









