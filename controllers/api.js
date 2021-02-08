const User = require('../models/user');
const Test = require('../models/test');
const Consult = require('../models/consult');


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
            fee:i.booking_fee
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
