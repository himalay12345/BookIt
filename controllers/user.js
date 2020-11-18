let User = require('../models/user');
const fs = require('fs');
const path = require('path');
const shortid = require('shortid');
const Razorpay = require('razorpay');
const config = require('../config/twilio');
const client = require('twilio')(config.accountSID, config.authToken);
const crypto = require('crypto');
const request = require('request');
const appointmentAlert = require('../mailers/appointment-alert');
const appointmentCancelAlert = require('../mailers/appointment-cancel');
const emailVerification = require('../mailers/email-verify');
const Feedback = require('../models/disable_feedback');
const Path = require('path');
const env = require('../config/environment');


module.exports.create = async(req, res) => {
    let davatar = path.join(__dirname, '..', '/assets/img/bg.png');
    let user = await User.create({
        name: req.body.name,
        phone: req.body.phone,
        password: req.body.password,
        avatar: davatar,
        service: 'phone',
        type: req.body.type
    });

    req.flash('success', 'Account created successfully.Please Login!');
    return res.redirect('/login');
}

module.exports.createStaff = async(req, res) => {

    let doctor = await User.findById(req.body.id);

    if (req.body.password == req.body.cpassword) {
        let user = await User.create({
            name: req.body.name,
            phone: req.body.phone,
            password: req.body.password,
            type: req.body.type,
            doctorid: req.body.id,
            service: 'phone'
        });

        doctor.staff_id = user._id;
        doctor.staff_flag = true;
        doctor.save();

        req.flash('success', 'Account created successfully.Please Login!');
        return res.redirect('/staff-login-page');
    } else {
        req.flash('error', 'Passwords donot match.')
        return res.render('staff-register', {
            title: 'Staff Register',
            phone: req.body.phone,
            id: req.body.id
        });
    }

}

module.exports.createStaffSession = async(req, res) => {

    return res.redirect(`/staff-booking/?id=${req.user.doctorid}`);
}

module.exports.verifyEmail = async(req, res) => {

    let user = await User.findById(req.query.id);
    if (user.emailkey == req.query.verify) {
        user.emailverify = true;
        user.save();
        return res.redirect('/email-verified');
    } else {
        return res.redirect('/email-not-verified');
    }
}

module.exports.updateProfile = async(req, res) => {

    let doctor = await User.findById(req.user.id);
    User.uploadedAvatar(req, res, function(err) {
        if (err) { console.log('*******Multer Error', err); return; }
        doctor.name = req.body.name;
        doctor.department = req.body.department;
        doctor.gender = req.body.gender;
        doctor.contacts.city = req.body.city;
        doctor.contacts.state = req.body.state;
        doctor.contacts.pincode = req.body.pincode;

        if (req.files['avatar']) {
            if (!doctor.avatar) {
                doctor.avatar = User.avatarPath + '/' + req.files['avatar'][0].filename;
            } else {
                if (fs.existsSync(path.join(__dirname, '..', doctor.avatar))) {
                    fs.unlinkSync(path.join(__dirname, '..', doctor.avatar));
                }

                fs.unlinkSync(path.join(__dirname, '..', doctor.avatar));
                doctor.avatar = User.avatarPath + '/' + req.files['avatar'][0].filename;
            }
        }


        doctor.save();


    });



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
    if (doctor.education.length == 1) {
        doctor.education.pull(doctor.education[0]._id);
    }
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


module.exports.searchDoctor = async(req, res) => {
    console.log(req.body);
    var selected = [];
    let users = await User.find({ type: 'Doctor' });


    var keyword = req.body.keyword.toUpperCase();


    for (u of users) {
        //    if(property.address.toUpperCase().indexOf(req.body.address.toUpperCase())){ 
        var name = u.name.toUpperCase();
        var temp = name.indexOf(keyword);
        if (temp > -1) {
            selected.push(u);
        }
    }





   return res.render('search', {
       title:'Search Results',
    doctors: selected
});

}

module.exports.doctorReview = async(req, res) => {
    let user = await User.findById(
        req.query.id);
    user.reviews.push(req.body);
    user.save();
    req.flash('success', 'Review added successfully')
    return res.redirect('back');
}

module.exports.createSession = async function(req, res) {

    console.log(req.body);
    if (req.body.flag == 'true') {

        let doctor = await User.findById(req.body.doctorid);
        return res.render('checkout', {
            title: 'Checkout',
            booked: req.body.booked,
            available: req.body.available,
            slotindex: req.body.slotindex,
            dayindex: req.body.dayindex,
            id: req.body.id,
            doctor: doctor

        });
    } else {

        if (req.user.type == 'Doctor') {


            if (req.user.approve1 == true && req.user.approve2 == true) {


                return res.redirect('/doctor-dashboard');
            } else {
                return res.redirect('/steps');
            }
        } else {
            return res.redirect('/patient-dashboard');
        }


    }
    //Todo Later

}

module.exports.popup = async function(req, res) {
    let user = await User.findById(req.user.id);

    if (!user.type) {
        return res.redirect('/#popup1');
    } else {

        if (req.user.type == 'Doctor') {
            if (req.user.approve1 == true && req.user.approve2 == true) {

                return res.redirect('/doctor-dashboard');
            } else {
                return res.redirect('/steps');
            }
        } else {
            if (req.body.flag == 'true') {

                let doctor = await User.findById(req.body.doctorid);
                return res.render('checkout', {
                    title: 'Checkout',
                    booked: req.body.booked,
                    available: req.body.available,
                    slotindex: req.body.slotindex,
                    dayindex: req.body.dayindex,
                    id: req.body.id,
                    doctor: doctor

                });
            } else {
                return res.redirect('/my-appointments');
            }
        }
    }

}

module.exports.manageBookingService = async(req, res) => {
    let user = await User.findById(req.user.id);
    if (req.body.flag == 'disable') {
        Feedback.create({
            did: user._id,
            value: req.body.reason,
            description: req.body.description
        });
        user.booking_service = false;
        user.save();
        req.flash('success', 'Booking Service deactivated successfully');
    } else {
        user.booking_service = true;
        user.save();
        req.flash('success', 'Booking Service activated successfully');
    }

    return res.redirect('back');
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
        return res.redirect('/profile-settings');
    }

}
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
            return res.render('search', {
                title:'Search Results',
                doctors: doctors
            });
        } else {
            doctors = await User.find({ department: req.body.select_specialist, type: "Doctor",approve1: true, approve2: true, booking_service: true });
            return res.render('search', {
                title:'Search Results',
                doctors: doctors
            });
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
        return res.render('search', {
            title:'Search Results',
            doctors: doctors
        });
    }
    
     else {
        doctors = await User.find({
            gender: req.body.gender_type,
            type: "Doctor",
            approve1: true, approve2: true, booking_service: true
        });
        return res.render('search', {
            title:'Search Results',
            doctors: doctors
        });

    }

    

   

}

