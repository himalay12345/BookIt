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
const appointmentAlert1 = require('../mailers/appointment-cancel1');
const appointmentCancelAlert = require('../mailers/appointment-cancel');
const emailVerification = require('../mailers/email-verify');
const Feedback = require('../models/disable_feedback');
const Path = require('path');
const env = require('../config/environment');
const { VariableContext } = require('twilio/lib/rest/serverless/v1/service/environment/variable');


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
    if(req.user.doctorids.length>0)
    {
        return res.redirect('/select-doctor/?type=booking');
    }
else{
    return res.redirect(`/staff-booking/?id=${req.user.doctorid}`);
}
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

module.exports.pauseBookingService = async(req, res) => {

  if(req.user.type == 'Doctor')
  {
    console.log(req.body);
    let user = await User.findById(req.user.id);
 
 
 
     const sdate = req.body.start;
     const edate = req.body.end;
     const str1 = sdate.split("/").join("-");
     const str1b = str1.split('-');
     const str1a = str1b[2] + '-' + str1b[1] + '-' + str1b[0]
     const str2 = edate.split("/").join("-");
     const str2b = str2.split('-'); 
     const str2a = str2b[2] + '-' + str2b[1] + '-' + str2b[0];
     var str1c = new Date(str1a);
     var str2c = new Date(str2a); 
    if(str1c > str2c)
    {
     req.flash('error','End date should not be greater than start date.')
     return res.redirect('back');
    }
    if(req.body.start && req.body.end)
    {
    if(req.body.start == req.body.end)
    {
 
     var nflag = false;
     for(days of user.holidays)
     {
      if(days.date == str1)
      {
          nflag = true;
          break;
      }
     }
     if(!nflag){
     user.holidays.push({
         date:str1,
         flag:false
     });
 }
     for(temp of user.patients)
     {
         if(temp.date == str1)
         {
             let n1 = await User.update({ "_id" : temp.pid, "doctors.payment_id": temp.payment_id }, {
                 '$set': {
                     
                     'doctors.$.reschedule': true
                     
                 }
             });
         }
         client.messages
             .create({
                 body: 'This is to inform you that due to some circumstances Dr.'+ user.name + ' is not available on the date of your booked appointment (' + temp.date + ') on ' + temp.time + ' at ' + user.clinicname + ', ' + user.cliniccity + ', ' + user.clinicaddr + ' .Due to which you are informed to cancel the appointment.You can reschedule the appointment after cancellation.Cancellation is valid for 3 days prior to your appointment date.So we recommend you to cancel the appointment from your My billings section or you can use this link https://aarogyahub.com/my-billing',
                 from: '+12019755459',
                 statusCallback: 'http://postb.in/1234abcd',
                 to: '+91' + temp.phone
             })
             .then(message => console.log(message.sid));
             let patient = await User.findById(temp.pid);
         if (temp.email) {
             appointmentAlert1.newAlert(temp.date, temp.time, temp.email, user, patient);
         }
     }
    }
 
    else{
     const addDays = (date, days = 1) => {
         const result = new Date(date);
         result.setDate(result.getDate() + days);
         return result;
       };
       
       const dateRange = (start, end, range = []) => {
         if (start > end) return range;
         const next = addDays(start, 1);
         return dateRange(next, end, [...range, start]);
       };
       
       const range = dateRange(new Date(str1a), new Date(str2a));
       
       console.log(range);
       let range_date = range.map(date => date.toISOString().slice(0, 10));
     //   console.log(range.map(date => date.toISOString().slice(0, 10)))
       for(let i= 0;i<range_date.length;i++)
       {
          let a1 = range_date[i].split('-');
          let a2 = a1[2]+ '-' + a1[1] + '-' + a1[0];
          var nflag = false;
          for(days of user.holidays)
          {
           if(days.date == a2)
           {
               nflag = true;
               break;
           }
          }
          if(!nflag){
          user.holidays.push({
             date:a2,
             flag:false
         });
     }
         for(temp of user.patients)
         {
             if(temp.date == a2)
             {
                 let n1 = await User.update({ "_id" : temp.pid, "doctors.payment_id": temp.payment_id }, {
                     '$set': {
                         
                         'doctors.$.reschedule': true
                         
                     }
                 });
             }
             client.messages
             .create({
                 body: 'This is to inform you that due to some circumstances Dr.'+ user.name + ' is not available on the date of your booked appointment (' + temp.date + ') on ' + temp.time + ' at ' + user.clinicname + ', ' + user.cliniccity + ', ' + user.clinicaddr + ' .Due to which you are informed to cancel the appointment.You can reschedule the appointment after cancellation.Cancellation is valid for 3 days prior to your appointment date.So we recommend you to cancel the appointment from your My billings section or you can use this link https://aarogyahub.com/my-billing',
                 from: '+12019755459',
                 statusCallback: 'http://postb.in/1234abcd',
                 to: '+91' + temp.phone
             })
             .then(message => console.log(message.sid));
             let patient = await User.findById(temp.pid);
         if (temp.email) {
             appointmentAlert1.newAlert(temp.date, temp.time, temp.email, user, patient);
         }
         }
         
       }
    }
 
 }
 
    if(typeof(req.body.date)== 'object')
    {
     for(let i=0;i<req.body.date.length;i++)
     {
 
         var nflag = false;
         for(days of user.holidays)
         {
          if(days.date == req.body.date[i])
          {
              nflag = true;
              break;
          }
         }
         if(!nflag){
         user.holidays.push({
             date:req.body.date[i],
             flag:false
         });
     }
         for(temp of user.patients)
         {
             if(temp.date == req.body.date[i])
             {
                 let n1 = await User.update({ "_id" : temp.pid, "doctors.payment_id": temp.payment_id }, {
                     '$set': {
                         
                         'doctors.$.reschedule': true
                         
                     }
                 });
             }
             client.messages
             .create({
                 body: 'This is to inform you that due to some circumstances Dr.'+ user.name + ' is not available on the date of your booked appointment (' + temp.date + ') on ' + temp.time + ' at ' + user.clinicname + ', ' + user.cliniccity + ', ' + user.clinicaddr + ' .Due to which you are informed to cancel the appointment.You can reschedule the appointment after cancellation.Cancellation is valid for 3 days prior to your appointment date.So we recommend you to cancel the appointment from your My billings section or you can use this link https://aarogyahub.com/my-billing',
                 from: '+12019755459',
                 statusCallback: 'http://postb.in/1234abcd',
                 to: '+91' + temp.phone
             })
             .then(message => console.log(message.sid));
             let patient = await User.findById(temp.pid);
         if (temp.email) {
             appointmentAlert1.newAlert(temp.date, temp.time, temp.email, user, patient);
         }
         }
     }
    }
 
    if(typeof(req.body.date)== 'string')
    {
        console.log('hii')
        var nflag = false;
        for(days of user.holidays)
        {
         if(days.date == req.body.date)
         {
             nflag = true;
             break;
         }
        }
 
        if(!nflag)
        {
             user.holidays.push({
                 date:req.body.date,
                 flag:false
             });
        }
     for(temp of user.patients)
     {
         if(temp.date == req.body.date)
         {
             let n1 = await User.update({ "_id" : temp.pid, "doctors.payment_id": temp.payment_id }, {
                 '$set': {
                     
                     'doctors.$.reschedule': true
                     
                 }
             });
             client.messages
             .create({
                 body: 'This is to inform you that due to some circumstances Dr.'+ user.name + ' is not available on the date of your booked appointment (' + temp.date + ') on ' + temp.time + ' at ' + user.clinicname + ', ' + user.cliniccity + ', ' + user.clinicaddr + ' .Due to which you are informed to cancel the appointment.You can reschedule the appointment after cancellation.Cancellation is valid for 3 days prior to your appointment date.So we recommend you to cancel the appointment from your My billings section or you can use this link https://aarogyahub.com/my-billing',
                 from: '+12019755459',
                 statusCallback: 'http://postb.in/1234abcd',
                 to: '+91' + temp.phone
             })
             .then(message => console.log(message.sid));
             let patient = await User.findById(temp.pid);
         if (temp.email) {
             appointmentAlert1.newAlert(temp.date, temp.time, temp.email, user, patient);
         }
 
         }
     }
    }
    
    user.save();
    req.flash('success','Booking service paused for the selected date.')
    return res.redirect('back');
  }

  if(req.user.type == 'Staff')
  {
    console.log(req.body);
    let user = await User.findById(req.query.id);
 
 
 
     const sdate = req.body.start;
     const edate = req.body.end;
     const str1 = sdate.split("/").join("-");
     const str1b = str1.split('-');
     const str1a = str1b[2] + '-' + str1b[1] + '-' + str1b[0]
     const str2 = edate.split("/").join("-");
     const str2b = str2.split('-'); 
     const str2a = str2b[2] + '-' + str2b[1] + '-' + str2b[0];
     var str1c = new Date(str1a);
     var str2c = new Date(str2a); 
    if(str1c > str2c)
    {
     req.flash('error','End date should not be greater than start date.')
     return res.redirect('back');
    }
    if(req.body.start && req.body.end)
    {
    if(req.body.start == req.body.end)
    {
 
     var nflag = false;
     for(days of user.holidays)
     {
      if(days.date == str1)
      {
          nflag = true;
          break;
      }
     }
     if(!nflag){
     user.holidays.push({
         date:str1,
         flag:false
     });
 }
     for(temp of user.patients)
     {
         if(temp.date == str1)
         {
             let n1 = await User.update({ "_id" : temp.pid, "doctors.payment_id": temp.payment_id }, {
                 '$set': {
                     
                     'doctors.$.reschedule': true
                     
                 }
             });
         }
         client.messages
             .create({
                 body: 'This is to inform you that due to some circumstances Dr.'+ user.name + ' is not available on the date of your booked appointment (' + temp.date + ') on ' + temp.time + ' at ' + user.clinicname + ', ' + user.cliniccity + ', ' + user.clinicaddr + ' .Due to which you are informed to cancel the appointment.You can reschedule the appointment after cancellation.Cancellation is valid for 3 days prior to your appointment date.So we recommend you to cancel the appointment from your My billings section or you can use this link https://aarogyahub.com/my-billing',
                 from: '+12019755459',
                 statusCallback: 'http://postb.in/1234abcd',
                 to: '+91' + temp.phone
             })
             .then(message => console.log(message.sid));
             let patient = await User.findById(temp.pid);
         if (temp.email) {
             appointmentAlert1.newAlert(temp.date, temp.time, temp.email, user, patient);
         }
     }
    }
 
    else{
     const addDays = (date, days = 1) => {
         const result = new Date(date);
         result.setDate(result.getDate() + days);
         return result;
       };
       
       const dateRange = (start, end, range = []) => {
         if (start > end) return range;
         const next = addDays(start, 1);
         return dateRange(next, end, [...range, start]);
       };
       
       const range = dateRange(new Date(str1a), new Date(str2a));
       
       console.log(range);
       let range_date = range.map(date => date.toISOString().slice(0, 10));
     //   console.log(range.map(date => date.toISOString().slice(0, 10)))
       for(let i= 0;i<range_date.length;i++)
       {
          let a1 = range_date[i].split('-');
          let a2 = a1[2]+ '-' + a1[1] + '-' + a1[0];
          var nflag = false;
          for(days of user.holidays)
          {
           if(days.date == a2)
           {
               nflag = true;
               break;
           }
          }
          if(!nflag){
          user.holidays.push({
             date:a2,
             flag:false
         });
     }
         for(temp of user.patients)
         {
             if(temp.date == a2)
             {
                 let n1 = await User.update({ "_id" : temp.pid, "doctors.payment_id": temp.payment_id }, {
                     '$set': {
                         
                         'doctors.$.reschedule': true
                         
                     }
                 });
             }
             client.messages
             .create({
                 body: 'This is to inform you that due to some circumstances Dr.'+ user.name + ' is not available on the date of your booked appointment (' + temp.date + ') on ' + temp.time + ' at ' + user.clinicname + ', ' + user.cliniccity + ', ' + user.clinicaddr + ' .Due to which you are informed to cancel the appointment.You can reschedule the appointment after cancellation.Cancellation is valid for 3 days prior to your appointment date.So we recommend you to cancel the appointment from your My billings section or you can use this link https://aarogyahub.com/my-billing',
                 from: '+12019755459',
                 statusCallback: 'http://postb.in/1234abcd',
                 to: '+91' + temp.phone
             })
             .then(message => console.log(message.sid));
             let patient = await User.findById(temp.pid);
         if (temp.email) {
             appointmentAlert1.newAlert(temp.date, temp.time, temp.email, user, patient);
         }
         }
         
       }
    }
 
 }
 
    if(typeof(req.body.date)== 'object')
    {
     for(let i=0;i<req.body.date.length;i++)
     {
 
         var nflag = false;
         for(days of user.holidays)
         {
          if(days.date == req.body.date[i])
          {
              nflag = true;
              break;
          }
         }
         if(!nflag){
         user.holidays.push({
             date:req.body.date[i],
             flag:false
         });
     }
         for(temp of user.patients)
         {
             if(temp.date == req.body.date[i])
             {
                 let n1 = await User.update({ "_id" : temp.pid, "doctors.payment_id": temp.payment_id }, {
                     '$set': {
                         
                         'doctors.$.reschedule': true
                         
                     }
                 });
             }
             client.messages
             .create({
                 body: 'This is to inform you that due to some circumstances Dr.'+ user.name + ' is not available on the date of your booked appointment (' + temp.date + ') on ' + temp.time + ' at ' + user.clinicname + ', ' + user.cliniccity + ', ' + user.clinicaddr + ' .Due to which you are informed to cancel the appointment.You can reschedule the appointment after cancellation.Cancellation is valid for 3 days prior to your appointment date.So we recommend you to cancel the appointment from your My billings section or you can use this link https://aarogyahub.com/my-billing',
                 from: '+12019755459',
                 statusCallback: 'http://postb.in/1234abcd',
                 to: '+91' + temp.phone
             })
             .then(message => console.log(message.sid));
             let patient = await User.findById(temp.pid);
         if (temp.email) {
             appointmentAlert1.newAlert(temp.date, temp.time, temp.email, user, patient);
         }
         }
     }
    }
 
    if(typeof(req.body.date)== 'string')
    {
        console.log('hii')
        var nflag = false;
        for(days of user.holidays)
        {
         if(days.date == req.body.date)
         {
             nflag = true;
             break;
         }
        }
 
        if(!nflag)
        {
             user.holidays.push({
                 date:req.body.date,
                 flag:false
             });
        }
     for(temp of user.patients)
     {
         if(temp.date == req.body.date)
         {
             let n1 = await User.update({ "_id" : temp.pid, "doctors.payment_id": temp.payment_id }, {
                 '$set': {
                     
                     'doctors.$.reschedule': true
                     
                 }
             });
             client.messages
             .create({
                 body: 'This is to inform you that due to some circumstances Dr.'+ user.name + ' is not available on the date of your booked appointment (' + temp.date + ') on ' + temp.time + ' at ' + user.clinicname + ', ' + user.cliniccity + ', ' + user.clinicaddr + ' .Due to which you are informed to cancel the appointment.You can reschedule the appointment after cancellation.Cancellation is valid for 3 days prior to your appointment date.So we recommend you to cancel the appointment from your My billings section or you can use this link https://aarogyahub.com/my-billing',
                 from: '+12019755459',
                 statusCallback: 'http://postb.in/1234abcd',
                 to: '+91' + temp.phone
             })
             .then(message => console.log(message.sid));
             let patient = await User.findById(temp.pid);
         if (temp.email) {
             appointmentAlert1.newAlert(temp.date, temp.time, temp.email, user, patient);
         }
 
         }
     }
    }
    
    user.save();
    req.flash('success','Booking service paused for the selected date.')
    return res.redirect('back');
  }
}

