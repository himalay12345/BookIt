const config = require('../config/twilio');
const User = require('../models/user');
const client = require('twilio')(config.accountSID, config.authToken);
const Test = require('../models/test');
const Consult = require('../models/consult');
const Specialities = require('../models/specialities')
const bcrypt = require('bcrypt')
const fs = require('fs');
const path = require('path');
const jwt = require('jsonwebtoken');
const shortid = require('shortid');
const emailVerification = require('../mailers/email-verify');
const Razorpay = require('razorpay');
const crypto = require('crypto');
const request = require('request');
const appointmentAlert = require('../mailers/appointment-alert');
const appointmentAlert1 = require('../mailers/appointment-cancel1');
const appointmentCancelAlert = require('../mailers/appointment-cancel');
const env = require('../config/environment');


module.exports.Filter = async function(req, res) {
    console.log(req.body);
    let doctors = [];

    if (typeof(req.body.select_specialist) == 'string') {
        if (req.body.gender_type) {
            doctors = await User.find({
                department: req.body.select_specialist,
                gender: req.body.gender_type,
                type: "Doctor",
                approve1: true, approve2: true, booking_service: true
            });
            let doctors1 = await User.find({ type: "Doctor" ,approve1: true, approve2: true, booking_service: true});

            let ar = [];
            for(i of doctors1)
            {
                ar.push({
                    name: i.name,
                    id : i.id,
                    dept: i.department,
                    avatar: i.avatar
                });
            }
            return res.json({
                status:true,
                msg:'Filtered Doctors',
                doctors:doctors
            })
        } else {
            doctors = await User.find({ department: req.body.select_specialist, type: "Doctor",approve1: true, approve2: true, booking_service: true });
            let doctors1 = await User.find({ type: "Doctor" ,approve1: true, approve2: true, booking_service: true});

            let ar = [];
            for(i of doctors1)
            {
                ar.push({
                    name: i.name,
                    id : i.id,
                    dept: i.department,
                    avatar: i.avatar
                });
            }
            return res.json({
                status:true,
                msg:'Filtered Doctors',
                doctors:doctors
            })
        }
    }

    if (typeof(req.body.select_specialist) == 'object') {
        for (let i = 0; i < req.body.select_specialist.length; i++) {
            let doctor;
            if (req.body.gender_type) {
                doctor = await User.find({
                    department: req.body.select_specialist[i],
                    gender: req.body.gender_type,
                    type: "Doctor",
                    approve1: true, approve2: true, booking_service: true
                });
                
            } else {
                doctor = await User.find({ department: req.body.select_specialist[i], type: "Doctor",approve1: true, approve2: true, booking_service: true })
            }
            console.log(doctor);
            if (doctor != undefined) {
                for (let j = 0; j < doctor.length; j++) {
                    doctors.push(doctor[j]);

                }
            }




        }
        let doctors1 = await User.find({ type: "Doctor" ,approve1: true, approve2: true, booking_service: true});

        let ar = [];
        for(i of doctors1)
        {
            ar.push({
                name: i.name,
                id : i.id,
                dept: i.department,
                avatar: i.avatar
            });
        }
        return res.json({
            status:true,
            msg:'Filtered Doctors',
            doctors:doctors
        })
    }
    
     else {
        doctors = await User.find({
            gender: req.body.gender_type,
            type: "Doctor",
            approve1: true, approve2: true, booking_service: true
        });
        let doctors1 = await User.find({ type: "Doctor" ,approve1: true, approve2: true, booking_service: true});

        let ar = [];
        for(i of doctors1)
        {
            ar.push({
                name: i.name,
                id : i.id,
                dept: i.department,
                avatar: i.avatar
            });
        }
         return res.json({
            status:true,
            msg:'Filtered Doctors',
            doctors:doctors
        })

    }
}

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
                clinicname:i.clinicname,
                clinicaddr:i.clinicaddr,
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
            premium:i.premium,
            clinicname:i.clinicname,
            clinicaddr:i.clinicaddr
        });
    }
    }

    let tests = await Test.find({popular:true});
    let labs = await User.find({type:'Diagonistic'});
    let specialities = await Specialities.find({});
   

    res.json({
        status:true,
        specialities:specialities,
        premium_doctors:p_doctors,
        doctors:doctors,
        labs:labs,
        tests: tests
    });
}

module.exports.doctors = async (req, res) => {

    let doctor = await User.find({ type: "Doctor", approve1: true, approve2: true, booking_service: true });
 
    let doctors = [];
    let p_doctors = [];
  

    for (i of doctor) {
        let n1;
        let d1;
        var today = new Date();
    var dd = String(today.getDate()).padStart(2, '0');
    var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
    var yyyy = today.getFullYear();
    var weekday = new Array('Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday');
    var dayOfWeek = weekday[today.getDay()];
    n1=dayOfWeek.toUpperCase();
    d1=dd+'-'+mm+'-'+yyyy;
   

        
        let t_active = false;
     
     for(let holiday of i.holidays)
     {
         console.log(holiday.date,d1)
         if(d1 === holiday.date)
         t_active = true;
     }
    let avgrating = 0,cnt=0,rating=0;
       for(j of i.reviews)
       {
        avgrating = avgrating+j.rating;
        cnt++;
       }
       if(i.reviews.length > 0)
        {
            rating = parseInt(avgrating/cnt);
        }
       
       let specialisations;
       let specialisation;
       let specfirst = null;
       let specfirst1 = null;
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
       if(specfirst !== null)
       specfirst1 = specfirst + ' Specialist'

       if(i.premium){
        p_doctors.push( {
            name: i.name,
            t_active:t_active,
            experience:i.wexperience,
            contacts:i.contacts,
            clinicphotos:i.clinicphoto,
            services:i.services,
            department: i.department,
            education:education,
            specialist:specfirst1,
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
            t_active:t_active,
            experience:i.wexperience,
            contacts:i.contacts,
            clinicphotos:i.clinicphoto,
            services:i.services,
            department: i.department,
            education:education,
            specialist:specfirst1,
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
    let avgrating = 0,cnt=0,rating=0;
       for(j of i.reviews)
       {
        avgrating = avgrating+j.rating;
        cnt++;
       }
       if(i.reviews.length > 0)
       {
           rating = parseInt(avgrating/cnt);
       }

       let specialisations;
       let specialisation;
       let specfirst = null;
       let specfirst1 = null;
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
       if(specfirst !== null)
       specfirst1 = specfirst + ' Specialist'
    
       let n1,n2,n3,n4,n5,n6,n7;
       let d1,d2,d3,d4,d5,d6,d7;
       let f1 = true,f2 = true,f3 = true,f4 = true,f5 = true,f6 = true,f7 = true;
       var today = new Date();
       for(let i1=1;i1<=7;i1++){
   var dd = String(today.getDate()).padStart(2, '0');
   var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
   var yyyy = today.getFullYear();
   var weekday = new Array('Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday');
   var dayOfWeek = weekday[today.getDay()];
   if(i1 == 1)
   {
   n1=dayOfWeek.toUpperCase();
   d1=dd+'-'+mm+'-'+yyyy;
   }
   if(i1 == 2)
   {
   n2=dayOfWeek.toUpperCase();
   d2=dd+'-'+mm+'-'+yyyy;
   }
   if(i1 == 3)
   {
   n3=dayOfWeek.toUpperCase();
   d3=dd+'-'+mm+'-'+yyyy;
   }
   if(i1 == 4)
   {
   n4=dayOfWeek.toUpperCase();
   d4=dd+'-'+mm+'-'+yyyy;
   }
   if(i1 == 5)
   {
   n5=dayOfWeek.toUpperCase();
   d5=dd+'-'+mm+'-'+yyyy;
   }
   if(i1 == 6)
   {
   n6=dayOfWeek.toUpperCase();
   d6=dd+'-'+mm+'-'+yyyy;
   }
   if(i1 == 7)
   {
   n7=dayOfWeek.toUpperCase();
   d7=dd+'-'+mm+'-'+yyyy;
   }
   
   var res1 = today.setTime(today.getTime() + (1 * 24 * 60 * 60 * 1000));
   var date = new Date(res1);
   today=date;
       }
       let t_active = false;
    
    for(let holiday of i.holidays)
    {
        console.log(holiday.date,d1)
        if(d1 === holiday.date)
        t_active = true;
    }
      
       let scheduletime = [];
       for(let u of i.schedule_time)
       {
          
           let slots = [];
           let day;
           let id;
           let reset_flag ;
           let alt_flag;
           let bookingover;
          
           if(typeof(u.start) == 'string')
           {
               slots.push({
                   start:u.start,
                   end:u.end,
                   maxcount:u.max_count,
                   available:u.available,
                   booked:u.booked
               });
               day = u.day;
               reset_flag = u.reset_flag
               alt_flag = u.alt_flag
               id = u._id;
               bookingover = u.booking_over
               let date;
               if(u.day.toUpperCase() == n1)
               {
                   date = d1;
               }
               if(u.day.toUpperCase() == n2)
               {
                   date = d2;
               }
               if(u.day.toUpperCase() == n3)
               {
                   date = d3;
               }
               if(u.day.toUpperCase() == n4)
               {
                   date = d4;
               }
               if(u.day.toUpperCase() == n5)
               {
                   date = d5;
               }
               if(u.day.toUpperCase() == n6)
               {
                   date = d6;
               }
               if(u.day.toUpperCase() == n7)
               {
                   date = d7;
               }
   
               scheduletime.push({
                   id:id,
                   date:date,
                   day:day,
                  slots:slots,
                   reset_flag:reset_flag,
                   alt_flag:alt_flag,
                   booking_over:bookingover
                  
               })
           }
   
           if(typeof(u.start) == 'object')
           {
              
               let date;
           if(u.day.toUpperCase() == n1)
           {
               date = d1;
           }
           if(u.day.toUpperCase() == n2)
           {
               date = d2;
           }
           if(u.day.toUpperCase() == n3)
           {
               date = d3;
           }
           if(u.day.toUpperCase() == n4)
           {
               date = d4;
           }
           if(u.day.toUpperCase() == n5)
           {
               date = d5;
           }
           if(u.day.toUpperCase() == n6)
           {
               date = d6;
           }
           if(u.day.toUpperCase() == n7)
           {
               date = d7;
           }
               for(let i= 0;i<u.start.length;i++)
               {
                   slots.push({
                       start:u.start[i],
                       end:u.end[i],
                       maxcount:u.max_count[i],
                       available:u.available[i],
                       booked:u.booked[i]
                   })
               }
              
               day = u.day;
               reset_flag = u.reset_flag
               alt_flag = u.alt_flag
               bookingover = u.booking_over
   
               scheduletime.push({
                   id:u._id,
                   date:date,
                   day:day,
                   slots:slots,
                   reset_flag:reset_flag,
                   alt_flag:alt_flag,
                   booking_over:bookingover
               })
           }
          
       }
   

    res.json({
        avatar: i.avatar,
            name: i.name,
            degree:education,
            t_active:t_active,
            specialist:specfirst1,
            education:i.education,
            department: i.department,
            contacts:i.contacts,
            clinicphotos:i.clinicphoto,
            specialities:i.specialisation,
            biodata:i.biodata,
            services:i.services,
            fee:i.booking_fee,
            id: i.id,
            experience:i.experience,
            experience_count:i.wexperience,
            awards:i.awards,
           clinicname:i.clinicname,
           clinicaddr:i.clinicaddr,
           reviews:i.reviews,
           schedule_time:scheduletime,
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
   

  
    let avgrating = 0,cnt=0,rating=0;
       for(j of i.reviews)
       {
        avgrating = avgrating+j.rating;
        cnt++;
       }
       if(i.reviews.length > 0)
       {
           rating = parseInt(avgrating/cnt);
       }
    

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
    let avgrating = 0,cnt=0,rating=0;
       for(j of i.reviews)
       {
        avgrating = avgrating+j.rating;
        cnt++;
       }
       if(i.reviews.length > 0)
        {
            rating = parseInt(avgrating/cnt);
        }
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
        // req.flash('error', 'Please do not use (+91 or 0) before your phone number.');
        return res.json({
            status:false,
            msg:'Phone Number Greater than 10 digits'
        })
    }
    
    let user = await User.findOne({ phone: req.body.phone, service: 'phone' });

    if (user) {
        // req.flash('error', 'Account already linked with this mobile number');
        return res.json({
            status:false,
            msg:'Account already linked with this mobile number'
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
                    status:true,
                    msg:'Otp Sent Successfully'
                    })
            });

    }
}



module.exports.forgotSendOtp = async(req,res) => {
    if(req.body.phone.length>10)
    {
        return res.json({
            status:false,
            msg:'Phone Number Greater than 10 digits'
        })
    }
    
    let user = await User.findOne({ phone: req.body.phone, service: 'phone' });

    if (!user) {
        return res.json({
            status:false,
            msg:'No Account Linked with this number'
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
                    status:true,
                    msg:'Otp Sent Successfully'
                    })
            });

    }
}

module.exports.resetPassword = async(req, res) => {
    if (req.body.password != req.body.confirm) {
        return res.json({
            msg:'Password Mismatch',
            status:false,
            phone: req.body.phone
        })
    }

        let user = await User.findOne({ phone: req.body.phone , service:'phone'});

        let hashedPass = await bcrypt.hash(req.body.password,10)
        user.password = hashedPass;
        if(!user.encrypt)
        {
            user.encrypt = true;
        }
        user.save();

      return res.json({
          status:true,
          msg:'Password Reset Successful'
      })
    
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
           status:true,
           msg:'Otp Verified Successfully'
       })

    } else {
        return res.json({
            status:false,
            msg:'Otp Not Verified'
        })

    }
}

