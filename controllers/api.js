const User = require('../models/user');
const Test = require('../models/test');
const Consult = require('../models/consult');
const Specialities = require('../models/specialities')
const jwt = require('jsonwebtoken');
const config = require('../config/twilio');
const client = require('twilio')(config.accountSID, config.authToken);
const appointmentAlert = require('../mailers/appointment-alert');
const Razorpay = require('razorpay');
const env = require('../config/environment');
const shortid = require('shortid');
const appointmentCancelAlert = require('../mailers/appointment-cancel');
const bcrypt = require('bcrypt')

// -------------------------------------------
// User Sign Up Process Start
// -------------------------------------------

function generateAccessToken(user)
{
    return jwt.sign(user,'123456')
}


module.exports.resendOtp = async function(req, res) {

    if(!req.body.phone)
    { return  res.status(403).json({
        status:false,
        msg:'Please enter the phone number'
    })
    }
    
    if(!req.body.service)
    { return  res.status(403).json({
        status:false,
        msg:'Please enter the service'
    })
    }
    
    if(req.body.phone.length>10 || req.body.phone.length <10)
    {
        return  res.status(403).json({
            status:false,
            msg:'Please enter 10 digit mobile number'
        })
    }

    let user = await User.findOne({phone:req.body.phone,service:'phone',type:'Patient'})
    if(user)
    {
        return  res.status(403).json({
            status:false,
            msg:'User Already Exists'
        })
    }
    else{
        client
        .verify
        .services(config.serviceID)
        .verifications
        .create({
            to: `+91${req.body.phone}`,
            channel: req.body.service
        }).then((data) => {
           if(data)
           {
           res.json({
               status:true,
               msg:'Otp sent Successfully'
           })
        }
        else{
            return  res.status(403).json({
                status:false,
                msg:'Otp not sent'
            })
        }
        });
    }
    
        

    
}

module.exports.verifyOtp = async function(req, res) {
try{
    if(!req.body.phone)
    { return  res.status(403).json({
        status:false,
        msg:'Please enter the phone number'
    })
    }
    if(!req.body.otp)
    { return  res.status(403).json({
        status:false,
        msg:'Please enter the otp'
    })
    }
    if(req.body.phone.length>10 || req.body.phone.length <10)
    {
        return  res.status(403).json({
            status:false,
            msg:'Please enter 10 digit mobile number'
        })
    }
        let data = await client
            .verify
            .services(config.serviceID)
            .verificationChecks
            .create({
                to: `+91${req.body.phone}`,
                code: req.body.otp
            });
        
    
    
        if (data.status == 'approved') {
            res.json({
                status:true,
                msg:'Otp Verified Successfully'
            })
    
        } else {
            return  res.status(403).json({
                status:false,
                msg:'Otp Not Verified'
            })
    
        }

    }
    catch(err)
    {
        console.log('error',err)
         res.status(404).json({
        status:false,
        msg:'Otp expired'
    })
    }
    

}

module.exports.checkAuthentication = async function(req, res) {

    try{
        if(!req.body.phone)
            { return  res.status(403).json({
                status:false,
                msg:'Please enter the phone number'
            })
    }
    let user = await User.findOne({phone:req.body.phone,service:'phone',type:'Patient'})
    if(user)
    {
        res.json({
            status:true,
            hasAccount:true
        })
    }
    
    else{
        if(req.body.phone.length>10 || req.body.phone.length < 10)
        {
            return  res.status(403).json({
                status:false,
                msg:'Enter a 10 digit phone number'
            })
        }
    
      
    
            client
            .verify
            .services(config.serviceID)
            .verifications
            .create({
                to: `+91${req.body.phone}`,
                channel: 'sms'
            }).then((data) => {
               if(data)
               {
               res.json({
                   status:true,
                   hasAccount:false,
                   msg:'Otp sent Successfully'
               })
            }
            else{
                return  res.status(403).json({
                    status:false,
                    msg:'Otp Not sent'
                })
            }
            });
        
        
            
    }
    }
    catch(error)
    {
        res.status(404).json({
            status:false,
            msg:'Otp Not sent'
        })
    }
}
    
module.exports.createUserAccount = async function(req, res) {

    if(!req.body.name)
    {
        return  res.status(403).json({
            status:false,
            msg:'Please enter the name'
        })
    }
     
    if(!req.body.phone)
    {
        return  res.status(403).json({
            status:false,
            msg:'Please enter the phone number'
        })
    }
    if(!req.body.password)
    {
        return  res.status(403).json({
            status:false,
            msg:'Please enter the password'
        })
    }
    if(!req.body.cpassword)
    {
        return  res.status(403).json({
            status:false,
            msg:'Please enter the confirm password'
        })
    }
    if(!req.body.authkey)
    { return  res.status(403).json({
        status:false,
        msg:'Please enter the authkey'
    })
        
    }
    
            if(req.body.password != req.body.cpassword)
            {
                return  res.status(403).json({
                    status:false,
                    msg:'Password Do Not Match',
                    password:'mismatch'
                })
            }
    
            else{
                
                let user1 = await User.findOne({
                    phone:req.body.phone,
                    service:'phone',
                    type:'Patient'
                })
    
                if(user1)
                {
                    
                    return  res.status(403).json({
                        status:false,
                        msg:'User Already Exists'
                    })
                }
                if(req.body.authkey != process.env.authkey || !req.body.authkey)
               {
                return  res.status(403).json({
                        status:false,
                        msg:'Not verified User'
                    })
                
                }
                else{
                    let hashedPass = await bcrypt.hash(req.body.password,10)
                    let user = await User.create({
                        name: req.body.name,
                        phone: req.body.phone,
                        email:req.body.email,
                        password: hashedPass, 
                        encrypt:true,    
                        service: 'phone',
                        type: 'Patient'
                    });
    
                    const user1 = {
                        username:user.phone
                    }
                    const accessToken = generateAccessToken(user1);
                
                   
                   res.json({
                       accessToken:accessToken,
                       status:true,
                       msg:'Account Created Successfully',
                       user:user
                       
                   })
                }
            
        }
        
    }

