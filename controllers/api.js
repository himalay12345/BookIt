const User = require('../models/user');
const Test = require('../models/test');
const Consult = require('../models/consult');
const jwt = require('jsonwebtoken');
const config = require('../config/twilio');
const client = require('twilio')(config.accountSID, config.authToken);
const appointmentAlert = require('../mailers/appointment-alert');

module.exports.doctorProfile = async (req, res) => {
    let i = await User.findById(req.body.id);
 
    let avgrating = 0,cnt=0;
       for(j of i.reviews)
       {
        avgrating = avgrating+j.rating;
        cnt++;
       }
       let rating = parseInt(avgrating/cnt);
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
  
   

    res.json({

        doctors:doctors,
        consults:consults,
        tests: tests
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
        doctors.push( {
            name: i.name,
            experience:i.wexperience,
            department: i.department,
            education:education,
            specialist:specfirst,
            fee:i.booking_fee,
            clinicaddr:i.clinicaddr,
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
        doctors.push( {
            name: i.name,
            experience:i.wexperience,
            department: i.department,
            education:education,
            specialist:specfirst,
            fee:i.booking_fee,
            clinicaddr:i.clinicaddr,
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

    let user = await User.findById(req.body.did);
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

    if(user.poc)
    {
        return res.json({
            status:'true',
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
    
        })
    }

    else{
        return res.json({
            status:'false',
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
        let patient = await User.findOne({phone:userId,type:'Patient'});
        console.log(userId,patient)
        if (req.body.type == 'own') {
            patient.name = req.body.name;
            patient.phone = req.body.phone;
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
                       
                        patient.notification.push({
                            type: 'appointment-success',
                            message: 'Your Appointment is confirmed with Dr. ' + user.name + ' on ' + date + ' at ' + time,
                            flag: true,
                            did: req.body.did
                        });
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
                                from: '+12019755459',
                                alphanumeric_id : "AarogyaHub",
                                statusCallback: 'http://postb.in/1234abcd',
                                to: '+91' + req.body.phone
                            })
                            .then(message => console.log(message.sid));
                        }else{
                            client.messages
                            .create({
                                body: 'CONFIRMED Appointment for ' + date + ' at ' + time + ' with Dr. ' + user.name + '.Your Appointment number is '+ b + '. The clinic details are ' + user.clinicname + ', ' + user.cliniccity + ', ' + user.clinicaddr + '. The details of the patient are :- Patient Name - ' + req.body.name + ', Age - ' + req.body.age + ', Phone - ' + req.body.phone + ', Address - ' + req.body.address + '. Please show this SMS at the clinic front-desk and pay the amount before your appointment.',
                                from: '+12019755459',
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
                            from: '+12019755459',
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
                            from: '+12019755459',
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
                                address:doctor.clinicaddr,
                                department:user.department
                            },
                            name: req.body.name,
                            address: req.body.address,
                            phone: req.body.phone,
                            age: req.body.age
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
                        
                        patient.notification.push({
                            type: 'appointment-success',
                            message: 'Your Apointment is confirmed with Dr. ' + user.name + ' on ' + date + ' at ' + time,
                            flag: true,
                            did: req.body.did
                        });
        
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
                                from: '+12019755459',
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
                                from: '+12019755459',
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
                            from: '+12019755459',
                            alphanumeric_id : "AarogyaHub",
                            statusCallback: 'http://postb.in/1234abcd',
                            to: '+91' + user.phone
                        })
                        .then(message => console.log(message.sid));
                        if(staff){
                        client.messages
                        .create({
                            body: 'CONFIRMED Online Appointment (PAY-ON-CLINIC): The details of the patient are :- Patient Name - ' + req.body.name + ', Age - ' + req.body.age + ', Phone - ' + req.body.phone + ', Address - ' + req.body.address + '. The appointment details are :- Appointment number - '+ k1 + ', Date - ' + date + ', Day - ' + day + ', Time - ' + time + '. Please make sure to ask the online patient to pay the amount and show the appointment success message.',
                            from: '+12019755459',
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
                                address:doctor.clinicaddr,
                                department:user.department
                            },
                            name: req.body.name,
                            address: req.body.address,
                            phone: req.body.phone,
                            age: req.body.age
                        });
        
                    }
            } 
            
        }
    } catch (err) {
        console.log('Error', err);
    }

}