module.exports.createUserAccount = async(req, res) => {
    let davatar = path.join(__dirname, '..', '/assets/img/profile.png');
    if(req.body.password != req.body.cpassword)
    {
       return res.json({
           status:false,
           msg:'Password donot match !'
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
    status:true,
    msg:'Account Created Successfully',
    user:user.name
})

}

module.exports.getUserDetails = async (req,res) => {
    var userId;
    if (req.headers && req.headers.authorization) {
        var authorization = req.headers.authorization.split(' ')[1];
        var decoded = jwt.verify(authorization, 'access');
    userId = decoded.phone;
    }
    console.log(userId)
    let patient = await User.findOne({phone:userId,service:'phone'});
    res.json({
        status:true,
        msg:'In protected route',
        user:patient
    })
}

// let refreshTokens = [];

module.exports.renewRefreshToken = (req,res) => {
 const refreshToken = req.body.token;
//  || refreshTokens.includes(refreshToken)
    if(!refreshToken){
        return res.status(403).json({
            status:false,
            msg:'Refresh Token Not Found, Login Again !'
        })
    }

    jwt.verify(refreshToken,"refresh",(err, user) => {
        if(err)
        {
            return res.status(403).json({
                status:false,
                msg:'Invalid Refresh Token'
            })
        }

        else{
            const accessToken = jwt.sign({phone:user.phone} ,'access',{expiresIn:'20s'})
            return res.status(201).json({
                status:true,
                accessToken
            })
        }
    })

}

module.exports.jwtLogin = async (req,res) => {
    let user1 = await User.findOne({_id:req.user.id,service:'phone'})
    const user2 = {
        username:user1.phone
    }
    const phone = req.body.phone;

    if(!phone){
        return res.status(404).json({ meassage: 'Body Empty'});
    }

    let accessToken = jwt.sign({phone}, "access" , {expiresIn: '5d'});
    let refreshToken = jwt.sign({phone},"refresh",{expiresIn: '7d'});
    // refreshTokens.push(refreshToken)

    return res.status(201).json({
        status:true,
        accessToken,
        refreshToken,
        user:user1
    })
}

module.exports.logout = async function(req, res) {
    req.logout();

    return res.json({
        status:true,
        msg:'User Logged out'
    })
}

module.exports.createSession = async function(req, res) {
    let user = await User.findById(req.user.id)
    return res.json({
        flag:true,
        user:user
    })
}

module.exports.getUserInfo = async function(req, res) {
    // let user;
    // if(req.isAuthenticated())
    // user = await User.findById(req.user.id)
    // if(user)
    // {
    //     return res.json({
    //         flag:true,
    //         msg:'User is logged in now',
    //         user:user
    //     })
    // }
    // else{
    //     return res.json({
    //         flag:false,
    //         msg:'User is logged out now',
    //         user:user
    //     }) 
    // }
// res.header("Access-Control-Allow-Origin", "true");
    res.send(req.user)
}

function getUserId(headers)
{
    var userId;
    if (headers && headers.authorization) {
        var authorization = headers.authorization.split(' ')[1];
        var decoded = jwt.verify(authorization, 'access');
    userId = decoded.phone;
    return userId
    }

    else{
        return;
    }

}

module.exports.login = async function(req, res) {
    let user = await User.findOne({phone:req.body.phone,service:'phone'})

    if(!user)
    {
        return res.json({
            status:false,
            msg:'Not Registered ! Please Create a account'
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
                        twofactor:true,
                        status:true,
                        phone:req.body.phone,
                        password:req.body.password,
                        msg:'Otp Sent To Registered Phone'
                    })
                });
            }

            else{
                return res.json({
                    twofactor:false,
                    status:true,
                    user:user.name
                })
               
            }
           
        }
        else{
            return res.json({
                status:false,
                msg:'Invalid Username/Password'
            })
           
        }
    }
        else {
            if(user.password != req.body.password)
            {
                return res.json({
                    status:false,
                    msg:'Invalid Username/Password'
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
                        twofactor:true,
                        status:true,
                        user:user.name,
                        phone:req.body.phone,
                        password:req.body.password,
                        msg:'Otp Sent To Registered Phone'
                    })
                });
            }

            else{
                return res.json({
                    twofactor:false,
                    status:true,
                    user:user.name
                })
            }
            }
           
    }

   

  }

}

module.exports.verify2FactorOtp = async(req, res) => {

     
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
           status:true,
           msg:'Otp Verified'
       })

    } else {
        return res.json({
            status:false,
            msg:'Otp Not Verified',
            phone:req.body.phone
        })

    }
}

module.exports.profileSettings = async function(req, res) {

    try {

        let userId = await getUserId(req.headers)
        if(userId){
            let imgUrl;
        let user = await User.findOne({service:'phone',type:'Patient',phone:userId})
            User.uploadedAvatar(req, res, function(err) {
                if (err) { console.log('*******Multer Error', err); return; }
    
    console.log(req.body)
                if(req.body.name != undefined)
                user.name = req.body.name;
                if(req.body.dob != undefined)
                user.dob = req.body.dob;
                if(req.body.address != undefined)
                user.contacts.address = req.body.address;
                if(req.body.city != undefined)
                user.contacts.city = req.body.city;
                if(req.body.state != undefined)
                user.contacts.state = req.body.state;
                if(req.body.pincode != undefined)
                user.contacts.pincode = req.body.pincode;
                if(req.body.country != undefined)
                user.contacts.country = req.body.country;
                if(req.body.bloodgroup != undefined)
                user.bloodgroup = req.body.bloodgroup;
                if(req.body.gender != undefined)
                user.gender = req.body.gender;
    
    
    
    
    
                if (req.files['avatar']) {
                    if (!user.avatar) {
                        user.avatar = User.avatarPath + '/' + req.files['avatar'][0].filename;
                        imgUrl = User.avatarPath + '/' + req.files['avatar'][0].filename;
                    } else {
                        if (fs.existsSync(path.join(__dirname, '..', user.avatar))) {
    
                            fs.unlinkSync(path.join(__dirname, '..', user.avatar));
    
                        }
    
                        user.avatar = User.avatarPath + '/' + req.files['avatar'][0].filename;
                        imgUrl = User.avatarPath + '/' + req.files['avatar'][0].filename;
    
                    }
                }

    
                const rand = Math.floor((Math.random() * 100) + 54);
                
                if (req.body.email != '' || req.body.email != undefined) {
                    if (!user.emailkey) {
                        console.log('sent');
                        user.emailkey = rand;
                        emailVerification.newAlert(user, rand, req.body.email);
                        user.email = req.body.email;
                        user.emailverify = false;
                    }
    
                    if (user.email != req.body.email) {
                        console.log('sent again');
                        emailVerification.newAlert(user, rand, req.body.email);
                        user.email = req.body.email;
                        user.emailverify = false;
                        user.emailkey = rand;
                    }
                }
    
    
                user.save();
                return res.json({
                    status:true,
                    msg:'Profile Updated Now',
                    imgUrl:imgUrl,
                    user:user
                })
    
            });
           
    }else{
        return res.json({
        status:false,
        msg:'Invalid User'
        })
    }

    } catch (err) {
        console.log('Error', err);
        return;
    }

}

module.exports.updateProfile = async function(req, res) {

    try {


        let user = await User.findById(req.user.id);
        User.uploadedAvatar(req, res, function(err) {
            if (err) { console.log('*******Multer Error', err); return; }


            user.name = req.body.name;
            user.dob = req.body.dob;
            user.phone = req.body.phone;

            user.contacts.address = req.body.address;
            user.contacts.city = req.body.city;
            user.contacts.state = req.body.state;
            user.contacts.pincode = req.body.pincode;
            user.contacts.country = req.body.country;
            user.bloodgroup = req.body.bloodgroup;
            user.gender = req.body.gender;





            if (req.files['avatar']) {
                if (!user.avatar) {
                    user.avatar = User.avatarPath + '/' + req.files['avatar'][0].filename;
                } else {
                    if (fs.existsSync(path.join(__dirname, '..', user.avatar))) {

                        fs.unlinkSync(path.join(__dirname, '..', user.avatar));

                    }

                    user.avatar = User.avatarPath + '/' + req.files['avatar'][0].filename;

                }
            }

            const rand = Math.floor((Math.random() * 100) + 54);
            
            if (req.body.email != '') {
                if (!user.emailkey) {
                    console.log('sent');
                    user.emailkey = rand;
                    emailVerification.newAlert(user, rand, req.body.email);
                    user.email = req.body.email;
                    user.emailverify = false;
                }

                if (user.email != req.body.email) {
                    console.log('sent again');
                    emailVerification.newAlert(user, rand, req.body.email);
                    user.email = req.body.email;
                    user.emailverify = false;
                    user.emailkey = rand;
                }
            }


            user.save();
            return res.json({
                status:'true',
                avatar:User.avatarPath + '/' + req.files['avatar'][0].filename,
                user:user,
                msg:'Profile Updated'
            })

        });
     


    } catch (err) {
        console.log('Error', err);
        return;
    }

}