module.exports.login = async function(req, res) {

    if(!req.body.phone)
    { return  res.status(403).json({
        status:false,
        msg:'Please enter the phone number'
    })
    }
    if(!req.body.password)
    { return  res.status(403).json({
        status:false,
        msg:'Please enter the password'
    })
    }
    
        if(req.body.phone.length > 10 || req.body.phone.length < 10){
            return  res.status(403).json({
                status:false,
                msg:'Enter a 10 digit phone number'
            })
        }
        let user = await User.findOne({phone:req.body.phone,service:'phone',type:'Patient'}) 
        if( user && user.encrypt)
        {
            const users = {
                username:user.phone
            }
            const accessToken = generateAccessToken(users);
            let isEqual = await bcrypt.compare(req.body.password,user.password)
           
            if(isEqual){
                return res.json({
                    accessToken:accessToken,
                    user:user
                    
                })
            }
            else{
                res.status(403).json({
                    status:false,
                    msg:'Invalid Username/Password'
                })
            }
        }
    
        else{
    
        if (!user || user.password != req.body.password) {
            res.status(403).json({
                status:false,
                msg:'Invalid Username/Password'
            })
        }

        else{
            const users = {
                username:user.phone
            }
            const accessToken = generateAccessToken(users);
        return res.json({
            accessToken:accessToken,
            user:user
            
        })
    }
    }
      
    
    }

module.exports.forgotSendOtp = async(req,res) => {
    if(!req.body.phone)
    {
        return res.status(403).json({
            status:false,
            msg:'Please enter a phone number'
        })
    }

    if(!req.body.service)
    {
        return res.status(403).json({
            status:false,
            msg:'Please enter the service'
        })
    }
    if(req.body.phone.length>10 || req.body.phone.length<10)
    {
        return res.status(403).json({
            status:false,
            msg:'Please enter a 10 digit phone number'
        })
    }
    
    let user = await User.findOne({ phone: req.body.phone, service: 'phone',type:'Patient' });

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
                return res.json({
                    status:true,
                    msg:'Otp Sent Successfully'
                    })
            });

    }
}

module.exports.resetPassword = async(req, res) => {

    if (!req.body.password) {
        return res.status(403).json({
            msg:'Please enter a password',
            status:false
        })
    }
    if (!req.body.phone) {
        return res.status(403).json({
            msg:'Please enter a phone number',
            status:false
        })
    }
    if (!req.body.confirm) {
        return res.status(403).json({
            msg:'Please enter a Confirm Password',
            status:false
        })
    }
    
    if (req.body.password != req.body.confirm) {
        return res.json({
            msg:'Password Mismatch',
            status:false,
            phone: req.body.phone
        })
    }

        let user = await User.findOne({ phone: req.body.phone , type:'Patient', service:'phone',type:'Patient'});

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

// -------------------------------------------
// User Sign Up Process Start
// -------------------------------------------



module.exports.doctorProfile = async (req, res) => {
    let i = await User.findById(req.body.id);
 
    let avgrating = 0,cnt=0;
       for(j of i.reviews)
       {
        avgrating = avgrating+j.rating;
        cnt++;
       }
       let rating = 0;
       if(i.reviews.length > 0)
       {
        rating = parseInt(avgrating/cnt);
       }
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
                maxcount:parseInt(u.max_count),
                available:parseInt(u.available),
                booked:parseInt(u.booked)
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
                    maxcount:parseInt(u.max_count[i]),
                    available:parseInt(u.available[i]),
                    booked:parseInt(u.booked[i])
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
    let experience = 0;
       if(i.wexperience != null)
       {
           experience = i.wexperience;
       }
    return res.json({
        status:true,
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
            wexperience:experience,
            awards:i.awards,
           clinicname:i.clinicname,
           clinicaddr:i.clinicaddr,
           schedule_time:scheduletime,
            staff_flag:true,
            reviews:i.reviews,
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
    

       let scheduletime = [];

for(let u of i.schedule_time)
{
    let slots = [];
    let day;
    let reset_flag ;
    let alt_flag;
    let bookingover;
    console.log(u,typeof(u.start))
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
        bookingover = u.booking_over

        scheduletime.push({
            day:day,
           slots:slots,
            reset_flag:reset_flag,
            alt_flag:alt_flag,
            booking_over:bookingover
        })
    }

    if(typeof(u.start) == 'object')
    {
        console.log(typeof(u.start))
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
            day:day,
            slots:slots,
            reset_flag:reset_flag,
            alt_flag:alt_flag,
            booking_over:bookingover
        })
    }
   
}

    res.json({
        status:true,
        avatar: i.avatar,
            name: i.name,
            department: i.department,
            contacts:i.contacts,
            fee:i.booking_fee,
            id: i.id,
            schedule_time:scheduletime,
            staff_flag:true,
            ratings:rating,
            rating_count:cnt,
            premium:i.premium
    });
}


