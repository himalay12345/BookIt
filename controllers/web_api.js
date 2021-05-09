const config = require('../config/twilio');
const User = require('../models/user');
const client = require('twilio')(config.accountSID, config.authToken);
const Test = require('../models/test');
const Consult = require('../models/consult');
const bcrypt = require('bcrypt')
const fs = require('fs');
const path = require('path');
const shortid = require('shortid');
const emailVerification = require('../mailers/email-verify');

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
                        msg:'Otp Sent To Registered Phone'
                    })
                });
            }

            else{
                res.header("Access-Control-Allow-Origin", "true");
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
                        msg:'Otp Sent To Registered Phone'
                    })
                });
            }

            else{
                res.header("Access-Control-Allow-Origin", "true");
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


module.exports.verify2FactorOtp = async(req, res) => {
  
    let user = await User.findOne({phone:req.body.phone,service:'phone'})
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
           status:true
       })

    } else {
        return res.json({
            status:false
        })

    }
}

module.exports.profileSettings = async function(req, res) {

    try {

        console.log(req)
        let user = await User.findById(req.user.id);
        if(user)
        {
        return res.json({
            status:'true',
            name:user.name,
            avatar:user.avatar,
            gender:user.gender,
            dob:user.dob,
            bloodgroup:user.bloodgroup,
            email:user.email,
            phone:user.phone,
            contact_address:user.contacts

        })
    }else{
        return res.json({
        status:'false'
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
    let user = await User.findById(req.user.id);
    if(user)
    {
    return res.json({
        status:'true',
        appointments:user.doctors
    })
}
else{
    return res.json({
        status:'false'
    })
}
}

module.exports.myBillings = async(req, res) => {
    let user = await User.findById(req.user.id);
    if(user)
    {
    return res.json({
        status:'true',
        billings:user.doctors
    })
}
else{
    return res.json({
        status:'false'
    })
}
}

module.exports.myFavourites = async(req, res) => {
    let user = await User.findById(req.user.id);
    if(user)
    {
    return res.json({
        status:'true',
        favourites:user.favourites
    })
}
else{
    return res.json({
        status:'false'
    })
}
}

module.exports.changePassword = async(req, res) => {
    let user = await User.findOne({ phone: req.body.phone, service:'phone' });

    let isEqual;
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
                status:'false',
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
          status:'true',
          msg:'Password Changed'
      })
    }
    else{
        return res.json({
            status:'false',
            msg:'Wrong Old Password!'
        })
        
       
    }

  
}