module.exports.myAppointments = async(req, res) => {
let userId = await getUserId(req.headers)
if(userId){
    let query = User.findOne({service:'phone',type:'Patient',phone:userId})
    .sort({'doctors.createdAt':'desc'})

    let promise = query.exec();
    if(promise)
    {
        promise.then(doctors => {
            return res.json({
                status:true,
                appointments:doctors.doctors
            })
        });
    }
    else{
        return res.json({
            status:false,
            msg:'Invalid User'
        })
    }
}
else{
    return res.json({
    status:false,
    msg:'Invalid User'
    })
}

}

module.exports.appointmentDetail = async(req, res) => {
    let userId = await getUserId(req.headers)
    if(userId){
        let user = await User.findOne({service:'phone',type:'Patient',phone:userId});
        if(user)
        {
            let appointment;
            for(let u of user.doctors)
            {
                if(u.id === req.body.id)
                {
                    appointment = u;
                    break;
                }
            }

            if(appointment){
                return res.json({
                    status:true,
                    appointment:appointment
                })
            }
            else{
                return res.json({
                    status:false,
                    msg:'No Appointment Found'
                }) 
            }
        }
        else{
            return res.json({
                status:false,
                msg:'Invalid User'
            })
        }
    }
    else{
        return res.json({
        status:false,
        msg:'Invalid User'
        })
    }
    
    }

module.exports.myFavourites = async(req, res) => {
      let userId = await getUserId(req.headers)
    if(userId){
        let user = await User.findOne({service:'phone',type:'Patient',phone:userId});
    if(user)
    {
    return res.json({
        status:true,
        favourites:user.favourites
    })
}
else{
    return res.json({
        status:false,
        msg:'Invalid User'
    })
}
}
else{
    return res.json({
    status:false,
    msg:'Invalid User'
    })
}
}

module.exports.addFavourite = async(req, res) => {
    let userId = await getUserId(req.headers)
    if(userId){
        console.log(req.body)
        let patient = await User.findOne({service:'phone',type:'Patient',phone:userId});
        let doctor = await User.findById(req.body.id);
        if(!patient || !doctor)
        {
            return res.json({
                status:false,
                msg:'Not verified'
            })
        }

        else{
            patient.favourites.push({
                dname:doctor.name,
                davatar:doctor.avatar,
                did:doctor._id,
                ddept:doctor.department,
                daddress:doctor.clinicaddr,
                dcname:doctor.clinicname,
                dcity:doctor.contacts.city,
                dstate:doctor.contacts.state,
                dfee:doctor.booking_fee
            });
            patient.save();
            return res.json({
                status:true,
                msg:'Favourite Added'
            })
        }
}
else{
    return res.json({
    status:false,
    msg:'Invalid User'
    })
}
}

module.exports.removeFavourite = async(req, res) => {
    let userId = await getUserId(req.headers)
    if(userId){
        console.log(req.body)
        let patient = await User.findOne({service:'phone',type:'Patient',phone:userId});
        if(!patient || !req.body.id)
        {
            return res.json({
                status:false,
                msg:'Not verified'
            })
        }

            patient.favourites.pull(req.body.id)
            patient.save();
            return res.json({
                status:true,
                msg:'Favourite Removed'
            })
        }

else{
    return res.json({
    status:false,
    msg:'Invalid User'
    })
}
}

module.exports.changePassword = async(req, res) => {
let userId = await getUserId(req.headers)
if(userId){
    console.log(req.body)
    let user = await User.findOne({service:'phone',phone:userId});
    let isEqual;
    if(!req.body.password || !req.body.confirm || !req.body.old)
    {
        return res.json({
            status:false,
            msg:'Body incomplete'
        })
    }
    if(user.encrypt){
    isEqual = await bcrypt.compare(req.body.old,user.password)
    }

    else
    {
    if(user.password == req.body.old)
    isEqual = true;

    else
    isEqual = false;
    }
    if (isEqual) {
        if (req.body.password != req.body.confirm) {
            return res.json({
                status:false,
                msg:'Password Mismatch!'
            })
        }
        let hashedPass = await bcrypt.hash(req.body.password,10)
        user.password = hashedPass;
        if(!user.encrypt)
        {
            user.encrypt = true;
        }
        user.save();
    
      return res.json({
          status:true,
          msg:'Password Changed'
      })
    }
    else{
        return res.json({
            status:false,
            msg:'Wrong Old Password!'
        })
        
       
    }

  
}
else{
    return res.json({
    status:false,
    msg:'Invalid User'
    })
}

}

module.exports.twoFactor = async(req, res) => {
    let userId = await getUserId(req.headers)
    if(userId){
        let user = await User.findOne({service:'phone',phone:userId});  
    if(req.body.flag === true || req.body.flag === false)
    {
        console.log(req.body)
       
            client
            .verify
            .services(config.serviceID)
            .verifications
            .create({
                to: `+91${user.phone}`,
                channel: 'sms'
            }).then((data) => {
                // console.log(data);
                return res.json({
                   status:'true',
                   msg:'Otp sent successfully',
                   phone:user.phone,
                   flag:req.body.flag
                })
            });
    }
    else{
        return res.json({
            status:false,
            msg:'No Body'
            }) 
    }
}
else{
    return res.json({
    status:false,
    msg:'Invalid User'
    })
}
}

module.exports.enable2Factor = async(req, res) => {
    console.log(req.body)
    let userId = await getUserId(req.headers)
    if(userId){
    let data = await client
    .verify
    .services(config.serviceID)
    .verificationChecks
    .create({
        to: `+91${req.body.phone}`,
        code: req.body.otp
    });


if (data.status == 'approved') {
    let user = await User.findOne({service:'phone',phone:userId});  
    if(req.body.flag === true){
    user.twofactor = true;
    user.save();
    return res.json({
        status:true,
        msg:'Two Factor Enabled',
        twofactor:true
    })
    }
    else if(req.body.flag === false){
        user.twofactor = false;
        user.save();
        return res.json({
            status:true,
            msg:'Two Factor Disabled',
            twofactor:false
        })
    }

    else{
        return res.json({
            status:false,
            msg:'No Body'
            }) 
    }

} else {
    return res.json({
        status:false,
        msg:'Otp Not Verified',
        flag:req.body.flag,
        phone:req.body.phone
    })

}
    }
    else{
        return res.json({
        status:false,
        msg:'Invalid User'
        })
    }
}

module.exports.savedPatients = async(req, res) => {
    let userId = await getUserId(req.headers)
    if(userId){
        let user = await User.findOne({service:'phone',phone:userId,type:'Patient'});
        if(user)
        {
            if(user.others.length>0)
            {
                return res.json({
                    status:true,
                    flag:true,
                    patients:user.others
                })
           }
           else{
            return res.json({
                status:true,
                flag:false,
                patients:user.others
            })
           }
        }
        else{
            return res.json({
                status:false,
                msg:'Invalid User'
                })
        }
    }
    else{
        return res.json({
        status:false,
        msg:'Invalid User'
        })
    }
}

module.exports.checkout = async (req, res) => {
console.log(req.body)
let userId = await getUserId(req.headers)
    if(userId){
    let patient = await User.findOne({service:'phone',type:'Patient',phone:userId});
    let type = 'own';
    if (req.body.new) {
        patient.others.push({
            name: req.body.name,
            email: req.body.email,
            phone: req.body.phone,
            address: req.body.address,
            age: req.body.age,
            gender:req.body.gender
        });
        patient.save()
        type = 'other';
    }
    let user = await User.findById(req.body.did);
    let account_id = user.accountid;
    let percantage_fee = parseInt(user.booking_fee) - parseInt(user.booking_fee)*0.04;
    if(user.poc)
    {
        return res.json({
            status:true,
            poc:true,
            online:false,
            msg:'Display Both Option Pay on clinic and pay online',
            did:req.body.did,
            type:type
        })
    }

    else{
        return res.json({
            status:true,
            poc:false,
            online:true,
            type:type,
            msg:'Display only Pay online',
            did:req.body.did,
            accountid:account_id,
            percantage_fee:percantage_fee

        })
    }
}
else{
        return res.json({
        status:false,
        msg:'Invalid User'
        })
    }
}