module.exports.home = async (req, res) => {
    let specialities = await Specialities.find({});
    let doctor = await User.find({ type: "Doctor", approve1: true, approve2: true, booking_service: true });
    let data = [];
    let doctors = [];
    
    for (i of doctor) {
        
        doctors.push( {
            name: i.name,
            id: i.id,
            department: i.department,
            avatar: i.avatar,
            fee:i.booking_fee,
            contacts:i.contacts
        });
    }

    let consults = await Consult.find({});
    let tests = await Test.find({});
    let urls = [ 'http://107.21.15.88:4000/img/1.png', 'http://107.21.15.88:4000/img/2.png', 'http://107.21.15.88:4000/img/3.png' ]
  
   

    res.json({
        imgSlider:urls,
        specialities:specialities,
        doctors:doctors
    });
}

module.exports.specialist = async (req, res) => {
    let doctor = await User.find({ type: "Doctor", approve1: true, approve2: true, booking_service: true ,department:req.body.id});
 
    let doctors = [];
  
    for (i of doctor) {
    let avgrating = 0,cnt=0;
       for(j of i.reviews)
       {
        avgrating = avgrating+j.rating;
        cnt++;
       }
       let rating = 0;
       if(i.reviews.length > 0)
       {
        rating = parseInt(avgrating/cnt);
       }
       let specialisations;
       let specialisation;
       let specfirst = '';
       let experience = '';
       
       if(i.wexperience != null)
       {
           experience = i.wexperience;
       }
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
        doctors.push( {
            name: i.name,
            experience:experience,
            department: i.department,
            education:education,
            specialist:specfirst,
            fee:i.booking_fee,
            clinicaddr:i.clinicaddr,
            clinicname:i.clinicname,
            id: i.id,
            staff_flag:true,
            avatar: i.avatar,
            ratings:rating,
            rating_count:cnt
        });
    }

   

    res.json({
        status:'true',
        doctors:doctors
    });
}

module.exports.doctors = async (req, res) => {

    let doctor = await User.find({ type: "Doctor", approve1: true, approve2: true, booking_service: true });
 
    let doctors = [];
  
    for (i of doctor) {
    let avgrating = 0,cnt=0;
       for(j of i.reviews)
       {
        avgrating = avgrating+j.rating;
        cnt++;
       }
       let rating = 0;
       if(i.reviews.length > 0)
       {
        rating = parseInt(avgrating/cnt);
       }
       let experience = 0;
       if(i.wexperience != null)
       {
           experience = i.wexperience;
       }
       let specialisations;
       let specialisation;
       let specfirst = '';
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
        doctors.push( {
            name: i.name,
            experience:experience,
            department: i.department,
            education:education,
            specialist:specfirst,
            fee:i.booking_fee,
            clinicaddr:i.clinicaddr,
            clinicname:i.clinicname,
            id: i.id,
            staff_flag:true,
            avatar: i.avatar,
            ratings:rating,
            rating_count:cnt
        });
    }

   

    res.json({
        status:'true',
        doctors:doctors
    });
}


module.exports.checkout = async (req, res) => {
    console.log(req.body)
    let doctor = await User.findOne({ _id: req.body.did, booking_service: true });
    if (!doctor) {
        return res.json({
           status:'false',
           msg:'Doctor not available'
        })
    }

    let user1 = await User.findById(doctor.staff_id);
    var today = new Date();
    // today.setDate(today.getDate() - 1)
    var dd = String(today.getDate()).padStart(2, '0');
    var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
    var yyyy = today.getFullYear();
    var weekday = new Array('Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday');
    var dayOfWeek = weekday[today.getDay()].toUpperCase();
    console.log(dayOfWeek);
    var str = dd + '-' + mm + '-' + yyyy;

    console.log(str)

    if (user1) {
        for (temp of doctor.schedule_time) {
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
                    temp.booking_over = [];

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
                    temp.booking_over = [];
                    temp.reset_flag = false;
                    temp.alt_flag = false;
                }

            }
        }
    } else {
        for (temp of doctor.schedule_time) {
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

                for (temp1 of doctor.patients) {
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
                    temp.booking_over = [];

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
                    temp.booking_over = [];
                    temp.reset_flag = false;
                    temp.alt_flag = false;
                }

            }
        }
    }

    doctor.save();
