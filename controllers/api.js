const User = require('../models/user');
const Test = require('../models/test');
const Consult = require('../models/consult');



module.exports.doctorProfile = async (req, res) => {
    let i = await User.findById(req.body.id);
 
   

  
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