module.exports.orderValidation = async function(req, res){
    console.log(req.body);
    if(!req.body.pay)
    {
        return res.status(422).json({
            status:false,
            msg:'Please select the payment method.'
        })
    }


    if(req.body.pay == 'online')
    {
        if(req.body.orderid && req.body.payid)
        {
                let user = await User.findById(req.body.did);
                let userId = await getUserId(req.headers)
                let patient = await User.findOne({phone:userId,type:'Patient',service:'phone'});
        
                let booked,available,time;
                if(typeof(user.schedule_time[req.body.dayindex].start) == 'string'){
                    booked = parseInt(user.schedule_time[req.body.dayindex].booked);
                    available = parseInt(user.schedule_time[req.body.dayindex].available);
                    time = user.schedule_time[req.body.dayindex].start;
                }
            
                if(typeof(user.schedule_time[req.body.dayindex].start) == 'object'){
                    booked = parseInt(user.schedule_time[req.body.dayindex].booked[req.body.slotindex]);
                    available = parseInt(user.schedule_time[req.body.dayindex].available[req.body.slotindex]);
                    time = user.schedule_time[req.body.dayindex].start[req.body.slotindex];
                }
                let date = req.body.date;
                let day = user.schedule_time[req.body.dayindex].day;
                let fee = user.booking_fee;
                let name = user.name;
                let contacts = user.contacts;
                let avgrating = 0,cnt=0;
                for(j of user.reviews)
                {
                 avgrating = avgrating+j.rating;
                 cnt++;
                }
                let rating = parseInt(avgrating/cnt);
        
                    let orderid = Math.floor((Math.random() * 100000) + 54);
                    let staff;
                    if(user.staff_id != null)
                    {
                    staff = await User.findById(user.staff_id);
                    }
                        
                            if (typeof(user.schedule_time[req.body.dayindex].start) == 'object') {
                                let available1 = [];
                                let a = available;
                                a = a - 1;
                                let k = req.body.slotindex;
                                for (var temp = 0; temp < user.schedule_time[req.body.dayindex].start.length; temp++) {
                                    if (temp == k) {
                                        available1.push(a);
                                        continue;
                                    }
                                    var temp1 = parseInt(user.schedule_time[req.body.dayindex].available[temp]);
                                    available1.push(temp1);
                                }
        
                                let booked1 = [];
                                let b = booked;
                                b = b + 1;
                                for (var temp = 0; temp < user.schedule_time[req.body.dayindex].start.length; temp++) {
                                    if (temp == req.body.slotindex) {
                                        booked1.push(b);
                                        continue;
                                    }
                                    var temp1 = parseInt(user.schedule_time[req.body.dayindex].booked[temp]);
                                    booked1.push(temp1);
                                }
                                let daysss = await User.updateOne({ 'schedule_time._id': req.body.id }, {
                                    '$set': {
                                        'schedule_time.$.booked': booked1,
                                         'schedule_time.$.available': available1,
                
                                    }
                                });
                                if (req.body.type == 'own') {
                                    user.patients.push({
                                        payment_id: req.body.payid,
                                        cancel: false,
                                        pid: patient._id,
                                        avatar:patient.avatar,
                                        city:patient.contacts.city,
                                        dob:patient.dob,
                                        gender:patient.gender,
                                        bloodgroup:patient.bloodgroup,
                                        address: req.body.address,
                                        name: req.body.name,
                                        email: req.body.email,
                                        phone: req.body.phone,
                                        time: time,
                                        date: date,
                                        day: day,
                                        fee: fee,
                                        mode:'online',
                                        gender:req.body.gender,
                                        age: req.body.age,
                                        type: req.body.type,
                                        seat: b
                
                                    });
                                    patient.doctors.push({
                                        payment_id: req.body.payid,
                                        cancel: false,
                                        did: req.body.did,
                                        davatar:user.avatar,
                                        dname:user.name,
                                        ddept:user.department,
                                        cname:user.clinicname,
                                        dsid:user.staff_id,
                                        mode:'online',
                                        name: req.body.name,
                                        email: req.body.email,
                                        address: req.body.address,
                                        dayindex: req.body.dayindex,
                                        slotindex: req.body.slotindex,
                                        phone: req.body.phone,
                                        time: time,
                                        date: date,
                                        gender:req.body.gender,
                                        age: req.body.age,
                                        day: day,
                                        fee: fee,
                                        type: req.body.type,
                                        seat: b
                
                                    });
                                     if (staff) {
                
                                        staff.booking.push({
                                            payment_id: req.body.payid,
                                            name: req.body.name,
                                            address: req.body.address,
                                            phone: req.body.phone,
                                            gender:req.body.gender,
                                            age: req.body.age,
                                            cancel: false,
                                            type: 'online',
                                            dayindex: req.body.dayindex,                          
                                            time: time,
                                            date: date,
                                            day: day,
                                            fee: fee,
                                            slot: req.body.slotindex,
                                            seat: b,
                                            did:user._id
                                        });
                                        staff.save();
                                    }
                } else {
                                    user.patients.push({
                                        payment_id: req.body.payid,
                                        cancel: false,
                                        pid: patient._id,
                                        name: req.body.name,
                                        email: req.body.email,
                                        avatar:patient.avatar,
                                        mode:'online',
                                        city:patient.contacts.city,
                                        dob:patient.dob,
                                        bloodgroup:patient.bloodgroup,
                                        gender:patient.gender,
                                        phone: req.body.phone,
                                        time: time,
                                        date: date,
                                        day: day,
                                        fee: fee,
                                        address: req.body.address,
                                        type: req.body.type,
                                        gender:req.body.gender,
                                        age: req.body.age,
                                        seat: b
                
                                    });
                                    patient.doctors.push({
                                        payment_id: req.body.payid,
                                        cancel: false,
                                        did: req.body.did,
                                        name: req.body.name,
                                        email: req.body.email,
                                        mode:'online',
                                        address: req.body.address,
                                        phone: req.body.phone,
                                        davatar:user.avatar,
                                        dname:user.name,
                                        ddept:user.department,
                                        cname:user.clinicname,
                                        dsid:user.staff_id,
                                        gender:req.body.gender,
                                        age: req.body.age,
                                        time: time,
                                        dayindex: req.body.dayindex,
                                        slotindex: req.body.slotindex,
                                        date: date,
                                        day: day,
                                        fee: fee,
                                        type: req.body.type,
                                        seat: b
                
                                    });
                                    
                                    if (staff) {
                
                                        staff.booking.push({
                                            payment_id: req.body.payid,
                                            name: req.body.name,
                                            address: req.body.address,
                                            phone: req.body.phone,
                                            gender:req.body.gender,
                                            age: req.body.age,
                                            cancel: false,
                                            type: 'online',
                                            dayindex: req.body.dayindex,
                                            time: time,
                                            date: date,
                                            day: day,
                                            fee: fee,
                                            slot: req.body.slotindex,
                                            seat: b,
                                            did:user._id
                                        });
                                        staff.save();
                                    }
                
                                }
                                patient.refresh_flag = false;
                                patient.payments.push({
                                    payment_id: req.body.payid,
                                    order_id: req.body.orderid
                                });
                                // patient.notification.push({
                                //     type: 'appointment-success',
                                //     message: 'Your Appointment is confirmed with Dr. ' + user.name + ' on ' + date + ' at ' + time,
                                //     flag: true,
                                //     did: req.body.did
                                // });
                                user.save();
                
                                patient.save();
                
                
                                //   client.messages 
                                //   .create({ 
                                //     body: 'CONFIRMED Appointment for '+ req.query.date +' at '+ req.query.time + ' with Dr. ' + user.name + ' . ' + user.clinicname + ', ' + user.cliniccity + ','  + user.clinicaddr + ', Ph: +91' + user.phone + 'Please show this SMS at the clinic front-desk before your appointment.',
                                //     from: 'whatsapp:+14155238886',       
                                //      to: 'whatsapp:+91'+req.query.phone 
                                //    }) 
                                //   .then(message => console.log(message.sid)) 
                                //   .done();
        
        
                                if(staff)
                                {
                                client.messages
                                    .create({
                                        body: 'CONFIRMED Appointment for ' + date + ' at ' + time + ' with Dr. ' + user.name + '.Your Appointment number is '+ b + '. The clinic details are ' + user.clinicname + ', ' + user.cliniccity + ', ' + user.clinicaddr + ', Ph: +91' + staff.phone + '. The details of the patient are :- Patient Name - ' + req.body.name + ', Age - ' + req.body.age + ', Phone - ' + req.body.phone + ', Address - ' + req.body.address + '. Please show this SMS at the clinic front-desk and pay the amount before your appointment.',
                                        from: '+12108995132',
                                        alphanumeric_id : "AarogyaHub",
                                        statusCallback: 'http://postb.in/1234abcd',
                                        to: '+91' + req.body.phone
                                    })
                                    .then(message => console.log(message.sid));
                                }else{
                                    client.messages
                                    .create({
                                        body: 'CONFIRMED Appointment for ' + date + ' at ' + time + ' with Dr. ' + user.name + '.Your Appointment number is '+ b + '. The clinic details are ' + user.clinicname + ', ' + user.cliniccity + ', ' + user.clinicaddr + '. The details of the patient are :- Patient Name - ' + req.body.name + ', Age - ' + req.body.age + ', Phone - ' + req.body.phone + ', Address - ' + req.body.address + '. Please show this SMS at the clinic front-desk and pay the amount before your appointment.',
                                        from: '+12108995132',
                                        alphanumeric_id : "AarogyaHub",
                                        statusCallback: 'http://postb.in/1234abcd',
                                        to: '+91' + req.body.phone
                                    })
                                    .then(message => console.log(message.sid));
                                }
                                if (patient.email) {
                                    appointmentAlert.newAlert(date, time, req.body.email, user, patient);
                                }
                                client.messages
                                .create({
                                    body: 'CONFIRMED Online Appointment (PAY-ON-CLINIC): The details of the patient are :- Patient Name - ' + req.body.name + ', Age - ' + req.body.age + ', Phone - ' + req.body.phone + ', Address - ' + req.body.address + '. The appointment details are :- Appointment number - '+ b + ', Date - ' + date + ', Day - ' + day + ', Time - ' + time + '. Please make sure to ask the online patient to pay the amount and show the appointment success message.',
                                    from: '+12108995132',
                                    alphanumeric_id : "AarogyaHub",
                                    statusCallback: 'http://postb.in/1234abcd',
                                    to: '+91' + user.phone
                                })
                                .then(message => console.log(message.sid));
                                
                            if (user.email) {
                                appointmentAlert.newDoctorAlertPOC(req.body.name,req.body.age,req.body.phone,req.body.address,b,date,day,time, fee,user.email);
                            }
                       
                                appointmentAlert.adminAlert(req.body.name,req.body.age,req.body.phone,req.body.address,b,date,day, time, fee,'himalayshankar32@gmail.com',user.name);
                            
                
                
                
                                return res.json({
                                    status:true,
                                    msg:'Seat Booked Successfully',
                                    seat: b,
                                    date: date,
                                    time:time,
                                    fee:fee,
                                    dname:user.name,
                                    daddress:user.clinicaddr,
                                    ddepartment:user.department,
                                    id:user._id,
                                    name: req.body.name,
                                    address: req.body.address,
                                    phone: req.body.phone,
                                    age: req.body.age,
                                    gender:req.body.gender
                                });
                
                            }
                
                            if (typeof(user.schedule_time[req.body.dayindex].start) == 'string') {
                                let bd1 = user.schedule_time[req.body.dayindex].booked;
                                let k1 = parseInt(bd1);
                                k1 += 1;
                                var k2 = parseInt(user.schedule_time[req.body.dayindex].available);
                                k2 -= 1;
                                        let booked,available,time;
                if(typeof(user.schedule_time[req.body.dayindex].start) == 'string'){
                    booked = parseInt(user.schedule_time[req.body.dayindex].booked);
                    available = parseInt(user.schedule_time[req.body.dayindex].available);
                    time = user.schedule_time[req.body.dayindex].start;
                }
            
                if(typeof(user.schedule_time[req.body.dayindex].start) == 'object'){
                    booked = parseInt(user.schedule_time[req.body.dayindex].booked[req.body.slotindex]);
                    available = parseInt(user.schedule_time[req.body.dayindex].available[req.body.slotindex]);
                    time = user.schedule_time[req.body.dayindex].start[req.body.slotindex];
                }
                let date = req.body.date;
                let day = user.schedule_time[req.body.dayindex].day;
                let fee = user.booking_fee;
                let name = user.name;
                let contacts = user.contacts;
                let avgrating = 0,cnt=0;
                for(j of user.reviews)
                {
                 avgrating = avgrating+j.rating;
                 cnt++;
                }
                let rating = parseInt(avgrating/cnt);
                
                
                                let dayssssss = await User.updateOne({ 'schedule_time._id': req.body.id }, {
                                    '$set': {
                                        'schedule_time.$.booked': k1,
                                              'schedule_time.$.available': k2,
                
                                    }
                                });
                                if (req.body.type == 'own') {
                                    user.patients.push({
                                        payment_id: req.body.payid,
                                        cancel: false,
                                        pid: patient._id,
                                        name: req.body.name,
                                        email: req.body.email,
                                        city:patient.contacts.city,
                                        dob:patient.dob,
                                        gender:req.body.gender,
                                        age: req.body.age,
                                        mode:'online',
                                        bloodgroup:patient.bloodgroup,
                                        gender:patient.gender,
                                        phone: req.body.phone,
                                        time: time,
                                        avatar:patient.avatar,
                                        date:date,
                                        address: req.body.address,
                                        day: day,
                                        fee: fee,
                                        type: req.body.type,
                                        seat: k1
                
                                    });
                                    patient.doctors.push({
                                        payment_id: req.body.payid,
                                        cancel: false,
                                        did: req.body.did,
                                        name: req.body.name,
                                        gender:req.body.gender,
                                        age: req.body.age,
                                        mode:'online',
                                        email: req.body.email,
                                        phone: req.body.phone,
                                        time: time,
                                        davatar:user.avatar,
                                        dname:user.name,
                                        ddept:user.department,
                                        cname:user.clinicname,
                                        address: req.body.address,
                                        dsid:user.staff_id,
                                        date: date,
                                        dayindex: req.body.dayindex,
                                        // slotindex: req.query.slotindex,
                                        day: day,
                                        fee: fee,
                                        type: req.body.type,
                                        seat: k1
                
                                    });
                
                                    if (staff) {
                
                                        staff.booking.push({
                                            payment_id: req.body.payid,
                                            name: req.body.name,
                                            address: req.body.address,
                                            phone: req.body.phone,
                                            gender:req.body.gender,
                                        age: req.body.age,
                                            cancel: false,
                                            dayindex: req.body.dayindex,
                                            type: 'online',
                                            time: time,
                                            date: date,
                                            day: day,
                                            fee: fee,
                                            seat: k1,
                                            did:user._id
                                        });
                                        staff.save();
                                    }
                
                                } else {
                                    user.patients.push({
                                        payment_id: req.body.payid,
                                        cancel: false,
                                        pid: patient._id,
                                        name: req.body.name,
                                        email: req.body.email,
                                        phone: req.body.phone,
                                        time: time,
                                        city:patient.contacts.city,
                                        dob:patient.dob,
                                        bloodgroup:patient.bloodgroup,
                                        gender:patient.gender,
                                        address: req.body.address,
                                        avatar:patient.avatar,
                                        mode:'online',
                                        date: date,
                                        day: day,
                                         gender:req.body.gender,
                                        age: req.body.age,
                                        fee: fee,
                                        type: req.body.type,
                                        seat: k1
                
                                    });
                                    patient.doctors.push({
                                        payment_id: req.body.payid,
                                        cancel: false,
                                        did: req.body.did,
                                        name: req.body.name,
                                        email: req.body.email,
                                        phone: req.body.phone,
                                        davatar:user.avatar,
                                        address: req.body.address,
                                        dname:user.name,
                                        ddept:user.department,
                                        cname:user.clinicname,
                                        dsid:user.staff_id,
                                        time: time,
                                        date: date,
                                        gender:req.body.gender,
                                        age: req.body.age,
                                        mode:'online',
                                        dayindex: req.body.dayindex,
                                        // slotindex: req.body.slotindex,
                                        day: day,
                                        fee: fee,
                                        type: req.body.type,
                                        seat: k1
                
                                    });
                                   
                
                                    if (staff) {
                
                                        staff.booking.push({
                                            payment_id: req.body.payid,
                                            name: req.body.name,
                                            address: req.body.address,
                                            phone: req.body.phone,
                                            gender:req.body.gender,
                                            age: req.body.age,
                                            cancel: false,
                                            type: 'online',
                                            time: time,
                                            dayindex: req.body.dayindex,
                                            date: date,
                                            day: day,
                                            fee: fee,
                                            seat: k1,
                                            did:user._id
                                        });
                                        staff.save();
                                    }
                
                
                
                                }
                                patient.refresh_flag = false;
                                patient.payments.push({
                                    payment_id: req.body.payid,
                                    order_id: req.body.orderid
                                });
                                // patient.notification.push({
                                //     type: 'appointment-success',
                                //     message: 'Your Apointment is confirmed with Dr. ' + user.name + ' on ' + date + ' at ' + time,
                                //     flag: true,
                                //     did: req.body.did
                                // });
                
                                user.save();
                
                                patient.save();
                
                                //  client.messages 
                                //   .create({ 
                                //     body: 'CONFIRMED Appointment for '+ req.query.date +' at '+ req.query.time + ' with Dr. ' + user.name + ' . ' + user.clinicname + ', ' + user.cliniccity + ','  + user.clinicaddr + ', Ph: +91' + user.phone + 'Please show this SMS at the clinic front-desk before your appointment.',
                                //     from: 'whatsapp:+14155238886',       
                                //      to: 'whatsapp:+91'+req.query.phone 
                                //    }) 
                                //   .then(message => console.log(message.sid)) 
                                //   .done();
        
                                if(staff)
                                {
                                client.messages
                                    .create({
                                        body: 'CONFIRMED Appointment for ' + date + ' at ' + time + ' with Dr. ' + user.name + '.Your Appointment number is '+ k1 + '. The clinic details are ' + user.clinicname + ', ' + user.cliniccity + ', ' + user.clinicaddr + ', Ph: +91' + staff.phone + '. The details of the patient are :- Patient Name - ' + req.body.name + ', Age - ' + req.body.age + ', Phone - ' + req.body.phone + ', Address - ' + req.body.address + '. Please show this SMS at the clinic front-desk and pay the amount before your appointment.',
                                        from: '+12108995132',
                                        alphanumeric_id : "AarogyaHub",
                                        statusCallback: 'http://postb.in/1234abcd',
                                        to: '+91' + req.body.phone
                                    })
                                    .then(message => console.log(message.sid));
                                }
                                else{
                                    client.messages
                                    .create({
                                        body: 'CONFIRMED Appointment for ' + date + ' at ' + time + ' with Dr. ' + user.name + '.Your Appointment number is '+ k1 + '. The clinic details are ' + user.clinicname + ', ' + user.cliniccity + ', ' + user.clinicaddr + '. The details of the patient are :- Patient Name - ' + req.body.name + ', Age - ' + req.body.age + ', Phone - ' + req.body.phone + ', Address - ' + req.body.address + '. Please show this SMS at the clinic front-desk and pay the amount before your appointment.',
                                        from: '+12108995132',
                                        alphanumeric_id : "AarogyaHub",
                                        statusCallback: 'http://postb.in/1234abcd',
                                        to: '+91' + req.body.phone
                                    })
                                    .then(message => console.log(message.sid));
                                 
                                }
                                if (patient.email) {
                                    appointmentAlert.newAlert(date, time, req.body.email, user, patient);
                                }
                                client.messages
                                .create({
                                    body: 'CONFIRMED Online Appointment (PAY-ON-CLINIC): The details of the patient are :- Patient Name - ' + req.body.name + ', Age - ' + req.body.age + ', Phone - ' + req.body.phone + ', Address - ' + req.body.address + '. The appointment details are :- Appointment number - '+ k1 + ', Date - ' + date + ', Day - ' + day + ', Time - ' + time + '. Please make sure to ask the online patient to pay the amount and show the appointment success message.',
                                    from: '+12108995132',
                                    alphanumeric_id : "AarogyaHub",
                                    statusCallback: 'http://postb.in/1234abcd',
                                    to: '+91' + user.phone
                                })
                                .then(message => console.log(message.sid));
                                
                            if (user.email) {
                                appointmentAlert.newDoctorAlertPOC(req.body.name,req.body.age,req.body.phone,req.body.address,k1,date,day, time, fee,user.email);
                            }
                            appointmentAlert.adminAlert(req.body.name,req.body.age,req.body.phone,req.body.address,k1,date,day, time, fee,'himalayshankar32@gmail.com',user.name);
                
                
                
                                return res.json({
                                     status:true,
                                     msg:'Seat Booked Successfully',
                                    seat: k1,
                                    date: date,
                                    time:time,
                                    fee:fee,
                                    dname:user.name,
                                    daddress:user.clinicaddr,
                                    ddepartment:user.department,
                                    id:user._id,
                                    name: req.body.name,
                                    address: req.body.address,
                                    phone: req.body.phone,
                                    age: req.body.age,
                                gender:req.body.gender
                                });
                
                            }
                     
           
        }

        else{
            if(!req.body.name)
            {
                return res.status(422).json({
                    status:false,
                    msg:'Please enter your name.'
                })
            }
            if(!req.body.phone)
            {
                return res.status(422).json({
                    status:false,
                    msg:'Please enter your phone.'
                })
            }
            if(!req.body.address)
            {
                return res.status(422).json({
                    status:false,
                    msg:'Please enter your address.'
                })
            }
            if(!req.body.gender)
            {
                return res.status(422).json({
                    status:false,
                    msg:'Please enter your gender.'
                })
            }
            if(!req.body.age)
            {
                return res.status(422).json({
                    status:false,
                    msg:'Please enter your age.'
                })
            }
            if(!req.body.type)
            {
                return res.status(422).json({
                    status:false,
                    msg:'Please select the patient type.'
                })
            }
            if(!req.body.id)
            {
                return res.status(422).json({
                    status:false,
                    msg:'Please enter the id.'
                })
            }
            if(!req.body.did)
            {
                return res.status(422).json({
                    status:false,
                    msg:'Please enter the did.'
                })
            }
            // if(!req.body.slotindex)
            // {
            //     return res.status(422).json({
            //         status:false,
            //         msg:'Please enter the slotindex.'
            //     })
            // }
            // if(!req.body.dayindex)
            // {
            //     return res.status(422).json({
            //         status:false,
            //         msg:'Please enter the dayindex.'
            //     })
            // }
            if(req.body.type !='own' && req.body.type!='other')
            {
                return res.status(422).json({
                    status:false,
                    msg:'Please select the correct patient type.'
                })
            }
            else{
                    let userId = await getUserId(req.headers)
                    let patient = await User.findOne({service:'phone',type:'Patient',phone:userId});
                    let doctor = await User.findById(req.body.did);
                        const razorpay = new Razorpay({
                            key_id: env.razorpay_key_id,
                            key_secret: env.razorpay_key_secret
                        
                    });


        
                    const payment_capture = 1;
                    const amount = doctor.booking_fee;
                    const currency = 'INR';
                    var notes;
                        notes = {
                            patient_name: req.body.name,
                            patient_age:req.body.age,
                            patient_gender:req.body.gender,
                            patient_phone:req.body.phone,
                            patient_address:req.body.address
                        }
                    const vendor_amount = amount-(amount*0.04);
                   var stra = req.body.date.split('-');
                   var strb = stra[2]+'-'+stra[1]+'-'+stra[0];      
                   var bdate = new Date(strb);
                   bdate.setDate(bdate.getDate() + 1);
                   var ndate = bdate.getTime()/1000;
                    
                    const response = await razorpay.orders.create({
                        amount:amount*100,
                        currency,
                        receipt: shortid.generate(),
                        payment_capture,
                        notes,
                        transfers: [
                            {
                            account: doctor.accountid,
                            amount: vendor_amount*100,
                            currency: "INR"
                            }
                        ]
                });

              

                return res.json({
                    status:true,
                    amount: response.amount,
                    orderid: response.id,
                    currency: response.currency,
                    slotindex: req.body.slotindex,
                    dayindex: req.body.dayindex,
                    notes:notes,
                    id: req.body.id,
                    did: req.body.did,
                    date: req.body.date,
                    type: req.body.type,
                    name:req.body.name,
                    phone:patient.phone,
                    email:patient.email,
                    age:req.body.age,
                    gender:req.body.gender,
                    address:req.body.address
                })
            } 
        }
    }

    if(req.body.pay == 'offline')
    {
            //Validation
            if(!req.body.name)
            {
                return res.status(422).json({
                    status:false,
                    msg:'Please enter your name.'
                })
            }
            if(!req.body.phone)
            {
                return res.status(422).json({
                    status:false,
                    msg:'Please enter your phone.'
                })
            }
            if(!req.body.address)
            {
                return res.status(422).json({
                    status:false,
                    msg:'Please enter your address.'
                })
            }
            if(!req.body.gender)
            {
                return res.status(422).json({
                    status:false,
                    msg:'Please enter your gender.'
                })
            }
            if(!req.body.age)
            {
                return res.status(422).json({
                    status:false,
                    msg:'Please enter your age.'
                })
            }
            if(!req.body.type)
            {
                return res.status(422).json({
                    status:false,
                    msg:'Please select the patient type.'
                })
            }
            if(!req.body.id)
            {
                return res.status(422).json({
                    status:false,
                    msg:'Please enter the id.'
                })
            }
            if(!req.body.did)
            {
                return res.status(422).json({
                    status:false,
                    msg:'Please enter the did.'
                })
            }
            // if(!req.body.slotindex)
            // {
            //     return res.status(422).json({
            //         status:false,
            //         msg:'Please enter the slotindex.'
            //     })
            // }
            if(!req.body.dayindex)
            {
                return res.status(422).json({
                    status:false,
                    msg:'Please enter the dayindex.'
                })
            }
            if(req.body.type !='own' && req.body.type!='other')
            {
                return res.status(422).json({
                    status:false,
                    msg:'Please select the correct patient type.'
                })
            }

           else{

                let user = await User.findById(req.body.did);
                
                let userId = await getUserId(req.headers)
                let patient = await User.findOne({phone:userId,type:'Patient',service:'phone'});
                console.log(userId,patient)
                patient.refresh_flag = true;
                let booked,available,time;
                if(typeof(user.schedule_time[req.body.dayindex].start) == 'string'){
                    booked = parseInt(user.schedule_time[req.body.dayindex].booked);
                    available = parseInt(user.schedule_time[req.body.dayindex].available);
                    time = user.schedule_time[req.body.dayindex].start;
                }
            
                if(typeof(user.schedule_time[req.body.dayindex].start) == 'object'){
                    booked = parseInt(user.schedule_time[req.body.dayindex].booked[req.body.slotindex]);
                    available = parseInt(user.schedule_time[req.body.dayindex].available[req.body.slotindex]);
                    time = user.schedule_time[req.body.dayindex].start[req.body.slotindex];
                }
                let date = req.body.date;
                let day = user.schedule_time[req.body.dayindex].day;
                let fee = user.booking_fee;
                let name = user.name;
                let contacts = user.contacts;
                let avgrating = 0,cnt=0;
                for(j of user.reviews)
                {
                 avgrating = avgrating+j.rating;
                 cnt++;
                }
                let rating = parseInt(avgrating/cnt);
        
                    let orderid = Math.floor((Math.random() * 100000) + 54);
                    let staff;
                    if(user.staff_id != null)
                    {
                    staff = await User.findById(user.staff_id);
                    }
                   
                   
                
                    if (patient.refresh_flag == true) {
                        
                            if (typeof(user.schedule_time[req.body.dayindex].start) == 'object') {
                                let available1 = [];
                                let a = available;
                                a = a - 1;
                                let k = req.body.slotindex;
                                for (var temp = 0; temp < user.schedule_time[req.body.dayindex].start.length; temp++) {
                                    if (temp == k) {
                                        available1.push(a);
                                        continue;
                                    }
                                    var temp1 = parseInt(user.schedule_time[req.body.dayindex].available[temp]);
                                    available1.push(temp1);
                                }
        
                                let booked1 = [];
                                let b = booked;
                                b = b + 1;
                                for (var temp = 0; temp < user.schedule_time[req.body.dayindex].start.length; temp++) {
                                    if (temp == req.body.slotindex) {
                                        booked1.push(b);
                                        continue;
                                    }
                                    var temp1 = parseInt(user.schedule_time[req.body.dayindex].booked[temp]);
                                    booked1.push(temp1);
                                }
                                let daysss = await User.updateOne({ 'schedule_time._id': req.body.id }, {
                                    '$set': {
                                        'schedule_time.$.booked': booked1,
                                         'schedule_time.$.available': available1,
                
                                    }
                                });
                                if (req.body.type == 'own') {
                                    user.patients.push({
                                        payment_id: orderid,
                                        cancel: false,
                                        pid: patient._id,
                                        avatar:patient.avatar,
                                        city:patient.contacts.city,
                                        dob:patient.dob,
                                        gender:patient.gender,
                                        bloodgroup:patient.bloodgroup,
                                        address: req.body.address,
                                        name: req.body.name,
                                        email: req.body.email,
                                        phone: req.body.phone,
                                        time: time,
                                        date: date,
                                        day: day,
                                        fee: fee,
                                        mode:'payonclinic',
                                        gender:req.body.gender,
                                        age: req.body.age,
                                        type: req.body.type,
                                        seat: b
                
                                    });
                                    patient.doctors.push({
                                        payment_id: orderid,
                                        cancel: false,
                                        did: req.body.did,
                                        davatar:user.avatar,
                                        dname:user.name,
                                        ddept:user.department,
                                        cname:user.clinicname,
                                        dsid:user.staff_id,
                                        mode:'payonclinic',
                                        name: req.body.name,
                                        email: req.body.email,
                                        address: req.body.address,
                                        dayindex: req.body.dayindex,
                                        slotindex: req.body.slotindex,
                                        phone: req.body.phone,
                                        time: time,
                                        date: date,
                                        gender:req.body.gender,
                                        age: req.body.age,
                                        day: day,
                                        fee: fee,
                                        type: req.body.type,
                                        seat: b
                
                                    });
                                     if (staff) {
                
                                        staff.booking.push({
                                            payment_id: orderid,
                                            name: req.body.name,
                                            address: req.body.address,
                                            phone: req.body.phone,
                                            gender:req.body.gender,
                                            age: req.body.age,
                                            cancel: false,
                                            type: 'payonclinic',
                                            dayindex: req.body.dayindex,                          
                                            time: time,
                                            date: date,
                                            day: day,
                                            fee: fee,
                                            slot: req.body.slotindex,
                                            seat: b,
                                            did:user._id
                                        });
                                        staff.save();
                                    }
                } else {
                                    user.patients.push({
                                        payment_id: orderid,
                                        cancel: false,
                                        pid: patient._id,
                                        name: req.body.name,
                                        email: req.body.email,
                                        avatar:patient.avatar,
                                        mode:'payonclinic',
                                        city:patient.contacts.city,
                                        dob:patient.dob,
                                        bloodgroup:patient.bloodgroup,
                                        gender:patient.gender,
                                        phone: req.body.phone,
                                        time: time,
                                        date: date,
                                        day: day,
                                        fee: fee,
                                        address: req.body.address,
                                        type: req.body.type,
                                        gender:req.body.gender,
                                        age: req.body.age,
                                        seat: b
                
                                    });
                                    patient.doctors.push({
                                        payment_id: orderid,
                                        cancel: false,
                                        did: req.body.did,
                                        name: req.body.name,
                                        email: req.body.email,
                                        mode:'payonclinic',
                                        address: req.body.address,
                                        phone: req.body.phone,
                                        davatar:user.avatar,
                                        dname:user.name,
                                        ddept:user.department,
                                        cname:user.clinicname,
                                        dsid:user.staff_id,
                                        gender:req.body.gender,
                                        age: req.body.age,
                                        time: time,
                                        dayindex: req.body.dayindex,
                                        slotindex: req.body.slotindex,
                                        date: date,
                                        day: day,
                                        fee: fee,
                                        type: req.body.type,
                                        seat: b
                
                                    });
                                    
                                    if (staff) {
                
                                        staff.booking.push({
                                            payment_id: orderid,
                                            name: req.body.name,
                                            address: req.body.address,
                                            phone: req.body.phone,
                                            gender:req.body.gender,
                                            age: req.body.age,
                                            cancel: false,
                                            type: 'payonclinic',
                                            dayindex: req.body.dayindex,
                                            time: time,
                                            date: date,
                                            day: day,
                                            fee: fee,
                                            slot: req.body.slotindex,
                                            seat: b,
                                            did:user._id
                                        });
                                        staff.save();
                                    }
                
                                }
                                patient.refresh_flag = false;
                               
                                // patient.notification.push({
                                //     type: 'appointment-success',
                                //     message: 'Your Appointment is confirmed with Dr. ' + user.name + ' on ' + date + ' at ' + time,
                                //     flag: true,
                                //     did: req.body.did
                                // });
                                user.save();
                
                                patient.save();
                
                
                                //   client.messages 
                                //   .create({ 
                                //     body: 'CONFIRMED Appointment for '+ req.query.date +' at '+ req.query.time + ' with Dr. ' + user.name + ' . ' + user.clinicname + ', ' + user.cliniccity + ','  + user.clinicaddr + ', Ph: +91' + user.phone + 'Please show this SMS at the clinic front-desk before your appointment.',
                                //     from: 'whatsapp:+14155238886',       
                                //      to: 'whatsapp:+91'+req.query.phone 
                                //    }) 
                                //   .then(message => console.log(message.sid)) 
                                //   .done();
        
        
                                if(staff)
                                {
                                client.messages
                                    .create({
                                        body: 'CONFIRMED Appointment for ' + date + ' at ' + time + ' with Dr. ' + user.name + '.Your Appointment number is '+ b + '. The clinic details are ' + user.clinicname + ', ' + user.cliniccity + ', ' + user.clinicaddr + ', Ph: +91' + staff.phone + '. The details of the patient are :- Patient Name - ' + req.body.name + ', Age - ' + req.body.age + ', Phone - ' + req.body.phone + ', Address - ' + req.body.address + '. Please show this SMS at the clinic front-desk and pay the amount before your appointment.',
                                        from: '+12108995132',
                                        alphanumeric_id : "AarogyaHub",
                                        statusCallback: 'http://postb.in/1234abcd',
                                        to: '+91' + req.body.phone
                                    })
                                    .then(message => console.log(message.sid));
                                }else{
                                    client.messages
                                    .create({
                                        body: 'CONFIRMED Appointment for ' + date + ' at ' + time + ' with Dr. ' + user.name + '.Your Appointment number is '+ b + '. The clinic details are ' + user.clinicname + ', ' + user.cliniccity + ', ' + user.clinicaddr + '. The details of the patient are :- Patient Name - ' + req.body.name + ', Age - ' + req.body.age + ', Phone - ' + req.body.phone + ', Address - ' + req.body.address + '. Please show this SMS at the clinic front-desk and pay the amount before your appointment.',
                                        from: '+12108995132',
                                        alphanumeric_id : "AarogyaHub",
                                        statusCallback: 'http://postb.in/1234abcd',
                                        to: '+91' + req.body.phone
                                    })
                                    .then(message => console.log(message.sid));
                                }
                                if (patient.email) {
                                    appointmentAlert.newAlert(date, time, req.body.email, user, patient);
                                }
                                client.messages
                                .create({
                                    body: 'CONFIRMED Online Appointment (PAY-ON-CLINIC): The details of the patient are :- Patient Name - ' + req.body.name + ', Age - ' + req.body.age + ', Phone - ' + req.body.phone + ', Address - ' + req.body.address + '. The appointment details are :- Appointment number - '+ b + ', Date - ' + date + ', Day - ' + day + ', Time - ' + time + '. Please make sure to ask the online patient to pay the amount and show the appointment success message.',
                                    from: '+12108995132',
                                    alphanumeric_id : "AarogyaHub",
                                    statusCallback: 'http://postb.in/1234abcd',
                                    to: '+91' + user.phone
                                })
                                .then(message => console.log(message.sid));
                            //     if(staff)
                            //     {
                            //     client.messages
                            //     .create({
                            //         body: 'CONFIRMED Online Appointment (PAY-ON-CLINIC): The details of the patient are :- Patient Name - ' + req.body.name + ', Age - ' + req.body.age + ', Phone - ' + req.body.phone + ', Address - ' + req.body.address + '. The appointment details are :- Appointment number - '+ b + ', Date - ' + date + ', Day - ' + day + ', Time - ' + time + '. Please make sure to ask the online patient to pay the amount and show the appointment success message.',
                            //         from: '+12108995132',
                            //         alphanumeric_id : "AarogyaHub",
                            //         statusCallback: 'http://postb.in/1234abcd',
                            //         to: '+91' + staff.phone
                            //     })
                            //     .then(message => console.log(message.sid));
                            // }
                            if (user.email) {
                                appointmentAlert.newDoctorAlertPOC(req.body.name,req.body.age,req.body.phone,req.body.address,b,date,day,time, fee,user.email);
                            }
                       
                                appointmentAlert.adminAlert(req.body.name,req.body.age,req.body.phone,req.body.address,b,date,day, time, fee,'himalayshankar32@gmail.com',user.name);
                            
                
                
                
                                return res.json({
                                    status:true,
                                    msg:'Seat Booked Successfully',
                                    seat: b,
                                    date: date,
                                    time:time,
                                    fee:fee,
                                    dname:user.name,
                                    id:user._id,
                                    daddress:user.clinicaddr,
                                    ddepartment:user.department,
                                    name: req.body.name,
                                    address: req.body.address,
                                    phone: req.body.phone,
                                    age: req.body.age,
                                    gender:req.body.gender
                                });
                
                            }
                
                            if (typeof(user.schedule_time[req.body.dayindex].start) == 'string') {
                                let bd1 = user.schedule_time[req.body.dayindex].booked;
                                let k1 = parseInt(bd1);
                                k1 += 1;
                                var k2 = parseInt(user.schedule_time[req.body.dayindex].available);
                                k2 -= 1;
                                        let booked,available,time;
                if(typeof(user.schedule_time[req.body.dayindex].start) == 'string'){
                    booked = parseInt(user.schedule_time[req.body.dayindex].booked);
                    available = parseInt(user.schedule_time[req.body.dayindex].available);
                    time = user.schedule_time[req.body.dayindex].start;
                }
            
                if(typeof(user.schedule_time[req.body.dayindex].start) == 'object'){
                    booked = parseInt(user.schedule_time[req.body.dayindex].booked[req.body.slotindex]);
                    available = parseInt(user.schedule_time[req.body.dayindex].available[req.body.slotindex]);
                    time = user.schedule_time[req.body.dayindex].start[req.body.slotindex];
                }
                let date = req.body.date;
                let day = user.schedule_time[req.body.dayindex].day;
                let fee = user.booking_fee;
                let name = user.name;
                let contacts = user.contacts;
                let avgrating = 0,cnt=0;
                for(j of user.reviews)
                {
                 avgrating = avgrating+j.rating;
                 cnt++;
                }
                let rating = parseInt(avgrating/cnt);
                
                
                                let dayssssss = await User.updateOne({ 'schedule_time._id': req.body.id }, {
                                    '$set': {
                                        'schedule_time.$.booked': k1,
                                              'schedule_time.$.available': k2,
                
                                    }
                                });
                                if (req.body.type == 'own') {
                                    user.patients.push({
                                        payment_id: orderid,
                                        cancel: false,
                                        pid: patient._id,
                                        name: req.body.name,
                                        email: req.body.email,
                                        city:patient.contacts.city,
                                        dob:patient.dob,
                                        gender:req.body.gender,
                                        age: req.body.age,
                                        mode:'payonclinic',
                                        bloodgroup:patient.bloodgroup,
                                        gender:patient.gender,
                                        phone: req.body.phone,
                                        time: time,
                                        avatar:patient.avatar,
                                        date:date,
                                        address: req.body.address,
                                        day: day,
                                        fee: fee,
                                        type: req.body.type,
                                        seat: k1
                
                                    });
                                    patient.doctors.push({
                                        payment_id: orderid,
                                        cancel: false,
                                        did: req.body.did,
                                        name: req.body.name,
                                        gender:req.body.gender,
                                        age: req.body.age,
                                        mode:'payonclinic',
                                        email: req.body.email,
                                        phone: req.body.phone,
                                        time: time,
                                        davatar:user.avatar,
                                        dname:user.name,
                                        ddept:user.department,
                                        cname:user.clinicname,
                                        address: req.body.address,
                                        dsid:user.staff_id,
                                        date: date,
                                        dayindex: req.body.dayindex,
                                        // slotindex: req.query.slotindex,
                                        day: day,
                                        fee: fee,
                                        type: req.body.type,
                                        seat: k1
                
                                    });
                
                                    if (staff) {
                
                                        staff.booking.push({
                                            payment_id: orderid,
                                            name: req.body.name,
                                            address: req.body.address,
                                            phone: req.body.phone,
                                            gender:req.body.gender,
                                        age: req.body.age,
                                            cancel: false,
                                            dayindex: req.body.dayindex,
                                            type: 'payonclinic',
                                            time: time,
                                            date: date,
                                            day: day,
                                            fee: fee,
                                            seat: k1,
                                            did:user._id
                                        });
                                        staff.save();
                                    }
                
                                } else {
                                    user.patients.push({
                                        payment_id: orderid,
                                        cancel: false,
                                        pid: patient._id,
                                        name: req.body.name,
                                        email: req.body.email,
                                        phone: req.body.phone,
                                        time: time,
                                        city:patient.contacts.city,
                                        dob:patient.dob,
                                        bloodgroup:patient.bloodgroup,
                                        gender:patient.gender,
                                        address: req.body.address,
                                        avatar:patient.avatar,
                                        mode:'payonclinic',
                                        date: date,
                                        day: day,
                                         gender:req.body.gender,
                                        age: req.body.age,
                                        fee: fee,
                                        type: req.body.type,
                                        seat: k1
                
                                    });
                                    patient.doctors.push({
                                        payment_id: orderid,
                                        cancel: false,
                                        did: req.body.did,
                                        name: req.body.name,
                                        email: req.body.email,
                                        phone: req.body.phone,
                                        davatar:user.avatar,
                                        address: req.body.address,
                                        dname:user.name,
                                        ddept:user.department,
                                        cname:user.clinicname,
                                        dsid:user.staff_id,
                                        time: time,
                                        date: date,
                                        gender:req.body.gender,
                                        age: req.body.age,
                                        mode:'payonclinic',
                                        dayindex: req.body.dayindex,
                                        // slotindex: req.body.slotindex,
                                        day: day,
                                        fee: fee,
                                        type: req.body.type,
                                        seat: k1
                
                                    });
                                   
                
                                    if (staff) {
                
                                        staff.booking.push({
                                            payment_id: orderid,
                                            name: req.body.name,
                                            address: req.body.address,
                                            phone: req.body.phone,
                                            gender:req.body.gender,
                                            age: req.body.age,
                                            cancel: false,
                                            type: 'payonclinic',
                                            time: time,
                                            dayindex: req.body.dayindex,
                                            date: date,
                                            day: day,
                                            fee: fee,
                                            seat: k1,
                                            did:user._id
                                        });
                                        staff.save();
                                    }
                
                
                
                                }
                                patient.refresh_flag = false;
                                
                                // patient.notification.push({
                                //     type: 'appointment-success',
                                //     message: 'Your Apointment is confirmed with Dr. ' + user.name + ' on ' + date + ' at ' + time,
                                //     flag: true,
                                //     did: req.body.did
                                // });
                
                                user.save();
                
                                patient.save();
                
                                //  client.messages 
                                //   .create({ 
                                //     body: 'CONFIRMED Appointment for '+ req.query.date +' at '+ req.query.time + ' with Dr. ' + user.name + ' . ' + user.clinicname + ', ' + user.cliniccity + ','  + user.clinicaddr + ', Ph: +91' + user.phone + 'Please show this SMS at the clinic front-desk before your appointment.',
                                //     from: 'whatsapp:+14155238886',       
                                //      to: 'whatsapp:+91'+req.query.phone 
                                //    }) 
                                //   .then(message => console.log(message.sid)) 
                                //   .done();
        
                                if(staff)
                                {
                                client.messages
                                    .create({
                                        body: 'CONFIRMED Appointment for ' + date + ' at ' + time + ' with Dr. ' + user.name + '.Your Appointment number is '+ k1 + '. The clinic details are ' + user.clinicname + ', ' + user.cliniccity + ', ' + user.clinicaddr + ', Ph: +91' + staff.phone + '. The details of the patient are :- Patient Name - ' + req.body.name + ', Age - ' + req.body.age + ', Phone - ' + req.body.phone + ', Address - ' + req.body.address + '. Please show this SMS at the clinic front-desk and pay the amount before your appointment.',
                                        from: '+12108995132',
                                        alphanumeric_id : "AarogyaHub",
                                        statusCallback: 'http://postb.in/1234abcd',
                                        to: '+91' + req.body.phone
                                    })
                                    .then(message => console.log(message.sid));
                                }
                                else{
                                    client.messages
                                    .create({
                                        body: 'CONFIRMED Appointment for ' + date + ' at ' + time + ' with Dr. ' + user.name + '.Your Appointment number is '+ k1 + '. The clinic details are ' + user.clinicname + ', ' + user.cliniccity + ', ' + user.clinicaddr + '. The details of the patient are :- Patient Name - ' + req.body.name + ', Age - ' + req.body.age + ', Phone - ' + req.body.phone + ', Address - ' + req.body.address + '. Please show this SMS at the clinic front-desk and pay the amount before your appointment.',
                                        from: '+12108995132',
                                        alphanumeric_id : "AarogyaHub",
                                        statusCallback: 'http://postb.in/1234abcd',
                                        to: '+91' + req.body.phone
                                    })
                                    .then(message => console.log(message.sid));
                                 
                                }
                                if (patient.email) {
                                    appointmentAlert.newAlert(date, time, req.body.email, user, patient);
                                }
                                client.messages
                                .create({
                                    body: 'CONFIRMED Online Appointment (PAY-ON-CLINIC): The details of the patient are :- Patient Name - ' + req.body.name + ', Age - ' + req.body.age + ', Phone - ' + req.body.phone + ', Address - ' + req.body.address + '. The appointment details are :- Appointment number - '+ k1 + ', Date - ' + date + ', Day - ' + day + ', Time - ' + time + '. Please make sure to ask the online patient to pay the amount and show the appointment success message.',
                                    from: '+12108995132',
                                    alphanumeric_id : "AarogyaHub",
                                    statusCallback: 'http://postb.in/1234abcd',
                                    to: '+91' + user.phone
                                })
                                .then(message => console.log(message.sid));
                             
                            if (user.email) {
                                appointmentAlert.newDoctorAlertPOC(req.body.name,req.body.age,req.body.phone,req.body.address,k1,date,day, time, fee,user.email);
                            }
                            appointmentAlert.adminAlert(req.body.name,req.body.age,req.body.phone,req.body.address,k1,date,day, time, fee,'himalayshankar32@gmail.com',user.name);
                
                
                
                                return res.json({
                                     status:true,
                                     msg:'Seat Booked Successfully',
                                    seat: k1,
                                    date: date,
                                    time:time,
                                    fee:fee,
                                    id:user._id,                      
                                    dname:user.name,
                                    daddress:user.clinicaddr,
                                    ddepartment:user.department,
                                    name: req.body.name,
                                    address: req.body.address,
                                    phone: req.body.phone,
                                    age: req.body.age,
                                gender:req.body.gender
                                });
                
                            }
                    } 
           } 
         
    }

    else
            {
                console.log(req.body.pay)
                return res.status(422).json({
                    status:'false',
                    msg:'Please select the correct payment method.'
                })
            }
}