// -----------------------------------------
var userId;
        if (req.headers && req.headers.authorization) {
            
            var authorization = req.headers.authorization.split(' ')[1];
           
           
              var decoded = jwt.verify(authorization, '123456');
            userId = decoded.username;
        }
        let patient_data = await User.findOne({phone:userId,type:'Patient',service:'phone'});
        let patient_data_address = patient_data.contacts.address;
        let patient_data_age = patient_data.age;
        
    let user = await User.findById(req.body.did);
    let time;
    if(typeof(user.schedule_time[req.body.dayindex].start) == 'string'){
        time = user.schedule_time[req.body.dayindex].start;
    }

    if(typeof(user.schedule_time[req.body.dayindex].start) == 'object'){
        time = user.schedule_time[req.body.dayindex].start[req.body.slotindex];
    }
   
    let date = req.body.date;
    let day = user.schedule_time[req.body.dayindex].day;
    let fee = user.booking_fee;
    let account_id = user.accountid;
    let percantage_fee = parseInt(user.booking_fee) - parseInt(user.booking_fee)*0.04;
    let name = user.name;
    let contacts = user.contacts;
    let avgrating = 0,cnt=0;
    for(j of user.reviews)
    {
     avgrating = avgrating+j.rating;
     cnt++;
    }
    let rating = 0;
       if(user.reviews.length > 0)
       {
        rating = parseInt(avgrating/cnt);
       }

    if(user.poc)
    {
        return res.json({
            status:'true',
            poc:'true',
            msg:'Display Both Option Pay on clinic and pay online',
            doctor:{
                name:name,
                reviews:user.reviews,
                ratings:rating,
                rating_count:cnt,
                contacts:contacts,
                date:date,
                time:time,
                day:day,
                fee:fee
            },
            slotindex:req.body.slotindex,
            dayindex:req.body.dayindex,
            id:req.body.id,
            did:req.body.did,
            accountid:account_id,
            percantage_fee:percantage_fee,
            user:{
                name:patient_data.name,
                address:patient_data_address,
                age:patient_data_age,
                phone:patient_data.phone

            }
    
        })
    }

    else{
        return res.json({
            status:'false',
            poc:'false',
            msg:'Display only Pay online',
            doctor:{
                name:name,
                reviews:user.reviews,
                ratings:rating,
                rating_count:cnt,
                contacts:contacts,
                date:date,
                time:time,
                day:day,
                fee:fee
            },
            slotindex:req.body.slotindex,
            dayindex:req.body.dayindex,
            id:req.body.id,
            did:req.body.did,
            accountid:account_id,
            percantage_fee:percantage_fee,
            user:{
                name:patient_data.name,
                address:patient_data_address,
                age:patient_data_age,
                phone:patient_data.phone

            }
    
        })
    }
   


   
}