module.exports.confirmPay = async function(req, res) {

    try{
            let doctor = await User.findById(req.body.doctorid);
                const razorpay = new Razorpay({
                    key_id: env.razorpay_key_id,
                    key_secret: env.razorpay_key_secret
                
            });

          


            const payment_capture = 1;
            const amount = doctor.booking_fee;
            const currency = 'INR';
            const vendor_amount = amount-(amount*0.1);
            
            const response = await razorpay.orders.create({
                amount:amount*100,
                currency,
                receipt: shortid.generate(),
                payment_capture,
                transfers: [
                    {
                    account: doctor.accountid,
                    amount: vendor_amount*100,
                    currency: "INR"
                    
                    }
                ]

        
        });

        let user = await User.findById(req.user.id);


        if (req.body.type == 'own') {
            user.name = req.body.name;
            user.phone = req.body.phone;
            user.age = req.body.age;
            user.contacts.address = req.body.address;
        }

        if (req.body.type == 'other') {
            user.others.push({
                name: req.body.pname,
                email: req.body.pemail,
                phone: req.body.pphone,
                address: req.body.paddress,
                age: req.body.page

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
    } catch (err) {
        console.log('Error', err);
    }

}


module.exports.destroySession = function(req, res) {
    req.logout();



    return res.redirect('/');
}

module.exports.offlineCancel = async function(req, res) {

    try{

                let user1 = await User.findById(req.user.id);
                let user = await User.findById(user1.doctorid);
                

                if(req.body.flag == 'yes')
                {

                    //    let n1 = await User.update({ "_id" : user1._id, "booking._id": req.body.bid}, {
                    //         '$set': {
                                
                    //             'booking.$.cancel': true
                                
                    //         }
                    //     });
                      
                    //     if(typeof(user.schedule_time[req.body.dayindex].start) == 'object')
                    //     {
                    //         let available1 = [];
                    //         let k = req.body.slotindex;
                    //         let id = user.schedule_time[req.body.dayindex]._id;

                    //         let j = user.schedule_time[req.body.dayindex].available;
                    //         var a2 = parseInt(user.schedule_time[req.body.dayindex].available[req.body.slotindex]);
                    //         console.log(a2);
                    //         for(var temp =0;temp<user.schedule_time[req.body.dayindex].start.length;temp++)
                    //             {
                    //                 if(temp == k)
                    //                 {
                    //                     available1.push(a2+1);
                    //                     continue;
                    //                 }
                    //                 var temp1 = parseInt(j[temp]);
                    //                 available1.push(temp1);
                    //             }
                    //         let day = await User.update({ 'schedule_time._id': id }, {
                    //             '$set': {
                                    
                    //                 'schedule_time.$.available': available1
                                    
                    //             }
                    //         });
                    //         // user.schedule_time[0].available[0] = 5;
                    //         user.save();
                    //     }
                    //     else{
                    //         var a1 = parseInt(user.schedule_time[req.body.dayindex].available);
                            
                    //         user.schedule_time[req.body.dayindex].available= a1 + 1 ;
                    //         user.save();

                    //     }
                       
                        
                    //     user1.save();
                        
                    //     return res.render('staff-booking-page',{
                    //         title:'Staff Booking Page',
                    //         doctor:user,
                    //        title:'Book Apointment'
                    //     });
               console.log(req.body);

                   
                        
                }

                else{
                    return res.render('staff-booking-page',{
                        title:'Staff Booking Page',
                        doctor:user,
                       title:'Book Apointment'
                    });

        }
    } catch (err) {
        console.log('Error', err);
        return;
    }
}

module.exports.refund = async function(req, res) {

    try {
        console.log(req.body);
                let user = await User.findById(req.body.doctorid);
                let staff = await User.findById(user.staff_id);
                let user1 = await User.findById(req.user.id);
                

                if(req.body.flag == 'yes')
                {

                    // const razorpay1 = new Razorpay({
                    //      key_id: env.razorpay_key_id,
                        // key_secret: env.razorpay.key_secret
                        
                    // });
                    // var refund_amount = req.body.fee - 50 ;

                    // const response = await razorpay1.payments.refund(req.body.id,
                        
                    //     {
                    //         amount : refund_amount*100,
                    //         speed : 'optimum'
                    //     });

                    // if(response.id && response.payment_id)
                    // {
                    //    let n1 = await User.update({ "_id" : user1._id, "doctors.payment_id": user1.doctors[req.body.index].payment_id }, {
                    //         '$set': {
                                
                    //             'doctors.$.cancel': true
                                
                    //         }
                    //     });
                    //     let n2 = await User.update({ "_id" : req.body.doctorid, "patients.payment_id": user1.doctors[req.body.index].payment_id }, {
                    //         '$set': {
                                
                    //             'patients.$.cancel': true
                                
                    //         }
                    //     });
                    //     let n3 = await User.update({ "_id" : user.staff_id, "booking.payment_id": user1.doctors[req.body.index].payment_id }, {
                    //         '$set': {
                                
                    //             'booking.$.cancel': true
                                
                    //         }
                    //     });
                    //     if(typeof(user.schedule_time[req.body.dayindex].start) == 'object')
                    //     {
                    //         let available1 = [];
                    //         let k = req.body.slotindex;
                    //         let id = user.schedule_time[req.body.dayindex]._id;

                    //         let j = user.schedule_time[req.body.dayindex].available;
                    //         var a2 = parseInt(user.schedule_time[req.body.dayindex].available[req.body.slotindex]);
                    //         console.log(a2);
                    //         for(var temp =0;temp<user.schedule_time[req.body.dayindex].start.length;temp++)
                    //             {
                    //                 if(temp == k)
                    //                 {
                    //                     available1.push(a2+1);
                    //                     continue;
                    //                 }
                    //                 var temp1 = parseInt(j[temp]);
                    //                 available1.push(temp1);
                    //             }
                    //         let day = await User.update({ 'schedule_time._id': id }, {
                    //             '$set': {
                                    
                    //                 'schedule_time.$.available': available1
                                    
                    //             }
                    //         });
                    //         // user.schedule_time[0].available[0] = 5;
                    //         user.save();
                    //     }
                    //     else{
                    //         var a1 = parseInt(user.schedule_time[req.body.dayindex].available);
                            
                    //         user.schedule_time[req.body.dayindex].available= a1 + 1 ;
                    //         user.save();

                    //     }
                    //     user1.notification.push({
                    //         type:'appointment-cancel',
                    //         message:'Your cancelled the appointment with Dr. '+ user.name +' on '+ req.body.date +' at '+ req.body.time ,
                    //         flag:true,
                    //         did:req.body.doctorid
                    //     });
                        
                        
                    //     user1.save();
                        
                    //     client.messages 
                    //     .create({ 
                    //         body: 'Looks like you had to cancel your Appointment for '+ req.body.date +' at '+ req.body.time + ' with Dr. ' + user.name+ ' at ' +user.clinicname+ ', ' +user.cliniccity+ ', '  +user.clinicaddr+ ', Ph: +91' +user.phone+ '. If you want to book another appointment, please visit http://doccure.com.',
                    //         from: 'whatsapp:+14155238886',       
                    //         to: 'whatsapp:+91'+req.body.phone 
                    //     }) 
                    //     .then(message => console.log(message.sid)) 
                    //     .done();

                    //     client.messages
                    //     .create({
                    //         body: 'Looks like you had to cancel your Appointment for '+ req.body.date +' at '+ req.body.time + ' with Dr. ' + user.name+ ' at ' +user.clinicname+ ', ' +user.cliniccity+ ', '  +user.clinicaddr+ ', Ph: +91' +user.phone+ '. If you want to book another appointment, please visit http://doccure.com.',
                    //         from: '+12019755459',
                    //         statusCallback: 'http://postb.in/1234abcd',
                    //         to: '+91'+req.body.phone
                    //     })
                    //     .then(message => console.log(message.sid));
                    //     appointmentCancelAlert.newAlert(req.body.date,req.body.time,req.body.email,user,user1);
                        
                    //     return res.render('refund',{
                        //     title:'Refund',
                    //         doctor:user,
                    //         slotindex:req.body.slotindex,
                    //         dayindex:req.body.dayindex
                    //     });
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
                        
                }

         else {
            let doctors = await User.findById(req.user.id).populate({
                path: 'doctors',
                populate: {
                    path: 'did',
                    populate: { path: 'user' }
                }
            });
            return res.render('my-billing', {
                title: 'My Billings',
                user: user1,
                alldoctors: doctors
            })
        }

    } catch (err) {
        console.log('Error', err);
        return;
    }
}

module.exports.verifyPayment = async(req, res) => {
    // const secret = '12345678'


    let user = await User.findById(req.query.doctorid);
    let staff = await User.findById(user.staff_id);
    let patient = await User.findById(req.query.userid);


    if (patient.refresh_flag == true) {
        if (req.body.razorpay_payment_id && req.body.razorpay_order_id && req.body.razorpay_signature) {
            if (typeof(user.schedule_time[req.query.dayindex].start) == 'object') {
                let available = [];
                let booked = [];
                let k = req.query.slotindex;
                let i = req.query.available.split(',');
                let a = parseInt(i[k]);
                a = a - 1;
                for (var temp = 0; temp < user.schedule_time[req.query.dayindex].start.length; temp++) {
                    if (temp == k) {
                        available.push(a);
                        continue;
                    }
                    var temp1 = parseInt(i[temp]);
                    available.push(temp1);
                }
                let j = req.query.booked.split(',');
                let bd = user.schedule_time[req.query.dayindex].booked[req.query.slotindex];
                let b = parseInt(bd);
                b = b + 1;
                for (var temp = 0; temp < user.schedule_time[req.query.dayindex].start.length; temp++) {
                    if (temp == req.query.slotindex) {
                        booked.push(b);
                        continue;
                    }
                    var temp1 = parseInt(j[temp]);
                    booked.push(temp1);
                }
                let day = await User.update({ 'schedule_time._id': req.query.id }, {
                    '$set': {
                        'schedule_time.$.booked': booked
                            //   'schedule_time.$.available': available,

                    }
                });
                if (req.query.type == 'own') {
                    user.patients.push({
                        payment_id: req.body.razorpay_payment_id,
                        cancel: false,
                        pid: req.query.pid,
                        name: req.query.name,
                        email: req.query.email,
                        phone: req.query.phone,
                        time: req.query.time,
                        date: req.query.date,
                        day: req.query.day,
                        fee: req.query.fee,
                        type: req.query.type,
                        seat: b

                    });
                    patient.doctors.push({
                        payment_id: req.body.razorpay_payment_id,
                        cancel: false,
                        did: req.query.doctorid,
                        name: req.query.name,
                        email: req.query.email,
                        dayindex: req.query.dayindex,
                        slotindex: req.query.slotindex,
                        phone: req.query.phone,
                        time: req.query.time,
                        date: req.query.date,
                        day: req.query.day,
                        fee: req.query.fee,
                        type: req.query.type,
                        seat: b

                    });



                    if (staff) {

                        staff.booking.push({
                            payment_id: req.body.razorpay_payment_id,
                            name: req.query.name,
                            address: req.query.address,
                            phone: req.query.phone,
                            age: req.query.age,
                            cancel: false,
                            type: 'online',
                            time: req.query.time,
                            date: req.query.date,
                            day: req.query.day,
                            fee: req.query.fee,
                            slot: req.query.slotindex,
                            seat: b
                        });
                        staff.save();
                    }



                } else {
                    user.patients.push({
                        payment_id: req.body.razorpay_payment_id,
                        cancel: false,
                        pid: req.query.pid,
                        name: req.query.name,
                        email: req.query.email,
                        phone: req.query.phone,
                        time: req.query.time,
                        date: req.query.date,
                        day: req.query.day,
                        fee: req.query.fee,
                        type: req.query.type,
                        seat: b

                    });
                    patient.doctors.push({
                        payment_id: req.body.razorpay_payment_id,
                        cancel: false,
                        did: req.query.doctorid,
                        name: req.query.name,
                        email: req.query.email,
                        phone: req.query.phone,
                        time: req.query.time,
                        dayindex: req.query.dayindex,
                        slotindex: req.query.slotindex,
                        date: req.query.date,
                        day: req.query.day,
                        fee: req.query.fee,
                        type: req.query.type,
                        seat: b

                    });
                    let n = patient.others.length - 1;
                    let nid = patient.others[n]._id;
                    patient.others.pull(nid);
                    if (staff) {

                        staff.booking.push({
                            payment_id: req.body.razorpay_payment_id,
                            name: req.query.name,
                            address: req.query.address,
                            phone: req.query.phone,
                            age: req.query.age,
                            cancel: false,
                            type: 'online',
                            time: req.query.time,
                            date: req.query.date,
                            day: req.query.day,
                            fee: req.query.fee,
                            slot: req.query.slotindex,
                            seat: b
                        });
                        staff.save();
                    }

                }
                patient.refresh_flag = false;
                patient.payments.push({
                    payment_id: req.body.razorpay_payment_id,
                    order_id: req.body.razorpay_order_id,
                    signature: req.body.razorpay_signature
                });
                patient.notification.push({
                    type: 'appointment-success',
                    message: 'Your Apointment is confirmed with Dr. ' + user.name + ' on ' + req.query.date + ' at ' + req.query.time,
                    flag: true,
                    did: req.query.doctorid
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

                client.messages
                    .create({
                        body: 'CONFIRMED Appointment for ' + req.query.date + ' at ' + req.query.time + ' with Dr. ' + user.name + '. The clinic details are ' + user.clinicname + ', ' + user.cliniccity + ', ' + user.clinicaddr + ', Ph: +91' + user.phone + '. Please show this SMS at the clinic front-desk before your appointment.',
                        from: '+12019755459',
                        statusCallback: 'http://postb.in/1234abcd',
                        to: '+91' + req.query.phone
                    })
                    .then(message => console.log(message.sid));
                if (req.query.email) {
                    appointmentAlert.newAlert(req.query.date, req.query.time, req.query.email, user, patient);
                }



                return res.render('booking-success', {
                    title: 'Booking-Success',
                    doctor: user,
                    seat: b,
                    slotindex: req.query.slotindex,
                    dayindex: req.query.dayindex,
                    date: req.query.date,
                    user: patient
                });

            }

            if (typeof(user.schedule_time[req.query.dayindex].start) == 'string') {
                let bd1 = user.schedule_time[req.query.dayindex].booked;
                let k1 = parseInt(bd1);
                k1 += 1;
                var k2 = parseInt(req.query.available);
                k2 -= 1;


                let day = await User.update({ 'schedule_time._id': req.query.id }, {
                    '$set': {
                        'schedule_time.$.booked': k1
                            //   'schedule_time.$.available': k2,

                    }
                });
                if (req.query.type == 'own') {
                    user.patients.push({
                        payment_id: req.body.razorpay_payment_id,
                        cancel: false,
                        pid: req.query.pid,
                        name: req.query.name,
                        email: req.query.email,
                        phone: req.query.phone,
                        time: req.query.time,
                        date: req.query.date,
                        day: req.query.day,
                        fee: req.query.fee,
                        type: req.query.type,
                        seat: k1

                    });
                    patient.doctors.push({
                        payment_id: req.body.razorpay_payment_id,
                        cancel: false,
                        did: req.query.doctorid,
                        name: req.query.name,
                        email: req.query.email,
                        phone: req.query.phone,
                        time: req.query.time,
                        date: req.query.date,
                        dayindex: req.query.dayindex,
                        // slotindex: req.query.slotindex,
                        day: req.query.day,
                        fee: req.query.fee,
                        type: req.query.type,
                        seat: k1

                    });

                    if (staff) {

                        staff.booking.push({
                            payment_id: req.body.razorpay_payment_id,
                            name: req.query.name,
                            address: req.query.address,
                            phone: req.query.phone,
                            age: req.query.age,
                            cancel: false,
                            type: 'online',
                            time: req.query.time,
                            date: req.query.date,
                            day: req.query.day,
                            fee: req.query.fee,
                            seat: k1
                        });
                        staff.save();
                    }

                } else {
                    user.patients.push({
                        payment_id: req.body.razorpay_payment_id,
                        cancel: false,
                        pid: req.query.pid,
                        name: req.query.name,
                        email: req.query.email,
                        phone: req.query.phone,
                        time: req.query.time,
                        date: req.query.date,
                        day: req.query.day,
                        fee: req.query.fee,
                        type: req.query.type,
                        seat: k1

                    });
                    patient.doctors.push({
                        payment_id: req.body.razorpay_payment_id,
                        cancel: false,
                        did: req.query.doctorid,
                        name: req.query.name,
                        email: req.query.email,
                        phone: req.query.phone,
                        time: req.query.time,
                        date: req.query.date,
                        dayindex: req.query.dayindex,
                        // slotindex: req.query.slotindex,
                        day: req.query.day,
                        fee: req.query.fee,
                        type: req.query.type,
                        seat: k1

                    });
                    let n = patient.others.length - 1;
                    let nid = patient.others[n]._id;
                    patient.others.pull(nid);

                    if (staff) {

                        staff.booking.push({
                            payment_id: req.body.razorpay_payment_id,
                            name: req.query.name,
                            address: req.query.address,
                            phone: req.query.phone,
                            age: req.query.age,
                            cancel: false,
                            type: 'online',
                            time: req.query.time,
                            date: req.query.date,
                            day: req.query.day,
                            fee: req.query.fee,
                            seat: k1
                        });
                        staff.save();
                    }



                }
                patient.refresh_flag = false;
                patient.payments.push({
                    payment_id: req.body.razorpay_payment_id,
                    order_id: req.body.razorpay_order_id,
                    signature: req.body.razorpay_signature
                });
                patient.notification.push({
                    type: 'appointment-success',
                    message: 'Your Apointment is confirmed with Dr. ' + user.name + ' on ' + req.query.date + ' at ' + req.query.time,
                    flag: true,
                    did: req.query.doctorid
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

                client.messages
                    .create({
                        body: 'CONFIRMED Appointment for ' + req.query.date + ' at ' + req.query.time + ' with Dr. ' + user.name + '. The clinic details are ' + user.clinicname + ', ' + user.cliniccity + ', ' + user.clinicaddr + ', Ph: +91' + user.phone + '. Please show this SMS at the clinic front-desk before your appointment.',
                        from: '+12019755459',
                        statusCallback: 'http://postb.in/1234abcd',
                        to: '+91' + req.query.phone
                    })
                    .then(message => console.log(message.sid));
                if (req.query.email) {
                    appointmentAlert.newAlert(req.query.date, req.query.time, req.query.email, user, patient);
                }

                return res.render('booking-success', {
                    title: 'Booking-Success',
                    doctor: user,
                    seat: k1,
                    // slotindex: req.query.slotindex,
                    dayindex: req.query.dayindex,
                    date: req.query.date,
                    user: patient
                });

            }


        } else {
            return res.redirect('/doctors');
        }
    } else {

        return res.redirect('/login');
    }


}

module.exports.payment = async(req, res) => {
    let user = await User.findById(req.body.doctorid);
    let patient = await User.findById(req.user.id);
    console.log(req.body);


    if (typeof(user.schedule_time[req.body.dayindex].start) == 'object') {
        let available = [];
        let booked = [];
        let k = req.body.slotindex;
        let i = req.body.available.split(',');
        let a = parseInt(i[k]);
        a = a - 1;
        for (var temp = 0; temp < user.schedule_time[req.body.dayindex].start.length; temp++) {
            if (temp == k) {
                available.push(a);
                continue;
            }
            var temp1 = parseInt(i[temp]);
            available.push(temp1);
        }
        let j = req.body.booked.split(',');
        let bd = user.schedule_time[req.body.dayindex].booked[req.body.slotindex];
        let b = parseInt(bd);
        b = b + 1;
        // console.log(user.schedule_time[req.body.dayindex].start.length);
        for (var temp = 0; temp < user.schedule_time[req.body.dayindex].start.length; temp++) {
            if (temp == req.body.slotindex) {
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
        if (req.body.type == 'own') {
            user.patients.push({
                pid: req.body.pid,
                name: req.body.name,
                email: req.body.email,
                phone: req.body.phone,
                time: req.body.time,
                date: req.body.date,
                day: req.body.day,
                fee: req.body.fee,
                type: req.body.type,
                seat: b

            });
            patient.doctors.push({
                did: req.body.doctorid,
                name: req.body.name,
                email: req.body.email,
                phone: req.body.phone,
                time: req.body.time,
                date: req.body.date,
                day: req.body.day,
                fee: req.body.fee,
                type: req.body.type,
                seat: b

            });
        } else {
            // let day = await User.update({ 'others._id': req.body.pid }, {
            //     '$set': {
            //         'others.$.': booked,
            //         'others.$.available': available,

            //     }
            // });
            user.patients.push({
                pid: req.body.pid,
                name: req.body.name,
                email: req.body.email,
                phone: req.body.phone,
                time: req.body.time,
                date: req.body.date,
                day: req.body.day,
                fee: req.body.fee,
                type: req.body.type,
                seat: b

            });
            patient.others[req.body.index].doctors.push({
                did: req.body.doctorid,
                name: req.body.name,
                email: req.body.email,
                phone: req.body.phone,
                time: req.body.time,
                date: req.body.date,
                day: req.body.day,
                fee: req.body.fee,
                type: req.body.type,
                seat: b

            });
        }

        user.save();
        patient.save();
        return res.render('booking-success', {
            title: 'Booking-Success',
            doctor: user,
            seat: b,
            slotindex: req.body.slotindex,
            dayindex: req.body.dayindex
        });

    }

    if (typeof(user.schedule_time[req.body.dayindex].start) == 'string') {
        let bd1 = user.schedule_time[req.body.dayindex].booked;
        let k1 = parseInt(bd1);
        k1 += 1;
        var k2 = parseInt(req.body.available);
        k2 -= 1;


        let day = await User.update({ 'schedule_time._id': req.body.id }, {
            '$set': {
                'schedule_time.$.booked': k1,
                'schedule_time.$.available': k2,

            }
        });
        if (req.body.type == 'own') {
            user.patients.push({
                pid: req.body.pid,
                name: req.body.name,
                email: req.body.email,
                phone: req.body.phone,
                time: req.body.time,
                date: req.body.date,
                day: req.body.day,
                fee: req.body.fee,
                type: req.body.type,
                seat: k1

            });
            patient.doctors.push({
                did: req.body.doctorid,
                name: req.body.name,
                email: req.body.email,
                phone: req.body.phone,
                time: req.body.time,
                date: req.body.date,
                day: req.body.day,
                fee: req.body.fee,
                type: req.body.type,
                seat: k1

            });
        } else {
            user.patients.push({
                pid: req.body.pid,
                name: req.body.name,
                email: req.body.email,
                phone: req.body.phone,
                time: req.body.time,
                date: req.body.date,
                day: req.body.day,
                fee: req.body.fee,
                type: req.body.type,
                seat: k1

            });
            patient.others[req.body.index].doctors.push({
                did: req.body.doctorid,
                name: req.body.name,
                email: req.body.email,
                phone: req.body.phone,
                time: req.body.time,
                date: req.body.date,
                day: req.body.day,
                fee: req.body.fee,
                type: req.body.type,
                seat: k1

            });

        }
        user.save();
        patient.save();

        return res.render('booking-success', {
            title: 'Booking-Success',
            doctor: user,
            seat: k1,
            slotindex: req.body.slotindex,
            dayindex: req.body.dayindex
        });

    }

    console.log(req.body);




}

module.exports.bookAppointment = async(req, res) => {


    let doctor = await User.findById(req.body.doctorid);

    if (req.isAuthenticated()) {

        return res.render('checkout', {
            title: 'Checkout',
            booked: req.body.booked,
            available: req.body.available,
            slotindex: req.body.slotindex,
            dayindex: req.body.dayindex,
            id: req.body.id,
            doctor: doctor,
            date: req.body.date,
            flag: true

        })
    } else {

    return res.render('login',{
        title:'Login',
        booked:req.body.booked,
        available:req.body.available,
        slotindex:req.body.slotindex,
        dayindex:req.body.dayindex,
        id:req.body.id,
        doctor:doctor,
        flag:true

        });
    }
}

module.exports.deleteAccount = async(req, res) => {
    console.log(req.body);
    Feedback.create({
        delete_value: req.body.delete,
        description: req.body.del_description,
        did: req.user.id
    });

    let user = await User.findOne({ _id: req.user.id });

    if (fs.existsSync(path.join(__dirname, '..', user.avatar))) {
        fs.unlinkSync(path.join(__dirname, '..', user.avatar));
    }

    if (user.type == 'Doctor') {

        let staff = await User.find({doctorid:user._id, type:'Staff'});
        if(staff)
        {
            if (fs.existsSync(path.join(__dirname, '..', staff.avatar))) {
                fs.unlinkSync(path.join(__dirname, '..', staff.avatar));
            }
            let prope1 = await User.deleteOne({ _id: staff._id });


        }

        if (user.clinicphoto) {
            for (let i = 0; i < user.clinicphoto.length; i++) {
                if (fs.existsSync(path.join(__dirname, '..', user.clinicphoto[i]))) {
                    fs.unlinkSync(path.join(__dirname, '..', user.clinicphoto[i]));
                }
            }
        }

    }



    let prope = await User.deleteOne({ _id: req.user.id });

    req.flash('success', 'Account removed Successfully');


    return res.redirect('/');
}

module.exports.manageNotification = async(req, res) => {
    console.log(req.body);
    let user = await User.findById(req.user.id);
    user.nots_settings.email = req.body.email;
    user.nots_settings.phone = req.body.phone;
    user.save();
    return res.redirect('back');
}

module.exports.staffBookAppointment = async(req, res) => {


    let doctor = await User.findById(req.body.doctorid);
    let user = await User.findById(req.user.id);
    user.refresh_flag = true;
    user.save();

    if (req.isAuthenticated()) {

        return res.render('staff-checkout', {
            title: 'Checkout',
            booked: req.body.booked,
            available: req.body.available,
            slotindex: req.body.slotindex,
            dayindex: req.body.dayindex,
            id: req.body.id,
            doctor: doctor,
            date: req.body.date,
            flag: true

        });


    } else {

        return res.redirect('/staff-login-page')
    }
}


module.exports.offlinePay = async(req, res) => {
    let staff = await User.findById(req.user.id);
    let user = await User.findById(req.body.doctorid);
    if (req.user.type == 'Staff') {
        if (staff.refresh_flag == true) {
            if (typeof(user.schedule_time[req.body.dayindex].start) == 'object') {
                let available = [];
                let booked = [];
                let k = req.body.slotindex;
                let i = req.body.available.split(',');
                let a = parseInt(i[k]);
                a = a - 1;
                for (var temp = 0; temp < user.schedule_time[req.body.dayindex].start.length; temp++) {
                    if (temp == k) {
                        available.push(a);
                        continue;
                    }
                    var temp1 = parseInt(i[temp]);
                    available.push(temp1);
                }
                let j = req.body.booked.split(',');
                let bd = user.schedule_time[req.body.dayindex].booked[req.body.slotindex];
                let b = parseInt(bd);
                b = b + 1;
                for (var temp = 0; temp < user.schedule_time[req.body.dayindex].start.length; temp++) {
                    if (temp == req.body.slotindex) {
                        booked.push(b);
                        continue;
                    }
                    var temp1 = parseInt(j[temp]);
                    booked.push(temp1);
                }
                let day = await User.update({ 'schedule_time._id': req.body.id }, {
                    '$set': {
                        'schedule_time.$.booked': booked
                            //   'schedule_time.$.available': available,

                    }
                });

                staff.booking.push({
                    name: req.body.name,
                    address: req.body.address,
                    phone: req.body.phone,
                    age: req.body.age,
                    cancel: false,
                    type: 'offline',
                    time: req.body.time,
                    date: req.body.date,
                    day: req.body.day,
                    slot: req.body.slotindex,
                    dayindex: req.body.dayindex,
                    fee: req.body.fee,
                    seat: b
                });
                staff.refresh_flag = false;


                staff.save();


                //   client.messages
                //   .create({
                //      body: 'CONFIRMED Appointment for '+ req.body.date +' at '+ req.body.time + ' with Dr. ' + user.name+ '. The clinic details are ' +user.clinicname+ ', ' +user.cliniccity+ ', '  +user.clinicaddr+ ', Ph: +91' +user.phone+ '. Please show this SMS at the clinic front-desk before your appointment.',
                //      from: '+12019755459',
                //      statusCallback: 'http://postb.in/1234abcd',
                //      to: '+91'+req.body.phone
                //    })
                //   .then(message => console.log(message.sid));     

                console.log(req.body.date)
                return res.render('staff-booking-success', {
                    doctor: user,
                    title: 'Booking-Success',
                    seat: b,
                    slotindex: req.body.slotindex,
                    dayindex: req.body.dayindex,
                    date: req.body.date,

                });

            }

            if (typeof(user.schedule_time[req.body.dayindex].start) == 'string') {
                let bd1 = user.schedule_time[req.body.dayindex].booked;
                let k1 = parseInt(bd1);
                k1 += 1;
                var k2 = parseInt(req.body.available);
                k2 -= 1;


                let day = await User.update({ 'schedule_time._id': req.body.id }, {
                    '$set': {
                        'schedule_time.$.booked': k1
                            //   'schedule_time.$.available': k2,

                    }
                });

                staff.booking.push({
                    name: req.body.name,
                    address: req.body.address,
                    phone: req.body.phone,
                    age: req.body.age,
                    cancel: false,
                    type: 'offline',
                    time: req.body.time,
                    date: req.body.date,
                    day: req.body.day,
                    
                    dayindex: req.body.dayindex,
                    fee: req.body.fee,
                    seat: k1
                });
                staff.refresh_flag = false;
                staff.save();

                //   client.messages
                //   .create({
                //      body: 'CONFIRMED Appointment for '+ req.body.date +' at '+ req.body.time + ' with Dr. ' + user.name+ '. The clinic details are ' +user.clinicname+ ', ' +user.cliniccity+ ', '  +user.clinicaddr+ ', Ph: +91' +user.phone+ '. Please show this SMS at the clinic front-desk before your appointment.',
                //      from: '+12019755459',
                //      statusCallback: 'http://postb.in/1234abcd',
                //      to: '+91'+req.body.phone
                //    })
                //   .then(message => console.log(message.sid));



                return res.render('staff-booking-success', {
                    doctor: user,
                    title: 'Booking-Success',
                    seat: k1,
                   
                    dayindex: req.body.dayindex,
                    date: req.body.date,

                });

            }
        } else {
            return res.redirect(`/booking/?id=${req.user.doctorid}`);

        }



    } else {
        return res.redirect('/staff-login-page');
    }

}

module.exports.setBookingFee = async function(req, res) {
    let user = await User.findById(req.user.id);
    user.booking_fee = req.body.fee;
    user.save();

    if (req.body.flag == 'true') {
        return res.redirect('/terms');
    } else {
        return res.redirect('back');

    }

}

module.exports.staffSetBookingFee = async function(req, res) {
    let user = await User.findById(req.user.doctorid);
    user.booking_fee = req.body.fee;
    user.save();

    if (req.body.flag == 'true') {
        return res.redirect('/terms');
    } else {
        return res.redirect('back');

    }

}
module.exports.bankDetails = async function(req, res) {

    if (req.body.accountnumber != req.body.reaccountnumber) {
        req.flash('error', 'Account numbers donot match!');
        return res.redirect('back');
    } else {

        let user = await User.findById(req.user.id);
        user.bank = {
            bankname: req.body.bankname,
            accountnumber: req.body.accountnumber,
            accountholdername: req.body.accountholdername,
            ifsccode: req.body.ifsccode
        }
        user.step4 = true;
        user.save();

        req.flash('success', 'Bank Details Updated');
        return res.redirect('/steps');
    }
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
module.exports.staffUpdateSchedule = async function(req, res) {


    if ((!req.body.start) || (!req.body.end)) {
        let user = await User.findById(req.user.doctorid);
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
            max_count: req.body.max_count,
            available: req.body.max_count,
            booked: 0
        })
    }

    if (typeof(req.body.start) == 'object') {
        user.schedule_time.push({
            day: req.body.day,
            start: req.body.start,
            end: req.body.end,
            max_count: req.body.max_count,
            available: req.body.max_count,
            booked: ['0', '0']
        });

    }



    user.save();
    console.log(req.body);

    return res.redirect('back');

}

module.exports.staffSetScheduleTiming = async function(req, res) {

    let user = await User.findById(req.user.doctorid);




    if (typeof(req.body.start) == 'string') {
        user.schedule_time.push({
            start: req.body.start,
            end: req.body.end,
            day: req.body.day,
            max_count: req.body.max_count,
            available: req.body.max_count,
            booked: 0
        })
    }

    if (typeof(req.body.start) == 'object') {
        user.schedule_time.push({
            day: req.body.day,
            start: req.body.start,
            end: req.body.end,
            max_count: req.body.max_count,
            available: req.body.max_count,
            booked: ['0', '0']
        });

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
    }

    if (req.body.designation == 'Staff') {
        let user = await User.findOne({ phone: req.body.phone, type: 'Staff' });
        user.password = req.body.password;
        user.save();

        req.flash('success', 'Password reset successfully');
        return res.redirect('/staff-login-page');
    } else {
        let user = await User.findOne({ phone: req.body.phone, type: 'Patient' });
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
                if (fs.existsSync(path.join(__dirname, '..', user.avatar))) {

                    fs.unlinkSync(path.join(__dirname, '..', user.idproof));
                }
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

                user.idproof = User.avatarPath + '/' + req.files['avatar'][0].filename;

            } else {
                if (fs.existsSync(path.join(__dirname, '..', user.avatar))) {
                    fs.unlinkSync(path.join(__dirname, '..', user.idproof));
                }
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

                if (fs.existsSync(path.join(__dirname, '..', user.avatar))) {
                    fs.unlinkSync(path.join(__dirname, '..', user.degreephoto));
                }
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

module.exports.changeBankAccount = async(req, res) => {
    let user = await User.findById(req.user.id);

    if (req.body.accountnumber == req.body.reaccountnumber) {
        user.account_change = true;
        user.approve_account_change = false;
        user.new_bank = req.body;
        user.save();
        req.flash('success', 'Account change requested');
        return res.redirect('back');
    } else {
        req.flash('error', 'Account number donot match!')
        return res.redirect('back');
    }
}


module.exports.sortByDate = async(req, res) => {
    let patients = await User.findById(req.user.id);
    const date = req.body.date;
    const str = date.split("/").join("-");
    console.log(str);

    if (req.body.flag == 'true') {
        let doctor = await User.findById(req.user.doctorid);
        let user1 = await User.findById(req.user.id).populate('doctorid');

        return res.render('staff-booking-page', {
            title: 'Book Appointment',
            doctor: doctor,
            daten: str,
            user1: user1
        })
    } else {
        return res.render('staff-dashboard', {
            title: 'My Dashboard',
            allpatients: patients,
            date: str
        })
    }

}

module.exports.doctorSortByDate = async(req, res) => {
    let patients = await User.findById(req.user.id).populate({
        path: 'patients',
        populate: {
            path: 'pid',
            populate: { path: 'user', }
        }
    });
    const date = req.body.date;
    const str = date.split("/").join("-");
    console.log(str);



    return res.render('doctor-dashboard', {
        title: 'My Dashboard',
        allpatients: patients,
        date: str
    })


}

module.exports.profileUpdate = async function(req, res) {

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
            user.emailkey = rand;
            if (req.body.email != '') {
                if (!user.emailverify) {
                    console.log('sent');
                    emailVerification.newAlert(user, rand, req.body.email);
                    user.email = req.body.email;
                    user.emailverify = false;
                }

                if (user.email != req.body.email) {
                    console.log('sent again');
                    emailVerification.newAlert(user, rand, req.body.email);
                    user.email = req.body.email;
                    user.emailverify = false;
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
            user.clinicname = req.body.clinicname;
            user.clinicaddr = req.body.clinicaddr;
            user.department = req.body.department;
            user.name = req.body.name;
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
            if (req.files['clinicphoto']) {
                for (let i = 0; i < req.files['clinicphoto'].length; i++) {
                    user.clinicphoto.push(User.avatarPath + '/' + req.files['clinicphoto'][i].filename);
                }
            }

            const rand = Math.floor((Math.random() * 100) + 54);
            user.emailkey = rand;
            if (!user.emailverify) {
                console.log('sent');
                emailVerification.newAlert(user, rand, req.body.email);
                user.email = req.body.email;
                user.emailverify = false;
            }

            if (user.email != req.body.email) {
                console.log('sent again');
                emailVerification.newAlert(user, rand, req.body.email);
                user.email = req.body.email;
                user.emailverify = false;
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