module.exports.cancelAppointment = async function(req, res) {

    try {
                console.log(req.body)
                let userId = await getUserId(req.headers)
                let user = await User.findById(req.body.did);
                let staff;
                if(user.staff_id){
                staff = await User.findById(user.staff_id);
                }
                let user1 = await User.findOne({phone:userId,type:'Patient',service:'phone'});

                       let n1 = await User.updateOne({ "_id" : user1._id, "doctors.payment_id": req.body.payment_id }, {
                            '$set': {
                                
                                'doctors.$.cancel': true
                                
                            }
                        });
                        let n2 = await User.updateOne({ "_id" : user._id, "patients.payment_id": req.body.payment_id  }, {
                            '$set': {
                                
                                'patients.$.cancel': true
                                
                            }
                        });
                        if(staff)
                        {
                        let n3 = await User.updateOne({ "_id" : user.staff_id, "booking.payment_id": req.body.payment_id  }, {
                            '$set': {
                                
                                'booking.$.cancel': true
                                
                            }
                        });
                    }
                        if(typeof(user.schedule_time[req.body.dayindex].start) == 'object')
                        {
                            let available1 = [];
                            let k = req.body.slotindex;
                            let id = user.schedule_time[req.body.dayindex]._id;

                            let j = user.schedule_time[req.body.dayindex].available;
                            var a2 = parseInt(user.schedule_time[req.body.dayindex].available[req.body.slotindex]);
                            console.log(a2);
                            for(var temp =0;temp<user.schedule_time[req.body.dayindex].start.length;temp++)
                                {
                                    if(temp == k)
                                    {
                                        available1.push(a2+1);
                                        continue;
                                    }
                                    var temp1 = parseInt(j[temp]);
                                    available1.push(temp1);
                                }
                            let day = await User.updateOne({ 'schedule_time._id': id }, {
                                '$set': {
                                    
                                    'schedule_time.$.available': available1
                                    
                                }
                            });
                            // user.schedule_time[0].available[0] = 5;
                            user.save();
                        }
                        else{
                            var a1 = parseInt(user.schedule_time[req.body.dayindex].available);
                            
                            user.schedule_time[req.body.dayindex].available= a1 + 1 ;
                            user.save();

                        }
                        user1.notification.push({
                            type:'appointment-cancel',
                            message:'Your cancelled the appointment with Dr. '+ user.name +' on '+ req.body.date +' at '+ req.body.time ,
                            flag:true,
                            did:req.body.id
                        });
                        
                        
                        user1.save();
                        
                        client.messages
                        .create({
                            body: 'Looks like you had to cancel your Appointment for '+ req.body.date +' at '+ req.body.time + ' with Dr. ' + user.name+ ' at ' +user.clinicname+ ', ' +user.cliniccity+ ', '  +user.clinicaddr+ '. If you want to book another appointment, please visit https://aarogyahub.com/doctors',
                            from: '+12019755459',
                            statusCallback: 'http://postb.in/1234abcd',
                            to: '+91'+req.body.phone
                        })
                        .then(message => console.log(message.sid));
                        appointmentCancelAlert.newAlert(req.body.date,req.body.time,req.body.email,user,user1);
                        
                        return res.render('refund',{
                            title:'Refund',
                            doctor:user,
                            slotindex:req.body.slotindex,
                            dayindex:req.body.dayindex
                        });
                
    
}catch (err) {
        console.log('Error', err);
        return;
    }
}