module.exports.selectPayment = async function(req, res) {

    try{
        let user = await User.findById(req.body.did);
        let user1 = await User.findById(req.user.id);
        if(user.poc)
        {
            let time;
            if(typeof(user.schedule_time[req.body.dayindex].start) == 'string'){
                time = user.schedule_time[req.body.dayindex].start;
            }
        
            if(typeof(user.schedule_time[req.body.dayindex].start) == 'object'){
                time = user.schedule_time[req.body.dayindex].start[0];
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
        return res.json({
            status:'true',
            doctor:{
                name:name,
                reviews:user.reviews,
                ratings:rating,
                rating_count:cnt,
                contacts:contacts,
                date:date,
                time:time,
                day:day,
                fee:fee
            },
            slotindex: req.body.slotindex,
            dayindex: req.body.dayindex,
            id: req.body.id,
            did: req.body.did,
            type: req.body.type,
            date: date,
            name:req.body.name,
            phone:req.body.phone,
            age:req.body.age,
            gender:req.body.gender,
            address:req.body.address,   
        })
    }else{
        return res.json({
            status:'false',
        })
    }
    } catch (err) {
        console.log('Error', err);
    }

}


module.exports.confirmBooking = async function(req, res) {

    try{
        console.log(req.body)
        if(req.body.pay == 'online'){
            let doctor = await User.findById(req.body.doctorid);
                const razorpay = new Razorpay({
                    key_id: env.razorpay_key_id,
                    key_secret: env.razorpay_key_secret
                
            });

          


            const payment_capture = 1;
            const amount = doctor.booking_fee;
            const currency = 'INR';
            var notes;
            if (req.body.type == 'own') {
                notes = {
                    patient_name: req.body.name,
                    patient_age:req.body.age,
                    patient_gender:req.body.gender,
                    patient_phone:req.body.phone,
                    patient_address:req.body.address
                }
            }
            if (req.body.type == 'other') {
                notes = {
                    patient_name: req.body.pname,
                    patient_age:req.body.page,
                    patient_phone:req.body.pphone,
                    patient_address:req.body.paddress,
                    patient_gender:req.body.pgender
                }
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

        let user = await User.findById(req.user.id);
console.log(response);

        if (req.body.type == 'own') {
            user.name = req.body.name;
            user.phone = req.body.phone;
            user.age = req.body.age;
            user.gender = req.body.gender;
            user.contacts.address = req.body.address;
        }

        if (req.body.type == 'other') {
            user.others.push({
                name: req.body.pname,
                email: req.body.pemail,
                phone: req.body.pphone,
                address: req.body.paddress,
                age: req.body.page,
                gender:req.body.pgender

            });
        }

        user.refresh_flag = true;
        user.save();


        return res.render('pay', {
            title: 'Payment',
            response: response,
            amount: response.amount,
            orderid: response.id,
            currency: response.currency,
            booked: req.body.booked,
            available: req.body.available,
            slotindex: req.body.slotindex,
            dayindex: req.body.dayindex,
            id: req.body.id,
            doctor: doctor,
            type: req.body.type,
            user: user,
            date: req.body.date

        })
        }
        
        if(req.body.pay == 'offline'){

        let user = await User.findById(req.body.did);
        
        var userId;
        if (req.headers && req.headers.authorization) {
            
            var authorization = req.headers.authorization.split(' ')[1];
           
           
              var decoded = jwt.verify(authorization, '123456');
            userId = decoded.username;
        }
        console.log(userId)
        let patient = await User.findOne({phone:userId,type:'Patient',service:'phone'});
        console.log(userId,patient)
        if (req.body.type == 'own') {
            patient.name = req.body.name;
            // patient.phone = req.body.phone;
            patient.age = req.body.age;
            patient.gender = req.body.gender;
            patient.contacts.address = req.body.address;
        }
        if (req.body.type == 'other') {
            patient.others.push({
                name: req.body.name,
                email: req.body.email,
                phone: req.body.phone,
                address: req.body.address,
                age: req.body.age,
                gender:req.body.gender

            });
        }

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
                        if (req.body.email) {
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
                        if(staff)
                        {
                        client.messages
                        .create({
                            body: 'CONFIRMED Online Appointment (PAY-ON-CLINIC): The details of the patient are :- Patient Name - ' + req.body.name + ', Age - ' + req.body.age + ', Phone - ' + req.body.phone + ', Address - ' + req.body.address + '. The appointment details are :- Appointment number - '+ b + ', Date - ' + date + ', Day - ' + day + ', Time - ' + time + '. Please make sure to ask the online patient to pay the amount and show the appointment success message.',
                            from: '+12108995132',
                            alphanumeric_id : "AarogyaHub",
                            statusCallback: 'http://postb.in/1234abcd',
                            to: '+91' + staff.phone
                        })
                        .then(message => console.log(message.sid));
                    }
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
                            doctor:{
                                name:user.name,
                                address:user.clinicaddr,
                                department:user.department
                            },
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
                        if (req.body.email) {
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
                        if(staff){
                        client.messages
                        .create({
                            body: 'CONFIRMED Online Appointment (PAY-ON-CLINIC): The details of the patient are :- Patient Name - ' + req.body.name + ', Age - ' + req.body.age + ', Phone - ' + req.body.phone + ', Address - ' + req.body.address + '. The appointment details are :- Appointment number - '+ k1 + ', Date - ' + date + ', Day - ' + day + ', Time - ' + time + '. Please make sure to ask the online patient to pay the amount and show the appointment success message.',
                            from: '+12108995132',
                            alphanumeric_id : "AarogyaHub",
                            statusCallback: 'http://postb.in/1234abcd',
                            to: '+91' + staff.phone
                        })
                        .then(message => console.log(message.sid));
                    }
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
                            doctor:{
                                name:user.name,
                                address:user.clinicaddr,
                                department:user.department
                            },
                            name: req.body.name,
                            address: req.body.address,
                            phone: req.body.phone,
                            age: req.body.age,
                        gender:req.body.gender
                        });
        
                    }
            } 
            
        }

        if(!req.body.pay)
        {
            return res.status(422).json({
                status:'false',
                msg:'Please select the payment method.'
            })
        }
    } catch (err) {
        console.log('Error', err);
    }

}

