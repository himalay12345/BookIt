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
    let doctor = await User.find({ type: "Doctor", approve1: true, approve2: true, booking_service: true ,department:req.query.id});
 
    let doctors = [];
    
    for (i of doctor) {
        doctors.push( {
            name: i.name,
            experience:i.wexperience,
            department: i.department,
            education:i.education,
            rating:i.reviews,
            fee:i.booking_fee,
            clinicaddr:i.clinicaddr,
            id: i.id,
            staff_flag:true,
            avatar: i.avatar,
           
        });
    }

   

    res.json({
        doctors:doctors
    });
}
