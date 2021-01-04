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
    data.push({
       doctors,
       consults,
       tests
    });

    res.status(200).json(data);
}