module.exports.deleteDate = async(req, res) => {
    if(req.user.type == 'Staff')
    {
        let user = await User.findById(req.query.did);
       
        user.holidays.pull(req.query.id);
        user.save();
        return res.redirect('back');
    }
    if(req.user.type == 'Doctor'){
    let user = await User.findById(req.user.id);
    user.holidays.pull(req.query.id);
    user.save();
    return res.redirect('back');
    }
}

module.exports.updateProfile = async(req, res) => {

    let doctor = await User.findById(req.user.id);
    User.uploadedAvatar(req, res, function(err) {
        if (err) { console.log('*******Multer Error', err); return; }
        doctor.name = req.body.name;
        doctor.department = req.body.department;
        doctor.gender = req.body.gender;
        doctor.phone = req.body.phone;
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
        let doctor = await User.findById(
            req.query.id);
    patient.favourites.push({
        dname:doctor.name,
        davatar:doctor.avatar,
        did:doctor._id,
        ddept:doctor.department,
        dcity:doctor.contacts.city,
        dstate:doctor.contacts.state,
        dfee:doctor.booking_fee
    });
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

module.exports.addMoreSeat = async(req, res) => {
    let user = await User.findById(
        req.body.did);
 
  var today = new Date();
    var dd = String(today.getDate()).padStart(2, '0');
    var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
    var yyyy = today.getFullYear();
    var weekday = new Array('Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday');
    var dayOfWeek = weekday[today.getDay()].toUpperCase();
    let i = 0;
    let index;
    let sid;
    for(days of user.schedule_time)
    {
        if(days.day.toUpperCase() == dayOfWeek)
        {
            index=i;
            sid = days._id;
            break;
        }
        i++;
    }
    if(parseInt(req.body.more)>0)
    {
        if(typeof(user.schedule_time[index].start) == 'string')
    {
        let value = parseInt(user.schedule_time[index].available)+ parseInt(req.body.more);
        let day = await User.update({ 'schedule_time._id': sid }, {
                        '$set': {
                            
                            'schedule_time.$.available': value
                            
                        }
                    });

    }

    if(typeof(user.schedule_time[index].start) == 'object')
    {
        let available = [];
               let navailable = user.schedule_time[index].available;
                let a = parseInt(navailable[req.body.slot]);
                a = a + parseInt(req.body.more);
                for (var temp = 0; temp < user.schedule_time[index].start.length; temp++) {
                    if (temp == req.body.slot) {
                        available.push(a);
                        continue;
                    }
                    var temp1 = parseInt(navailable[temp]);
                    available.push(temp1);
                }

                let day = await User.update({ 'schedule_time._id': sid }, {
                    '$set': {
                        
                        'schedule_time.$.available': available
                        
                    }
                });

     
    }

    return res.redirect('back');
    }

    else{
        req.flash('error','Please enter the value greater than 0 ')
        return res.redirect('back');
    }

    



   
    
}

module.exports.createSession = async function(req, res) {

    console.log(req.body);
    if (req.body.flag == 'true' && req.body.type == 'booking') {
        let user = await User.findById(req.user.id);
        let doctor = await User.findById(req.body.doctorid);
        return res.render('checkout', {
            title: 'Checkout',
            booked: req.body.booked,
            available: req.body.available,
            slotindex: req.body.slotindex,
            dayindex: req.body.dayindex,
            id: req.body.id,
            doctor: doctor,
            date:req.body.date,
            flag:'true',
            user:user

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
    console.log(req.session.info);

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
            if (req.session.info.flag == 'true' && req.session.info.type == 'booking') {

                let doctor = await User.findById(req.session.info.doctorid);
                let user = await User.findById(req.user.id);
                return res.render('checkout', {
                    title: 'Checkout',
                    booked: req.session.info.booked,
                    available: req.session.info.available,
                    slotindex: req.session.info.slotindex,
                    dayindex: req.session.info.dayindex,
                    id: req.session.info.id,
                    doctor: doctor,
                    date:req.session.info.date,
                    flag:req.session.info.flag,
                    user:user

                });
            } else {
                return res.redirect('/my-appointments');
            }
        }
    }

}

module.exports.manageBookingService = async(req, res) => {
    if(req.user.type == 'Doctor')
    {
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

    if(req.user.type == 'Staff')
    {
        let user = await User.findById(req.query.id);
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

module.exports.staffSetOldPatient = async function(req, res) {
    console.log(req.body);
    let user = await User.findById(req.user.id);
    user.oldp = req.body;
    if(req.body.flag == 'false')
    {
    user.old_schedule_time_fixed.push({
        max_count:req.body.pcount,
        day:'Monday',
        available:req.body.pcount,
        booked:'0',
        reset_flag:false,
        alt_flag:false
    })
    user.old_schedule_time_fixed.push({
        max_count:req.body.pcount,
        day:'Tuesday',
        available:req.body.pcount,
        booked:'0',
        reset_flag:false,
        alt_flag:false
    })
    user.old_schedule_time_fixed.push({
        max_count:req.body.pcount,
        day:'Wednesday',
        available:req.body.pcount,
        booked:'0',
        reset_flag:false,
        alt_flag:false
    })
    user.old_schedule_time_fixed.push({
        max_count:req.body.pcount,
        day:'Thursday',
        available:req.body.pcount,
        booked:'0',
        reset_flag:false,
        alt_flag:false
    })
    user.old_schedule_time_fixed.push({
        max_count:req.body.pcount,
        day:'Friday',
        available:req.body.pcount,
        booked:'0',
        reset_flag:false,
        alt_flag:false
    })
    user.old_schedule_time_fixed.push({
        max_count:req.body.pcount,
        day:'Saturday',
        available:req.body.pcount,
        booked:'0',
        reset_flag:false,
        alt_flag:false
    })
    user.old_schedule_time_fixed.push({
        max_count:req.body.pcount,
        day:'Sunday',
        available:req.body.pcount,
        booked:'0',
        reset_flag:false,
        alt_flag:false
    })
    }
    user.save()
    return res.redirect('back');

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
            return res.render('search', {
                title:'Search Results',
                doctors: doctors,
                ar:JSON.stringify(ar)
                
            });
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
            return res.render('search', {
                title:'Search Results',
                doctors: doctors,
                ar:JSON.stringify(ar)
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
        return res.render('search', {
            title:'Search Results',
            doctors: doctors,
            ar:JSON.stringify(ar)
        });
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
        return res.render('search', {
            title:'Search Results',
            doctors: doctors,
            ar:JSON.stringify(ar)
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
            var notes;
            if (req.body.type == 'own') {
                notes = {
                    patient_name: req.body.name,
                    patient_age:req.body.age,
                    patient_phone:req.body.phone,
                    patient_address:req.body.address
                }
            }
            if (req.body.type == 'other') {
                notes = {
                    patient_name: req.body.pname,
                    patient_age:req.body.page,
                    patient_phone:req.body.pphone,
                    patient_address:req.body.paddress
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

                let user1 = await User.findById(req.user.id).populate({
                    path:'doctorid',
                    populate:{
                        path:'user'
                    }
                }).populate({
                    path:'doctorids',
                    populate:{
                        path:'doctorid',
                        populate:{
                            path:'user'
                        }
                    }
                });
                let user = await User.findById(user1.doctorid);
                

                if(req.body.flag == 'yes')
                {

                       let n1 = await User.update({ "_id" : user1._id, "booking._id": req.body.bid}, {
                            '$set': {
                                
                                'booking.$.cancel': true
                                
                            }
                        });
                      
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
                            let day = await User.update({ 'schedule_time._id': id }, {
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
                       
                        
                        user1.save();
                        
                      
               return res.redirect('back');

                   
                        
                }

                else{
                    return res.render('staff-booking-page',{
                        title:'Staff Booking Page',
                        doctor:user,
                         user1: user1,
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
        console.log(req.query);
                let user = await User.findById(req.query.doctorid);
                let staff = await User.findById(user.staff_id);
                let user1 = await User.findById(req.user.id);
                

                // if(req.body.flag == 'yes')
                // {

                    const razorpay1 = new Razorpay({
                        key_id: env.razorpay_key_id,
                        key_secret: env.razorpay_key_secret
                        
                    });
                    var refund_amount = req.query.fee - 50 ;

                    const response = await razorpay1.payments.refund(req.query.id,
                        
                        {
                            amount : refund_amount*100,
                            speed : 'optimum',
                            reverse_all : 1
                        });

                    if(response.id && response.payment_id)
                    {
                       let n1 = await User.update({ "_id" : user1._id, "doctors.payment_id": user1.doctors[req.query.index].payment_id }, {
                            '$set': {
                                
                                'doctors.$.cancel': true
                                
                            }
                        });
                        let n2 = await User.update({ "_id" : req.query.doctorid, "patients.payment_id": user1.doctors[req.query.index].payment_id }, {
                            '$set': {
                                
                                'patients.$.cancel': true
                                
                            }
                        });
                        let n3 = await User.update({ "_id" : user.staff_id, "booking.payment_id": user1.doctors[req.query.index].payment_id }, {
                            '$set': {
                                
                                'booking.$.cancel': true
                                
                            }
                        });
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
                            let day = await User.update({ 'schedule_time._id': id }, {
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
                            did:req.query.doctorid
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

                        client.messages
                        .create({
                            body: 'Looks like you had to cancel your Appointment for '+ req.query.date +' at '+ req.query.time + ' with Dr. ' + user.name+ ' at ' +user.clinicname+ ', ' +user.cliniccity+ ', '  +user.clinicaddr+ ', Ph: +91' +staff.phone+ '. If you want to book another appointment, please visit https://aarogyahub.com/doctors',
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
}catch (err) {
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
                        avatar:patient.avatar,
                        city:patient.contacts.city,
                        dob:patient.dob,
                        gender:patient.gender,
                        bloodgroup:patient.bloodgroup,
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
                        davatar:user.avatar,
                        dname:user.name,
                        ddept:user.department,
                        cname:user.clinicname,
                        dsid:user.staff_id,
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
                            gender:patient.gender,
                            time: req.query.time,
                            date: req.query.date,
                            day: req.query.day,
                            fee: req.query.fee,
                            slot: req.query.slotindex,
                            seat: b,
                            did:user._id
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
                        avatar:patient.avatar,
                        city:patient.contacts.city,
                        dob:patient.dob,
                        bloodgroup:patient.bloodgroup,
                        gender:patient.gender,
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
                        davatar:user.avatar,
                        dname:user.name,
                        ddept:user.department,
                        cname:user.clinicname,
                        dsid:user.staff_id,
                        time: req.query.time,
                        dayindex: req.query.dayindex,
                        slotindex: req.query.slotindex,
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
                            gender:patient.gender,
                            type: 'online',
                            time: req.query.time,
                            date: req.query.date,
                            day: req.query.day,
                            fee: req.query.fee,
                            slot: req.query.slotindex,
                            seat: b,
                            did:user._id
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
                    message: 'Your Appointment is confirmed with Dr. ' + user.name + ' on ' + req.query.date + ' at ' + req.query.time,
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
                        body: 'CONFIRMED Appointment for ' + req.query.date + ' at ' + req.query.time + ' with Dr. ' + user.name + '.Your Appointment number is '+ b + '. The clinic details are ' + user.clinicname + ', ' + user.cliniccity + ', ' + user.clinicaddr + ', Ph: +91' + staff.phone + '. Please show this SMS at the clinic front-desk before your appointment.',
                        from: '+12019755459',
                        alphanumeric_id : "AarogyaHub",
                        statusCallback: 'http://postb.in/1234abcd',
                        to: '+91' + req.query.phone
                    })
                    .then(message => console.log(message.sid));
                if (req.query.email) {
                    appointmentAlert.newAlert(req.query.date, req.query.time, req.query.email, user, patient);
                }
                client.messages
                .create({
                    body: 'CONFIRMED Online Appointment : The details of the patient are :- Patient Name - ' + req.query.name + ', Age - ' + req.query.age + ', Phone - ' + req.query.phone + ', Address - ' + req.query.address + '. The appointment details are :- Appointment number - '+ b + ', Date - ' + req.query.date + ', Day - ' + req.query.day + ', Time - ' + req.query.time + ', Fees Paid - ' + req.query.fee + '. Please make sure to ask the online patient to show the appointment success message.',
                    from: '+12019755459',
                    alphanumeric_id : "AarogyaHub",
                    statusCallback: 'http://postb.in/1234abcd',
                    to: '+91' + user.phone
                })
                .then(message => console.log(message.sid));
            if (user.email) {
                appointmentAlert.newDoctorAlert(req.query.name,req.query.age,req.query.phone,req.query.address,b,req.query.date,req.query.day, req.query.time, req.query.fee,user.email);
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
                        city:patient.contacts.city,
                        dob:patient.dob,
                        bloodgroup:patient.bloodgroup,
                        gender:patient.gender,
                        phone: req.query.phone,
                        time: req.query.time,
                        avatar:patient.avatar,
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
                        davatar:user.avatar,
                        dname:user.name,
                        ddept:user.department,
                        cname:user.clinicname,
                        dsid:user.staff_id,
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
                            gender:patient.gender,
                            type: 'online',
                            time: req.query.time,
                            date: req.query.date,
                            day: req.query.day,
                            fee: req.query.fee,
                            seat: k1,
                            did:user._id
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
                        city:patient.contacts.city,
                        dob:patient.dob,
                        bloodgroup:patient.bloodgroup,
                        gender:patient.gender,
                        avatar:patient.avatar,
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
                        davatar:user.avatar,
                        dname:user.name,
                        ddept:user.department,
                        cname:user.clinicname,
                        dsid:user.staff_id,
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
                            gender:patient.gender,
                            date: req.query.date,
                            day: req.query.day,
                            fee: req.query.fee,
                            seat: k1,
                            did:user._id
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
                        body: 'CONFIRMED Appointment for ' + req.query.date + ' at ' + req.query.time + ' with Dr. ' + user.name + '.Your Appointment number is '+ k1 + '. The clinic details are ' + user.clinicname + ', ' + user.cliniccity + ', ' + user.clinicaddr + ', Ph: +91' + staff.phone + '. Please show this SMS at the clinic front-desk before your appointment.',
                        from: '+12019755459',
                        alphanumeric_id : "AarogyaHub",
                        statusCallback: 'http://postb.in/1234abcd',
                        to: '+91' + req.query.phone
                    })
                    .then(message => console.log(message.sid));
                if (req.query.email) {
                    appointmentAlert.newAlert(req.query.date, req.query.time, req.query.email, user, patient);
                }
                client.messages
                .create({
                    body: 'CONFIRMED Online Appointment : The details of the patient are :- Patient Name - ' + req.query.name + ', Age - ' + req.query.age + ', Phone - ' + req.query.phone + ', Address - ' + req.query.address + '. The appointment details are :- Appointment number - '+ k1 + ', Date - ' + req.query.date + ', Day - ' + req.query.day + ', Time - ' + req.query.time + ', Fees Paid - ' + req.query.fee + '. Please make sure to ask the online patient to show the appointment success message.',
                    from: '+12019755459',
                    alphanumeric_id : "AarogyaHub",
                    statusCallback: 'http://postb.in/1234abcd',
                    to: '+91' + user.phone
                })
                .then(message => console.log(message.sid));
            if (user.email) {
                appointmentAlert.newDoctorAlert(req.query.name,req.query.age,req.query.phone,req.query.address,k1,req.query.date,req.query.day, req.query.time, req.query.fee,user.email);
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

module.exports.removeDoctor = async(req, res) => {
    if(req.body.flag == 'yes')
    {
        let staff = await User.findById(req.user.id);
        console.log(req.body)
        if(staff.doctorids.length>1)
        {
            if(staff.doctorids.length == 2)
            {
            let doctor = await User.findById(req.body.did);
            staff.doctorids.pull(req.body.id);
            doctor.staff_flag = false;
            doctor.staff_id = undefined;
            staff.doctorid = staff.doctorids[0].doctorid;
            var id = staff.doctorids[0]._id;
            staff.doctorids.pull(id);
            staff.save();
            doctor.save();
            return res.redirect('back')
            }

            else{
                let doctor = await User.findById(req.body.did);
                staff.doctorids.pull(req.body.id);
                doctor.staff_flag = false;
                doctor.staff_id = undefined;
                staff.doctorid = staff.doctorids[0].doctorid;
                staff.save();
                doctor.save();
                return res.redirect('back')
            }
        }

      
    }

    else{
        return res.redirect('back');
    }
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
        doctorid:req.body.doctorid,
        date: req.body.date,
        flag:true,
        type:'booking'

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
   
    if(user.type == 'Staff')
    {
        let staff = await User.findById(req.user.id);
        let sdoctor = await User.findById(staff.doctorid);
        if(staff)
        {
            // let prope1 = await User.deleteOne({ _id: user.staff_id });
            staff.temp_phone = staff.phone;
            staff.phone = "";
            staff.password = "";
            sdoctor.staff_id = undefined ;
            sdoctor.staff_flag = false;
            staff.save();
            sdoctor.save();
            
        }



        req.flash('success', 'Account removed Successfully');


        return res.redirect('/user/logout');

    }

    if (user.type == 'Doctor') {

        let staff = await User.findById(user.staff_id);
        if(staff)
        {
            // let prope1 = await User.deleteOne({ _id: user.staff_id });
            staff.temp_phone = staff.phone;
            staff.phone = "";
            staff.password = "";
            
        }

        if (user.clinicphoto) {
            for (let i = 0; i < user.clinicphoto.length; i++) {
                if (fs.existsSync(path.join(__dirname, '..', user.clinicphoto[i]))) {
                    fs.unlinkSync(path.join(__dirname, '..', user.clinicphoto[i]));
                }
            }
        }
        user.temp_phone = user.phone;
        user.temp_email = user.email; 
        user.phone = "";
        user.email = "";
        user.password = "";
        user.booking_service = false;
        user.approve1 = false;
        user.approve2 = false;
        user.accountid = "";


        user.save();
        staff.save();
        req.flash('success', 'Account removed Successfully');


        return res.redirect('/user/logout');

    }

    if(user.type == 'Patient')
    {

    if(user.avatar)

    {

if (fs.existsSync(path.join(__dirname, '..', user.avatar))) {
    fs.unlinkSync(path.join(__dirname, '..', user.avatar));
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

module.exports.oldCheckout = async(req, res) => {


    let doctor = await User.findById(req.body.doctorid);
    let user = await User.findById(req.user.id);
    user.refresh_flag = true;
    user.save();

    if (req.isAuthenticated()) {

        return res.render('old-checkout', {
            title: 'Checkout',
            booked: req.body.booked,
            available: req.body.available,
            slotindex: req.body.slotindex,
            dayindex: req.body.dayindex,
            id: req.body.id,
            doctor: doctor,
            type:req.query.type,
            date: req.body.date,
            flag: true,
            n:req.query.n,
            fixed:req.body.fixed
            
        });


    } else {

        return res.redirect('/login')
    }
}

module.exports.staffOldCheckout = async(req, res) => {


    let doctor = await User.findById(req.body.doctorid);
    let user = await User.findById(req.user.id);
    user.refresh_flag = true;
    user.save();

    if (req.isAuthenticated()) {

        return res.render('staff-old-checkout', {
            title: 'Checkout',
            booked: req.body.booked,
            available: req.body.available,
            slotindex: req.body.slotindex,
            dayindex: req.body.dayindex,
            id: req.body.id,
            doctor: doctor,
            date: req.body.date,
            flag: true,
            fixed:req.body.fixed
            
        });


    } else {

        return res.redirect('/login')
    }
}




module.exports.offlinePay = async(req, res) => {
    let staff = await User.findById(req.user.id);
    let user;
    if(req.query.id)
    {
        user = await User.findById(req.query.id);

    }else{
        user = await User.findById(req.body.doctorid);
    }
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
                    seat: b,
                    gender:req.body.gender,
                    did:user._id
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
                // req.flash('success',`Seat booked successfully of ${req.body.name} for date : ${req.body.date} . The Appointment No. is ${b} `)
                // res.redirect(`/staff-booking/?id=${user._id}`)

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
                    gender:req.body.gender,
                    dayindex: req.body.dayindex,
                    fee: req.body.fee,
                    seat: k1,
                    did:user._id
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
                // req.flash('success',`Seat booked successfully of ${req.body.name} for date : ${req.body.date} . The Appointment No. is ${k1} `)
               
                // res.redirect(`/staff-booking/?id=${user._id}`)

            }
        } else {
            return res.redirect(`/staff-booking/?id=${req.query.id}`);

        }



    } else {
        return res.redirect('/staff-login-page');
    }

}

module.exports.oldOfflinePay = async(req, res) => {
    let staff = await User.findById(req.user.id);
    let user = await User.findById(req.body.doctorid);
    if (req.user.type == 'Staff') {
        if (staff.refresh_flag == true) {
            if(req.body.fixed == 'true'){
            if (typeof(staff.old_schedule_time[req.body.dayindex].start) == 'object') {
                let available = [];
                let booked = [];
                let k = req.body.slotindex;
                let i = req.body.available.split(',');
                let a = parseInt(i[k]);
                a = a - 1;
                for (var temp = 0; temp <staff.old_schedule_time[req.body.dayindex].start.length; temp++) {
                    if (temp == k) {
                        available.push(a);
                        continue;
                    }
                    var temp1 = parseInt(i[temp]);
                    available.push(temp1);
                }
                let j = req.body.booked.split(',');
                let bd = staff.old_schedule_time[req.body.dayindex].booked[req.body.slotindex];
                let b = parseInt(bd);
                b = b + 1;
                for (var temp = 0; temp < staff.old_schedule_time[req.body.dayindex].start.length; temp++) {
                    if (temp == req.body.slotindex) {
                        booked.push(b);
                        continue;
                    }
                    var temp1 = parseInt(j[temp]);
                    booked.push(temp1);
                }
                let day = await User.update({ 'old_schedule_time._id': req.body.id }, {
                    '$set': {
                        'old_schedule_time.$.booked': booked
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
                    old_flag:true,
                    time: req.body.time,
                    date: req.body.date,
                    day: req.body.day,
                    slot: req.body.slotindex,
                    dayindex: req.body.dayindex,
                    fee: req.body.fee,
                    seat: b,
                    gender:req.body.gender,
                    did:user._id
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

            if (typeof(staff.old_schedule_time[req.body.dayindex].start) == 'string') {
                let bd1 = staff.old_schedule_time[req.body.dayindex].booked;
                let k1 = parseInt(bd1);
                k1 += 1;
                var k2 = parseInt(req.body.available);
                k2 -= 1;


                let day = await User.update({ 'old_schedule_time._id': req.body.id }, {
                    '$set': {
                        'old_schedule_time.$.booked': k1
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
                    old_flag:true,
                    time: req.body.time,
                    date: req.body.date,
                    day: req.body.day,
                    gender:req.body.gender,
                    dayindex: req.body.dayindex,
                    fee: req.body.fee,
                    seat: k1,
                    did:user._id
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



                return res.render('staff-old-booking-success', {
                    doctor: user,
                    title: 'Booking-Success',
                    seat: k1,
                    slotindex: req.body.slotindex,
                    dayindex: req.body.dayindex,
                    date: req.body.date,

                });

            }
        }
        else{
         
                let bd1 = staff.old_schedule_time_fixed[req.body.dayindex].booked;
                let k1 = parseInt(bd1);
                k1 += 1;
                var k2 = parseInt(req.body.available);
                k2 -= 1;


                let day = await User.update({ 'old_schedule_time_fixed._id': req.body.id }, {
                    '$set': {
                        'old_schedule_time_fixed.$.booked': k1
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
                    old_flag:true,
                    time: req.body.time,
                    date: req.body.date,
                    day: req.body.day,
                    gender:req.body.gender,
                    dayindex: req.body.dayindex,
                    fee: req.body.fee,
                    seat: k1,
                    did:user._id
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



                return res.render('staff-old-booking-success', {
                    doctor: user,
                    title: 'Booking-Success',
                    seat: k1,
                    slotindex: req.body.slotindex,
                    dayindex: req.body.dayindex,
                    date: req.body.date,

                });

            
        }
        } else {
            return res.redirect(`/old-booking/?id=${req.user.doctorid}`);

        }



    } else {
        return res.redirect('/staff-login-page');
    }

}


module.exports.bookOldAppointment = async(req, res) => {
    let staff = await User.findById(req.user.id);
    let user = await User.findById(req.body.doctorid);
    let user1 = await User.findById(user.staff_id);
    console.log(req.body.type)
  
        if (staff.refresh_flag == true) {
            console.log('hi',req.body.fixed)
            if(req.body.fixed == 'false'){
            if (typeof(user1.old_schedule_time[req.body.dayindex].start) == 'object') {
                let available = [];
                let booked = [];
                let k = req.body.slotindex;
                let i = req.body.available.split(',');
                let a = parseInt(i[k]);
                a = a - 1;
                for (var temp = 0; temp < user1.old_schedule_time[req.body.dayindex].start.length; temp++) {
                    if (temp == k) {
                        available.push(a);
                        continue;
                    }
                    var temp1 = parseInt(i[temp]);
                    available.push(temp1);
                }
                let j = req.body.booked.split(',');
                let bd = user1.old_schedule_time[req.body.dayindex].booked[req.body.slotindex];
                let b = parseInt(bd);
                b = b + 1;
                for (var temp = 0; temp < user1.old_schedule_time[req.body.dayindex].start.length; temp++) {
                    if (temp == req.body.slotindex) {
                        booked.push(b);
                        continue;
                    }
                    var temp1 = parseInt(j[temp]);
                    booked.push(temp1);
                }
                let day = await User.update({ 'old_schedule_time._id': req.body.id }, {
                    '$set': {
                        'old_schedule_time.$.booked': booked
                            //   'schedule_time.$.available': available,

                    }
                });
                if (req.body.type == 'own') {
                user.patients.push({
                    payment_id: 'none',
                    cancel: false,
                    pid: req.user.id,
                    avatar:staff.avatar,
                    city:staff.contacts.city,
                    dob:staff.dob,
                    gender:staff.gender,
                    bloodgroup:staff.bloodgroup,
                    name: req.body.name,
                    old_flag:true,
                    email: req.body.email,
                    phone: req.body.phone,
                    time: req.body.time,
                    date: req.body.date,
                    day: req.body.day,
                    fee: req.body.fee,
                    type: req.body.type,
                    seat: b

                });
                staff.doctors.push({
                    payment_id: 'none',
                    cancel: false,
                    did: user._id,
                    davatar:user.avatar,
                    dname:user.name,
                    ddept:user.department,
                    cname:user.clinicname,
                    dsid:user.staff_id,
                    old_flag:true,
                    name: req.body.name,
                    email: req.body.email,
                    dayindex: req.body.dayindex,
                    slotindex: req.body.slotindex,
                    phone: req.body.phone,
                    time: req.body.time,
                    date: req.body.date,
                    day: req.body.day,
                    fee: req.body.fee,
                    type: req.body.type,
                    seat: b

                });
                user1.booking.push({
                    name: req.body.name,
                    address: req.body.address,
                    phone: req.body.phone,
                    age: req.body.age,
                    cancel: false,
                    type: 'online',
                    time: req.body.time,
                    date: req.body.date,
                    day: req.body.day,
                    old_flag:true,
                    slot: req.body.slotindex,
                    dayindex: req.body.dayindex,
                    fee: req.body.fee,
                    seat: b,
                    gender:req.body.gender,
                    did:user._id
                });
            
            }else{
                user.patients.push({
                    payment_id: 'none',
                    cancel: false,
                    pid: req.user.id,
                    avatar:staff.avatar,
                    city:staff.contacts.city,
                    dob:staff.dob,
                    gender:staff.gender,
                    bloodgroup:staff.bloodgroup,
                    name: req.body.name,
                    old_flag:true,
                    email: req.body.email,
                    phone: req.body.phone,
                    time: req.body.time,
                    date: req.body.date,
                    day: req.body.day,
                    fee: req.body.fee,
                    type: req.body.type,
                    seat: b

                });
                staff.doctors.push({
                    payment_id: 'none',
                    cancel: false,
                    did: user._id,
                    davatar:user.avatar,
                    dname:user.name,
                    ddept:user.department,
                    cname:user.clinicname,
                    dsid:user.staff_id,
                    old_flag:true,
                    name: req.body.name,
                    email: req.body.email,
                    dayindex: req.body.dayindex,
                    slotindex: req.body.slotindex,
                    phone: req.body.phone,
                    time: req.body.time,
                    date: req.body.date,
                    day: req.body.day,
                    fee: req.body.fee,
                    type: req.body.type,
                    seat: b

                });
                user1.booking.push({
                    name: req.body.name,
                    address: req.body.address,
                    phone: req.body.phone,
                    age: req.body.age,
                    cancel: false,
                    type: 'online',
                    time: req.body.time,
                    date: req.body.date,
                    day: req.body.day,
                    old_flag:true,
                    slot: req.body.slotindex,
                    dayindex: req.body.dayindex,
                    fee: req.body.fee,
                    seat: b,
                    gender:req.body.gender,
                    did:user._id
                });
            }
               
                staff.refresh_flag = false;
              
                user1.save();
                staff.save();
                user.save();


                  client.messages
                  .create({
                     body: 'CONFIRMED Free Consultation Appointment for '+ req.body.date +' at '+ req.body.time + ' with Dr. ' + user.name+ '. The clinic details are ' +user.clinicname+ ', ' +user.cliniccity+ ', '  +user.clinicaddr+ ', Ph: +91' +user1.phone+ '. Please show this SMS at the clinic front-desk before your appointment.',
                     from: '+12019755459',
                     statusCallback: 'http://postb.in/1234abcd',
                     to: '+91'+req.body.phone
                   })
                  .then(message => console.log(message.sid)); 
                  if (req.body.email) {
                    appointmentAlert.newAlert(req.body.date, req.body.time, req.body.email, user, staff);
                }    
                console.log(req.body.date)
                return res.render('staff-booking-success', {
                    doctor: user,
                    title: 'Booking-Success',
                    seat: b,
                    slotindex: req.body.slotindex,
                    dayindex: req.body.dayindex,
                    date: req.body.date,
                    flag:true
                });

            }

            if (typeof(user1.old_schedule_time[req.body.dayindex].start) == 'string') {
                let bd1 = user1.old_schedule_time[req.body.dayindex].booked;
                let k1 = parseInt(bd1);
                k1 += 1;
                var k2 = parseInt(req.body.available);
                k2 -= 1;


                let day12 = await User.update({ 'old_schedule_time._id': req.body.id }, {
                    '$set': {
                        'old_schedule_time.$.booked': k1
                            //   'schedule_time.$.available': k2,
                            

                    }
                   
                });
                console.log(k1);

                if (req.body.type == 'own') {
                    user.patients.push({
                        payment_id: 'none',
                        cancel: false,
                        pid: req.user.id,
                        avatar:staff.avatar,
                        city:staff.contacts.city,
                        dob:staff.dob,
                        gender:staff.gender,
                        bloodgroup:staff.bloodgroup,
                        name: req.body.name,
                        old_flag:true,
                        email: req.body.email,
                        phone: req.body.phone,
                        time: req.body.time,
                        date: req.body.date,
                        day: req.body.day,
                        fee: req.body.fee,
                        type: req.body.type,
                        seat: k1
    
                    });
                    staff.doctors.push({
                        payment_id: 'none',
                        cancel: false,
                        did: user._id,
                        davatar:user.avatar,
                        dname:user.name,
                        ddept:user.department,
                        cname:user.clinicname,
                        dsid:user.staff_id,
                        old_flag:true,
                        name: req.body.name,
                        email: req.body.email,
                        dayindex: req.body.dayindex,
                        // slotindex: req.body.slotindex,
                        phone: req.body.phone,
                        time: req.body.time,
                        date: req.body.date,
                        day: req.body.day,
                        fee: req.body.fee,
                        type: req.body.type,
                        seat: k1
    
                    });
                    user1.booking.push({
                        name: req.body.name,
                        address: req.body.address,
                        phone: req.body.phone,
                        age: req.body.age,
                        cancel: false,
                        type: 'online',
                        time: req.body.time,
                        date: req.body.date,
                        day: req.body.day,
                        old_flag:true,
                        // slot: req.body.slotindex,
                        dayindex: req.body.dayindex,
                        fee: req.body.fee,
                        seat: k1,
                        gender:req.body.gender,
                        did:user._id
                    });
                
                }else{
                    user.patients.push({
                        payment_id: 'none',
                        cancel: false,
                        pid: req.user.id,
                        avatar:staff.avatar,
                        city:staff.contacts.city,
                        dob:staff.dob,
                        gender:staff.gender,
                        bloodgroup:staff.bloodgroup,
                        name: req.body.name,
                        old_flag:true,
                        email: req.body.email,
                        phone: req.body.phone,
                        time: req.body.time,
                        date: req.body.date,
                        day: req.body.day,
                        fee: req.body.fee,
                        type: req.body.type,
                        seat: k1
    
                    });
                    staff.doctors.push({
                        payment_id: 'none',
                        cancel: false,
                        did: user._id,
                        davatar:user.avatar,
                        dname:user.name,
                        ddept:user.department,
                        cname:user.clinicname,
                        dsid:user.staff_id,
                        old_flag:true,
                        name: req.body.name,
                        email: req.body.email,
                        dayindex: req.body.dayindex,
                        // slotindex: req.body.slotindex,
                        phone: req.body.phone,
                        time: req.body.time,
                        date: req.body.date,
                        day: req.body.day,
                        fee: req.body.fee,
                        type: req.body.type,
                        seat: k1
    
                    });
                    user1.booking.push({
                        name: req.body.name,
                        address: req.body.address,
                        phone: req.body.phone,
                        age: req.body.age,
                        cancel: false,
                        type: 'online',
                        time: req.body.time,
                        date: req.body.date,
                        day: req.body.day,
                        old_flag:true,
                        // slot: req.body.slotindex,
                        dayindex: req.body.dayindex,
                        fee: req.body.fee,
                        seat: k1,
                        gender:req.body.gender,
                        did:user._id
                    });
                }
                   
                    staff.refresh_flag = false;
                   
                    user1.save();
                    staff.save();
                    user.save();
    
    
                      client.messages
                      .create({
                         body: 'CONFIRMED Free Consultation Appointment for '+ req.body.date +' at '+ req.body.time + ' with Dr. ' + user.name+ '. The clinic details are ' +user.clinicname+ ', ' +user.cliniccity+ ', '  +user.clinicaddr+ ', Ph: +91' +user1.phone+ '. Please show this SMS at the clinic front-desk before your appointment.',
                         from: '+12019755459',
                         statusCallback: 'http://postb.in/1234abcd',
                         to: '+91'+req.body.phone
                       })
                      .then(message => console.log(message.sid)); 
                      if (req.body.email) {
                        appointmentAlert.newAlert(req.body.date, req.body.time, req.body.email, user, staff);
                    }    
    

                    console.log('id is',req.body.id);
                return res.render('staff-booking-success', {
                    doctor: user,
                    title: 'Booking-Success',
                    seat: k1,
                    old_flag:true,
                    dayindex: req.body.dayindex,
                    date: req.body.date,
                    flag:true
                });

            }
        }
        else{
            console.log('hii',req.body.fixed)
                let bd1 = user1.old_schedule_time_fixed[req.body.dayindex].booked;
                let k1 = parseInt(bd1);
                k1 += 1;
                var k2 = parseInt(req.body.available);
                k2 -= 1;


                user1.old_schedule_time_fixed[req.body.dayindex].booked = k1;
                console.log(k1);

                if (req.body.type == 'own') {
                    user.patients.push({
                        payment_id: 'none',
                        cancel: false,
                        pid: req.user.id,
                        avatar:staff.avatar,
                        city:staff.contacts.city,
                        dob:staff.dob,
                        gender:staff.gender,
                        bloodgroup:staff.bloodgroup,
                        name: req.body.name,
                        old_flag:true,
                        email: req.body.email,
                        phone: req.body.phone,
                        time: req.body.time,
                        date: req.body.date,
                        day: req.body.day,
                        fee: req.body.fee,
                        type: req.body.type,
                        seat: k1
    
                    });
                    staff.doctors.push({
                        payment_id: 'none',
                        cancel: false,
                        did: user._id,
                        davatar:user.avatar,
                        dname:user.name,
                        ddept:user.department,
                        cname:user.clinicname,
                        dsid:user.staff_id,
                        old_flag:true,
                        name: req.body.name,
                        email: req.body.email,
                        dayindex: req.body.dayindex,
                        // slotindex: req.body.slotindex,
                        phone: req.body.phone,
                        time: req.body.time,
                        date: req.body.date,
                        day: req.body.day,
                        fee: req.body.fee,
                        type: req.body.type,
                        seat: k1
    
                    });
                    user1.booking.push({
                        name: req.body.name,
                        address: req.body.address,
                        phone: req.body.phone,
                        age: req.body.age,
                        cancel: false,
                        type: 'online',
                        time: req.body.time,
                        date: req.body.date,
                        day: req.body.day,
                        old_flag:true,
                        // slot: req.body.slotindex,
                        dayindex: req.body.dayindex,
                        fee: req.body.fee,
                        seat: k1,
                        gender:req.body.gender,
                        did:user._id
                    });
                
                }else{
                    user.patients.push({
                        payment_id: 'none',
                        cancel: false,
                        pid: req.user.id,
                        avatar:staff.avatar,
                        city:staff.contacts.city,
                        dob:staff.dob,
                        gender:staff.gender,
                        bloodgroup:staff.bloodgroup,
                        name: req.body.name,
                        old_flag:true,
                        email: req.body.email,
                        phone: req.body.phone,
                        time: req.body.time,
                        date: req.body.date,
                        day: req.body.day,
                        fee: req.body.fee,
                        type: req.body.type,
                        seat: k1
    
                    });
                    staff.doctors.push({
                        payment_id: 'none',
                        cancel: false,
                        did: user._id,
                        davatar:user.avatar,
                        dname:user.name,
                        ddept:user.department,
                        cname:user.clinicname,
                        dsid:user.staff_id,
                        old_flag:true,
                        name: req.body.name,
                        email: req.body.email,
                        dayindex: req.body.dayindex,
                        // slotindex: req.body.slotindex,
                        phone: req.body.phone,
                        time: req.body.time,
                        date: req.body.date,
                        day: req.body.day,
                        fee: req.body.fee,
                        type: req.body.type,
                        seat: k1
    
                    });
                    user1.booking.push({
                        name: req.body.name,
                        address: req.body.address,
                        phone: req.body.phone,
                        age: req.body.age,
                        cancel: false,
                        type: 'online',
                        time: req.body.time,
                        date: req.body.date,
                        day: req.body.day,
                        old_flag:true,
                        // slot: req.body.slotindex,
                        dayindex: req.body.dayindex,
                        fee: req.body.fee,
                        seat: k1,
                        gender:req.body.gender,
                        did:user._id
                    });
                }
                   
                    staff.refresh_flag = false;
                   
                    user1.save();
                    staff.save();
                    user.save();
    
    
                      client.messages
                      .create({
                         body: 'CONFIRMED Free Consultation Appointment for '+ req.body.date +' at '+ req.body.time + ' with Dr. ' + user.name+ '. The clinic details are ' +user.clinicname+ ', ' +user.cliniccity+ ', '  +user.clinicaddr+ ', Ph: +91' +user1.phone+ '. Please show this SMS at the clinic front-desk before your appointment.',
                         from: '+12019755459',
                         statusCallback: 'http://postb.in/1234abcd',
                         to: '+91'+req.body.phone
                       })
                      .then(message => console.log(message.sid)); 
                      if (req.body.email) {
                        appointmentAlert.newAlert(req.body.date, req.body.time, req.body.email, user, staff);
                    }    
    

                    console.log('id is',req.body.id);
                return res.render('staff-booking-success', {
                    doctor: user,
                    title: 'Booking-Success',
                    seat: k1,
                    old_flag:true,
                    dayindex: req.body.dayindex,
                    date: req.body.date,
                    flag:true
                });

            
        }
        } else {
            return res.redirect('/my-appointments');

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
    let user = await User.findById(req.query.id);
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
    
    if(req.body.flag)
    {
        if(typeof(req.body.start) == 'string')
        {
            let day = await User.update({ 'schedule_time._id': req.body.id }, {
                '$set': {
                    'schedule_time.$.start': req.body.start,
                    'schedule_time.$.end': req.body.end,
                    'schedule_time.$.max_count': req.body.max_count,
                    'schedule_time.$.available': req.body.max_count
                }
            });
        
        }

        if(typeof(req.body.start) == 'object')
        { 
            let ar = [];
            console.log('index is',req.body.index);
           let user = await User.findById(req.user.id);
           if(typeof(user.schedule_time[req.body.index].booked) == 'string' || typeof(user.schedule_time[req.body.index].booked) == 'number')
           {
            
            ar.push(user.schedule_time[req.body.index].booked);
            for(let i=0;i<req.body.start.length-1;i++)
            {
                ar.push(0);
            }
           }
           if(typeof(user.schedule_time[req.body.index].booked) == 'object')
           {
            ar = user.schedule_time[req.body.index].booked;
            for(let i=0;i<req.body.start.length-user.schedule_time[req.body.index].booked.length;i++)
            {
                ar.push(0);
            }
           }

            let day = await User.update({ 'schedule_time._id': req.body.id }, {
                '$set': {
                    'schedule_time.$.start': req.body.start,
                    'schedule_time.$.end': req.body.end,
                    'schedule_time.$.max_count': req.body.max_count,
                    'schedule_time.$.available': req.body.max_count,
                    'schedule_time.$.booked': ar


                }
            });
        
        }
    }

    else{
    let day = await User.update({ 'schedule_time._id': req.body.id }, {
        '$set': {
            'schedule_time.$.start': req.body.start,
            'schedule_time.$.end': req.body.end,
            'schedule_time.$.max_count': req.body.max_count,
            'schedule_time.$.available': req.body.max_count
        }
    });

}


    return res.redirect('back');

}
module.exports.staffUpdateSchedule = async function(req, res) {


    if ((!req.body.start) || (!req.body.end)) {
        let user = await User.findById(req.query.id);
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
module.exports.staffOldUpdateSchedule = async function(req, res) {

    let user = await User.findById(req.user.id);
    if ((!req.body.start) || (!req.body.end)) {
      
        user.old_schedule_time.pull({ _id: req.body.id });
        user.save();
        return res.redirect('back');
    }
    let day = await User.update({ 'old_schedule_time._id': req.body.id }, {
        '$set': {
            'old_schedule_time.$.start': req.body.start,
            'old_schedule_time.$.end': req.body.end,
            'old_schedule_time.$.max_count': user.oldp.pcount,
            'old_schedule_time.$.available': user.oldp.pcount
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
            booked: 0,
            reset_flag:false,
            alt_flag:false
        })
    }

    if (typeof(req.body.start) == 'object') {
        user.schedule_time.push({
            day: req.body.day,
            start: req.body.start,
            end: req.body.end,
            max_count: req.body.max_count,
            available: req.body.max_count,
            booked: ['0', '0'],
            reset_flag:false,
            alt_flag:false
        });

    }



    user.save();
    console.log(req.body);

    return res.redirect('back');

}

module.exports.staffSetScheduleTiming = async function(req, res) {

    var user;
    if(req.user.doctorids.length>0)
    {
        user = await User.findById(req.query.id);
    }
    else{

    user = await User.findById(req.user.doctorid);
    }




    if (typeof(req.body.start) == 'string') {
        user.schedule_time.push({
            start: req.body.start,
            end: req.body.end,
            day: req.body.day,
            max_count: req.body.max_count,
            available: req.body.max_count,
            booked: 0,
            reset_flag:false,
            alt_flag:false
        })
    }

    if (typeof(req.body.start) == 'object') {
        user.schedule_time.push({
            day: req.body.day,
            start: req.body.start,
            end: req.body.end,
            max_count: req.body.max_count,
            available: req.body.max_count,
            booked: ['0', '0'],
            reset_flag:false,
            alt_flag:false
        });

    }



    user.save();
    console.log(req.body);

    return res.redirect('back');

}
module.exports.staffSetOldScheduleTiming = async function(req, res) {

    let user = await User.findById(req.user.id);




    if (typeof(req.body.start) == 'string') {
        user.old_schedule_time.push({
            start: req.body.start,
            end: req.body.end,
            day: req.body.day,
            max_count: user.oldp.pcount,
            available: user.oldp.pcount,
            booked: 0,
            reset_flag:false,
            alt_flag:false
        })
    }

    if (typeof(req.body.start) == 'object') {
        user.old_schedule_time.push({
            day: req.body.day,
            start: req.body.start,
            end: req.body.end,
            max_count: user.oldp.pcount,
            available: user.oldp.pcount,
            booked: ['0', '0'],
            reset_flag:false,
            alt_flag:false
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
                if (fs.existsSync(path.join(__dirname, '..', user.idproof))) {

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
                if (fs.existsSync(path.join(__dirname, '..', user.idproof))) {
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

                if (fs.existsSync(path.join(__dirname, '..', user.degreephoto))) {
                    fs.unlinkSync(path.join(__dirname, '..', user.degreephoto));
                }
                user.degreephoto = User.avatarPath + '/' + req.files['avatar'][0].filename;
            }
        }

       

        user.save();

    });
    return res.redirect('/upload-eproof');

}

module.exports.uploadEProof = async function(req, res) {
    let user = await User.findById(req.user.id);

    User.uploadedAvatar(req, res, function(err) {

        if (req.files['avatar']) {
            if (!user.estphoto) {
                user.estphoto = User.avatarPath + '/' + req.files['avatar'][0].filename;
            } else {

                if (fs.existsSync(path.join(__dirname, '..', user.estphoto))) {
                    fs.unlinkSync(path.join(__dirname, '..', user.estphoto));
                }
                user.estphoto = User.avatarPath + '/' + req.files['avatar'][0].filename;
            }
        }

        if (user.degreephoto) {
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
    let patients = await User.findById(req.user.id).
    populate({
        path:'doctorid',
        populate:{
            path:'user'
        }
    }).populate({
        path:'doctorids',
        populate:{
            path:'doctorid',
            populate:{
                path:'user'
            }
        }
    });;
    const date = req.body.date;
    const str = date.split("/").join("-");
    console.log(str);

    if (req.body.flag == 'true') {
        
        let doctor = await User.findById(req.user.doctorid);
        let user1 = await User.findById(req.user.id).populate('doctorid').populate({
            path:'doctorids',
            populate:{
                path:'doctorid',
                populate:{
                    path:'user'
                }
            }
        });;

        return res.render('staff-booking-page', {
            title: 'Book Appointment',
            doctor: doctor,
            doctor1: doctor,
            daten: str,
            user1: user1
        })
    } else {
        let user1;
        if(req.query.id)
        {
        user1 = await User.findById(req.query.id);
        }
        return res.render('staff-dashboard', {
            title: 'My Dashboard',
            allpatients: patients,
            date: str,
            user1:user1
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
    let staff = await User.findById(patients.staff_id);



    return res.render('doctor-dashboard', {
        title: 'My Dashboard',
        allpatients: patients,
        date: str,
        staff:staff
    })


}

module.exports.profileUpdate = async function(req, res) {

    try {


        let user = await User.findById(req.user.id);
        User.uploadedAvatar(req, res, function(err) {
            if (err) { console.log('*******Multer Error', err); return; }

            console.log(req.body);
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

            console.log(req.body)

            user.services = req.body.services;
            user.specialisation = req.body.specialisation;
            user.clinicname = req.body.clinicname;
            user.clinicaddr = req.body.clinicaddr;
            user.department = req.body.department;
            user.name = req.body.name;
            user.phone = req.body.phone;
            user.gender = req.body.gender;
            user.dob = req.body.dob;
            user.wexperience = req.body.wexperience,
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
                        designation: req.body.designation[i],
                        excity:req.body.excity[i]
                    });
                }
            }


            if (typeof(req.body.institutionname) == 'string' && req.body.institutionname != '') {
                user.experience.push({
                    institutionname: req.body.institutionname,
                    from: req.body.from,
                    to: req.body.to,
                    designation: req.body.designation,
                    excity:req.body.excity
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