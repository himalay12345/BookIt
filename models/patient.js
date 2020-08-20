const mongoose = require('mongoose');

const patientSchema = mongoose.Schema({
    name:{
        type:String
    },
    phone:{
        type:Number
    },
    email:{
        type:String
    },
    password:{
        type:String
    },
    fbid:{
        type:String
    }
},{timestamps:true});

const Patient = mongoose.model('Patient',patientSchema);
module.exports = Patient;