module.exports.orderValidation = async function(req, res){
    // console.log(req.body);
    if(!req.body.pay)
    {
        return res.status(422).json({
            status:'false',
            msg:'Please select the payment method.'
        })
    }


    if(req.body.pay == 'online')
    {
        if(req.body.orderid && req.body.payid)
        {
                let user = await User.findById(req.body.did);
                
                var userId;
                if (req.headers && req.headers.authorization) {
                    
                    var authorization = req.headers.authorization.split(' ')[1];
                   
                   
                      var decoded = jwt.verify(authorization, '123456');
                    userId = decoded.username;
                }
               
                let patient = await User.findOne({phone:userId,type:'Patient',service:'phone'});
   
                if (req.body.type == 'own') {
                    patient.name = req.body.name;
                    // patient.phone = req.body.phone;
                    patient.age = req.body.age;
                    patient.gender = req.body.gender;
                    patient.contacts.address = req.body.address;
                }
                if (req.body.type == 'other') {
                    patient.others.push({
                        name: req.body.name,
                        email: req.body.email,
                        phone: req.body.phone,
                        address: req.body.address,
                        age: req.body.age,
                        gender:req.body.gender
        
                    });
                }
        
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
                                if (req.body.email) {
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
                                if(staff)
                                {
                                client.messages
                                .create({
                                    body: 'CONFIRMED Online Appointment (PAY-ON-CLINIC): The details of the patient are :- Patient Name - ' + req.body.name + ', Age - ' + req.body.age + ', Phone - ' + req.body.phone + ', Address - ' + req.body.address + '. The appointment details are :- Appointment number - '+ b + ', Date - ' + date + ', Day - ' + day + ', Time - ' + time + '. Please make sure to ask the online patient to pay the amount and show the appointment success message.',
                                    from: '+12108995132',
                                    alphanumeric_id : "AarogyaHub",
                                    statusCallback: 'http://postb.in/1234abcd',
                                    to: '+91' + staff.phone
                                })
                                .then(message => console.log(message.sid));
                            }
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
                                    doctor:{
                                        name:user.name,
                                        address:user.clinicaddr,
                                        department:user.department
                                    },
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
                                if (req.body.email) {
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
                                if(staff){
                                client.messages
                                .create({
                                    body: 'CONFIRMED Online Appointment (PAY-ON-CLINIC): The details of the patient are :- Patient Name - ' + req.body.name + ', Age - ' + req.body.age + ', Phone - ' + req.body.phone + ', Address - ' + req.body.address + '. The appointment details are :- Appointment number - '+ k1 + ', Date - ' + date + ', Day - ' + day + ', Time - ' + time + '. Please make sure to ask the online patient to pay the amount and show the appointment success message.',
                                    from: '+12108995132',
                                    alphanumeric_id : "AarogyaHub",
                                    statusCallback: 'http://postb.in/1234abcd',
                                    to: '+91' + staff.phone
                                })
                                .then(message => console.log(message.sid));
                            }
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
                                    doctor:{
                                        name:user.name,
                                        address:user.clinicaddr,
                                        department:user.department
                                    },
                                    name: req.body.name,
                                    address: req.body.address,
                                    phone: req.body.phone,
                                    age: req.body.age,
                                gender:req.body.gender
                                });
                
                            }
                     
           
        }

        else{
            //Validation
            if(!req.body.name)
            {
                return res.status(422).json({
                    status:'false',
                    msg:'Please enter your name.'
                })
            }
            if(!req.body.phone)
            {
                return res.status(422).json({
                    status:'false',
                    msg:'Please enter your phone.'
                })
            }
            if(!req.body.address)
            {
                return res.status(422).json({
                    status:'false',
                    msg:'Please enter your address.'
                })
            }
            if(!req.body.gender)
            {
                return res.status(422).json({
                    status:'false',
                    msg:'Please enter your gender.'
                })
            }
            if(!req.body.age)
            {
                return res.status(422).json({
                    status:'false',
                    msg:'Please enter your age.'
                })
            }
            if(!req.body.type)
            {
                return res.status(422).json({
                    status:'false',
                    msg:'Please select the patient type.'
                })
            }
            if(!req.body.id)
            {
                return res.status(422).json({
                    status:'false',
                    msg:'Please enter the id.'
                })
            }
            if(!req.body.did)
            {
                return res.status(422).json({
                    status:'false',
                    msg:'Please enter the did.'
                })
            }
            if(!req.body.slotindex)
            {
                return res.status(422).json({
                    status:'false',
                    msg:'Please enter the slotindex.'
                })
            }
            if(!req.body.dayindex)
            {
                return res.status(422).json({
                    status:'false',
                    msg:'Please enter the dayindex.'
                })
            }
            if(req.body.type !='own' && req.body.type!='other')
            {
                return res.status(422).json({
                    status:'false',
                    msg:'Please select the correct patient type.'
                })
            }
            else{
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
                    status:'true',
                    amount: response.amount,
                    orderid: response.id,
                    currency: response.currency,
                    slotindex: req.body.slotindex,
                    dayindex: req.body.dayindex,
                    id: req.body.id,
                    did: req.body.did,
                    date: req.body.date,
                    type: req.body.type,
                    name:req.body.name,
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
                    status:'false',
                    msg:'Please enter your name.'
                })
            }
            if(!req.body.phone)
            {
                return res.status(422).json({
                    status:'false',
                    msg:'Please enter your phone.'
                })
            }
            if(!req.body.address)
            {
                return res.status(422).json({
                    status:'false',
                    msg:'Please enter your address.'
                })
            }
            if(!req.body.gender)
            {
                return res.status(422).json({
                    status:'false',
                    msg:'Please enter your gender.'
                })
            }
            if(!req.body.age)
            {
                return res.status(422).json({
                    status:'false',
                    msg:'Please enter your age.'
                })
            }
            if(!req.body.type)
            {
                return res.status(422).json({
                    status:'false',
                    msg:'Please select the patient type.'
                })
            }
            if(!req.body.id)
            {
                return res.status(422).json({
                    status:'false',
                    msg:'Please enter the id.'
                })
            }
            if(!req.body.did)
            {
                return res.status(422).json({
                    status:'false',
                    msg:'Please enter the did.'
                })
            }
            if(!req.body.slotindex)
            {
                return res.status(422).json({
                    status:'false',
                    msg:'Please enter the slotindex.'
                })
            }
            if(!req.body.dayindex)
            {
                return res.status(422).json({
                    status:'false',
                    msg:'Please enter the dayindex.'
                })
            }
            if(req.body.type !='own' && req.body.type!='other')
            {
                return res.status(422).json({
                    status:'false',
                    msg:'Please select the correct patient type.'
                })
            }

           else{

                let user = await User.findById(req.body.did);
                
                var userId;
                if (req.headers && req.headers.authorization) {
                    
                    var authorization = req.headers.authorization.split(' ')[1];
                   
                   
                      var decoded = jwt.verify(authorization, '123456');
                    userId = decoded.username;
                }
                console.log(userId)
                let patient = await User.findOne({phone:userId,type:'Patient',service:'phone'});
                console.log(userId,patient)
                if (req.body.type == 'own') {
                    patient.name = req.body.name;
                    // patient.phone = req.body.phone;
                    patient.age = req.body.age;
                    patient.gender = req.body.gender;
                    patient.contacts.address = req.body.address;
                }
                if (req.body.type == 'other') {
                    patient.others.push({
                        name: req.body.name,
                        email: req.body.email,
                        phone: req.body.phone,
                        address: req.body.address,
                        age: req.body.age,
                        gender:req.body.gender
        
                    });
                }
        
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
                                if (req.body.email) {
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
                                if(staff)
                                {
                                client.messages
                                .create({
                                    body: 'CONFIRMED Online Appointment (PAY-ON-CLINIC): The details of the patient are :- Patient Name - ' + req.body.name + ', Age - ' + req.body.age + ', Phone - ' + req.body.phone + ', Address - ' + req.body.address + '. The appointment details are :- Appointment number - '+ b + ', Date - ' + date + ', Day - ' + day + ', Time - ' + time + '. Please make sure to ask the online patient to pay the amount and show the appointment success message.',
                                    from: '+12108995132',
                                    alphanumeric_id : "AarogyaHub",
                                    statusCallback: 'http://postb.in/1234abcd',
                                    to: '+91' + staff.phone
                                })
                                .then(message => console.log(message.sid));
                            }
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
                                    doctor:{
                                        name:user.name,
                                        address:user.clinicaddr,
                                        department:user.department
                                    },
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
                                if (req.body.email) {
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
                                if(staff){
                                client.messages
                                .create({
                                    body: 'CONFIRMED Online Appointment (PAY-ON-CLINIC): The details of the patient are :- Patient Name - ' + req.body.name + ', Age - ' + req.body.age + ', Phone - ' + req.body.phone + ', Address - ' + req.body.address + '. The appointment details are :- Appointment number - '+ k1 + ', Date - ' + date + ', Day - ' + day + ', Time - ' + time + '. Please make sure to ask the online patient to pay the amount and show the appointment success message.',
                                    from: '+12108995132',
                                    alphanumeric_id : "AarogyaHub",
                                    statusCallback: 'http://postb.in/1234abcd',
                                    to: '+91' + staff.phone
                                })
                                .then(message => console.log(message.sid));
                            }
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
                                    doctor:{
                                        name:user.name,
                                        address:user.clinicaddr,
                                        department:user.department
                                    },
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
module.exports.appointmentDetail = async(req, res) => {
    var userId;
                if (req.headers && req.headers.authorization) {
                    
                    var authorization = req.headers.authorization.split(' ')[1];
                   
                   
                      var decoded = jwt.verify(authorization, '123456');
                    userId = decoded.username;
                }
    if(userId){
        let user = await User.findOne({service:'phone',type:'Patient',phone:userId});
        if(user)
        {
            console.log(user.name,user.phone)
            let appointment;
            for(let u of user.doctors)
            {
                console.log(u.id)
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


module.exports.myAppointments = async function(req, res)
{
    var userId;
                if (req.headers && req.headers.authorization) {
                    
                    var authorization = req.headers.authorization.split(' ')[1];
                   
                   
                      var decoded = jwt.verify(authorization, '123456');
                    userId = decoded.username;
                }
                console.log(userId)
                let patient = await User.findOne({phone:userId,type:'Patient',service:'phone'});
                let appointments = [];

                for(let u of patient.doctors)
                {
                    appointments.push({
                        id:u._id,
                        doctor:{
                            did:u.did,
                            dname:u.dname,
                            ddept:u.ddept,
                            clinicname:u.cname,
                        },
                        patient:{
                            name:u.name,
                            age:u.age,
                            gender:u.gender,
                            phone:u.phone,
                            address:u.address

                        },
                        cancel:u.cancel,
                        mode:u.mode,
                        seat:u.seat,
                        date:u.date,
                        time:u.time,
                        fee:u.fee,
                        type:u.type,
                        payid:u.payment_id,
                        slotindex:u.slotindex,
                        dayindex:u.dayindex


                    })
                }

                return res.json({
                    appointments:appointments
                })
}


module.exports.cancelAppointment = async function(req, res) {

    try {
        var userId;
                if (req.headers && req.headers.authorization) {
                    
                    var authorization = req.headers.authorization.split(' ')[1];
                   
                   
                      var decoded = jwt.verify(authorization, '123456');
                    userId = decoded.username;
                }
                let user = await User.findById(req.body.did);
                let staff;
                if(user.staff_id){
                staff = await User.findById(user.staff_id);
                }
                let user1 = await User.findOne({phone:userId,type:'Patient',service:'phone'});

                       let n1 = await User.updateOne({ "_id" : user1._id, "doctors.payment_id": user1.doctors[req.query.index].payment_id }, {
                            '$set': {
                                
                                'doctors.$.cancel': true
                                
                            }
                        });
                        let n2 = await User.updateOne({ "_id" : req.query.id, "patients.payment_id": user1.doctors[req.query.index].payment_id }, {
                            '$set': {
                                
                                'patients.$.cancel': true
                                
                            }
                        });
                        if(staff)
                        {
                        let n3 = await User.updateOne({ "_id" : user.staff_id, "booking.payment_id": user1.doctors[req.query.index].payment_id }, {
                            '$set': {
                                
                                'booking.$.cancel': true
                                
                            }
                        });
                    }
                        if(typeof(user.schedule_time[req.query.dayindex].start) == 'object')
                        {
                            let available1 = [];
                            let k = req.query.slotindex;
                            let id = user.schedule_time[req.query.dayindex]._id;

                            let j = user.schedule_time[req.query.dayindex].available;
                            var a2 = parseInt(user.schedule_time[req.query.dayindex].available[req.query.slotindex]);
                            console.log(a2);
                            for(var temp =0;temp<user.schedule_time[req.query.dayindex].start.length;temp++)
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
                            var a1 = parseInt(user.schedule_time[req.query.dayindex].available);
                            
                            user.schedule_time[req.query.dayindex].available= a1 + 1 ;
                            user.save();

                        }
                        user1.notification.push({
                            type:'appointment-cancel',
                            message:'Your cancelled the appointment with Dr. '+ user.name +' on '+ req.query.date +' at '+ req.query.time ,
                            flag:true,
                            did:req.query.id
                        });
                        
                        
                        user1.save();
                        
                        client.messages
                        .create({
                            body: 'Looks like you had to cancel your Appointment for '+ req.query.date +' at '+ req.query.time + ' with Dr. ' + user.name+ ' at ' +user.clinicname+ ', ' +user.cliniccity+ ', '  +user.clinicaddr+ '. If you want to book another appointment, please visit https://aarogyahub.com/doctors',
                            from: '+12019755459',
                            statusCallback: 'http://postb.in/1234abcd',
                            to: '+91'+req.query.phone
                        })
                        .then(message => console.log(message.sid));
                        appointmentCancelAlert.newAlert(req.query.date,req.query.time,req.query.email,user,user1);
                        
                        return res.render('refund',{
                            title:'Refund',
                            doctor:user,
                            slotindex:req.query.slotindex,
                            dayindex:req.query.dayindex
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
                var userId;
                if (req.headers && req.headers.authorization) {
                    
                    var authorization = req.headers.authorization.split(' ')[1];
                   
                   
                      var decoded = jwt.verify(authorization, '123456');
                    userId = decoded.username;
                }
                console.log(userId)
                let user1 = await User.findOne({phone:userId,type:'Patient',service:'phone'});

                if(req.body.mode == 'online')
                {
                

                // if(req.body.flag == 'yes')
                // {

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
                            status:'true',
                            msg:'Appointment cancelled successfully',
                            doctor:{
                                name:user.name,
                                dept:user.department,
                                clinicname:user.clinicname
                            },
                            date:req.body.date,
                            time:req.body.time
                        });
                    // }

                    // else{
                        
                    //     let doctors = await User.findById(req.user.id).populate({
                    //         path: 'doctors',
                    //         populate: { 
                    //             path: 'did',
                    //             populate: { path: 'user' }
                    //         }
                    //     });
                    //     return res.render('my-billing', {
                    //         title: 'My Billings',
                    //         user: user1,
                    //         alldoctors:doctors
                    //     })
                    // }
                        
        //         }

        //  else {
        //     let doctors = await User.findById(req.user.id).populate({
        //         path: 'doctors',
        //         populate: {
        //             path: 'did',
        //             populate: { path: 'user' }
        //         }
        //     });
        //     return res.render('my-billing', {
        //         title: 'My Billings',
        //         user: user1,
        //         alldoctors: doctors
        //     })
        // }

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
    user1.notification.push({
        type:'appointment-cancel',
        message:'Your cancelled the appointment with Dr. '+ user.name +' on '+ req.body.date +' at '+ req.body.time ,
        flag:true,
        did:req.body.did
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
    if(req.body.email){
    appointmentCancelAlert.newAlert(req.body.date,req.body.time,req.body.email,user,user1);
    }
    
    return res.json({
        status:'true',
        msg:'Appointment cancelled successfully',
        doctor:{
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
            status:'false',
            code: 'BAD_REQUEST_ERROR',
            description: 'The total refund amount is greater than the refund payment amount',
        })
       
    }
}



module.exports.updateProfile = async function(req, res) {

    try {


        var userId;
        if (req.headers && req.headers.authorization) {
            
            var authorization = req.headers.authorization.split(' ')[1];
           
           
              var decoded = jwt.verify(authorization, '123456');
            userId = decoded.username;
        }
        let user = await User.findOne({phone:userId,type:'Patient',service:'phone'});
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