module.exports.refund = async function(req, res) {

    try {
                let user = await User.findById(req.body.did);
                let staff = await User.findById(user.staff_id);
                let userId = await getUserId(req.headers)
                console.log(userId)
                let user1 = await User.findOne({phone:userId,type:'Patient',service:'phone'});

                if(req.body.mode == 'online')
                {
                    const razorpay1 = new Razorpay({
                        key_id: env.razorpay_key_id,
                        key_secret: env.razorpay_key_secret
                        
                    });
                    var refund_amount = req.body.fee - 50 ;
                    const response = await razorpay1.payments.refund(req.body.payid,  
                        {
                            amount : refund_amount*100,
                            speed : 'optimum',
                            reverse_all : 1
                        });

                    if(response.id && response.payment_id)
                    {
                       let n1 = await User.updateOne({ "_id" : user1._id, "doctors.payment_id": req.body.payid }, {
                            '$set': {
                                
                                'doctors.$.cancel': true
                                
                            }
                        });
                        let n2 = await User.updateOne({ "_id" : req.body.did, "patients.payment_id": req.body.payid }, {
                            '$set': {
                                
                                'patients.$.cancel': true
                                
                            }
                        });

                        if(staff){
                        let n3 = await User.updateOne({ "_id" : user.staff_id, "booking.payment_id": req.body.payid }, {
                            '$set': {
                                
                                'booking.$.cancel': true
                                
                            }
                        });
                    }
                        if(typeof(user.schedule_time[req.body.dayindex].start) == 'object')
                        {
                            let available1 = [];
                            let k = req.body.slotindex;
                            let id = user.schedule_time[req.body.dayindex]._id;

                            let j = user.schedule_time[req.body.dayindex].available;
                            var a2 = parseInt(user.schedule_time[req.body.dayindex].available[req.body.slotindex]);
                            console.log(a2);
                            for(var temp =0;temp<user.schedule_time[req.body.dayindex].start.length;temp++)
                                {
                                    if(temp == k)
                                    {
                                        available1.push(a2+1);
                                        continue;
                                    }
                                    var temp1 = parseInt(j[temp]);
                                    available1.push(temp1);
                                }
                            let day = await User.updateOne({ 'schedule_time._id': id }, {
                                '$set': {
                                    
                                    'schedule_time.$.available': available1
                                    
                                }
                            });
                            // user.schedule_time[0].available[0] = 5;
                            user.save();
                        }
                        else{
                            var a1 = parseInt(user.schedule_time[req.body.dayindex].available);
                            
                            user.schedule_time[req.body.dayindex].available= a1 + 1 ;
                            user.save();

                        }
                        user1.notification.push({
                            type:'appointment-cancel',
                            message:'Your cancelled the appointment with Dr. '+ user.name +' on '+ req.body.date +' at '+ req.body.time ,
                            flag:true,
                            did:req.body.did
                        });
                        
                        
                        user1.save();
                        
                        // client.messages 
                        // .create({ 
                        //     body: 'Looks like you had to cancel your Appointment for '+ req.query.date +' at '+ req.query.time + ' with Dr. ' + user.name+ ' at ' +user.clinicname+ ', ' +user.cliniccity+ ', '  +user.clinicaddr+ ', Ph: +91' +user.phone+ '. If you want to book another appointment, please visit http://doccure.com.',
                        //     from: 'whatsapp:+14155238886',       
                        //     to: 'whatsapp:+91'+req.query.phone 
                        // }) 
                        // .then(message => console.log(message.sid)) 
                        // .done();

                        if(staff)
                        {
                        client.messages
                        .create({
                            body: 'Looks like you had to cancel your Appointment for '+ req.body.date +' at '+ req.body.time + ' with Dr. ' + user.name+ ' at ' +user.clinicname+ ', ' +user.cliniccity+ ', '  +user.clinicaddr+ ', Ph: +91' +staff.phone+ '. If you want to book another appointment, please visit https://aarogyahub.com/doctors',
                            from: '+12019755459',
                            statusCallback: 'http://postb.in/1234abcd',
                            to: '+91'+req.body.phone
                        })
                        .then(message => console.log(message.sid));
                    }
                    else{
                        client.messages
                        .create({
                            body: 'Looks like you had to cancel your Appointment for '+ req.body.date +' at '+ req.body.time + ' with Dr. ' + user.name+ ' at ' +user.clinicname+ ', ' +user.cliniccity+ ', '  +user.clinicaddr+  '. If you want to book another appointment, please visit https://aarogyahub.com/doctors',
                            from: '+12019755459',
                            statusCallback: 'http://postb.in/1234abcd',
                            to: '+91'+req.body.phone
                        })
                        .then(message => console.log(message.sid));
                    }
                        appointmentCancelAlert.newAlert(req.body.date,req.body.time,req.body.email,user,user1);
                        
                        return res.json({
                            status:true,
                            msg:'Appointment cancelled successfully',
                            doctor:{
                                id:user._id,
                                name:user.name,
                                dept:user.department,
                                clinicname:user.clinicname
                            },
                            date:req.body.date,
                            time:req.body.time
                        });
    } 
}else{
    
    let n1 = await User.updateOne({ "_id" : user1._id, "doctors.payment_id": req.body.payid }, {
        '$set': {
            
            'doctors.$.cancel': true
            
        }
    });
    let n2 = await User.updateOne({ "_id" : req.body.did, "patients.payment_id": req.body.payid }, {
        '$set': {
            
            'patients.$.cancel': true
            
        }
    });
    if(staff)
    {
    let n3 = await User.updateOne({ "_id" : user.staff_id, "booking.payment_id": req.body.payid }, {
        '$set': {
            
            'booking.$.cancel': true
            
        }
    });
}
    if(typeof(user.schedule_time[req.body.dayindex].start) == 'object')
    {
        let available1 = [];
        let k = req.body.slotindex;
        let id = user.schedule_time[req.body.dayindex]._id;

        let j = user.schedule_time[req.body.dayindex].available;
        var a2 = parseInt(user.schedule_time[req.body.dayindex].available[req.body.slotindex]);
        console.log(a2);
        for(var temp =0;temp<user.schedule_time[req.body.dayindex].start.length;temp++)
            {
                if(temp == k)
                {
                    available1.push(a2+1);
                    continue;
                }
                var temp1 = parseInt(j[temp]);
                available1.push(temp1);
            }
        let day = await User.updateOne({ 'schedule_time._id': id }, {
            '$set': {
                
                'schedule_time.$.available': available1
                
            }
        });
        // user.schedule_time[0].available[0] = 5;
        user.save();
    }
    else{
        var a1 = parseInt(user.schedule_time[req.body.dayindex].available);
        
        user.schedule_time[req.body.dayindex].available= a1 + 1 ;
        user.save();

    }
    // user1.notification.push({
    //     type:'appointment-cancel',
    //     message:'Your cancelled the appointment with Dr. '+ user.name +' on '+ req.body.date +' at '+ req.body.time ,
    //     flag:true,
    //     did:req.body.did
    // });
    
    
    user1.save();
    
    
    client.messages
    .create({
        body: 'Looks like you had to cancel your Appointment for '+ req.body.date +' at '+ req.body.time + ' with Dr. ' + user.name+ ' at ' +user.clinicname+ ', ' +user.cliniccity+ ', '  +user.clinicaddr+ '. If you want to book another appointment, please visit https://aarogyahub.com/doctors',
        from: '+12019755459',
        statusCallback: 'http://postb.in/1234abcd',
        to: '+91'+req.body.phone
    })
    .then(message => console.log(message.sid));
    if(req.body.email){
    appointmentCancelAlert.newAlert(req.body.date,req.body.time,req.body.email,user,user1);
    }
    
    return res.json({
        status:true,
        msg:'Appointment cancelled successfully',
        doctor:{
            id:user._id,
            name:user.name,
            dept:user.department,
            clinicname:user.clinicname
        },
        date:req.body.date,
        time:req.body.time
    });
}
}catch (err) {
        console.log('Error', err);
        return res.status(400).json({
            status:false,
            code: err.error.code,
            description: err.error.description,
        })
       
    }
}

module.exports.allTests = async(req, res) => {
    let tests = await Test.find({})
    let labs = await User.find({type:'Diagonistic'});

    return res.json({
        status:true,
        labs:labs,
        tests:tests
    })

}

// module.exports.deleteAccount = async(req, res) => {
//     let userId = await getUserId(req.headers)
//     if(userId){
//         let user = await User.findOne({service:'phone',phone:userId});  
//     console.log(req.body);
//     Feedback.create({
//         delete_value: req.body.delete,
//         description: req.body.del_description,
//         did:user.id
//     });
   
//     if(user.type == 'Patient')
//     {
        
//     }

//     return res.redirect('/');
// }
// }















