const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path');
const AVATAR_PATH = path.join('/uploads/patient/avatars');

const patientSchema = mongoose.Schema({
    name: {
        type: String
    },
    dob: {
        type: String
    },
    bloodgroup: {
        type: String
    },
    gender:{
        type:String
    },
    address: {
        type: String
    },
    city: {
        type: String
    },
    state: {
        type: String
    },
    pincode: {
        type: Number
    },
    service:{
        type:String
    },
    country: {
        type: String
    },
    avatar: {
        type: String
    },
    phone: {
        type: Number
    },
    email: {
        type: String
    },
    password: {
        type: String
    },
    fbid: {
        type: String
    }
}, { timestamps: true });
let storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, path.join(__dirname, '..', AVATAR_PATH));
    },
    filename: function(req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now());
    }
});

//static function
patientSchema.statics.uploadedAvatar = multer({ storage: storage }).single('avatar');
patientSchema.statics.avatarPath = AVATAR_PATH;

const Patient = mongoose.model('Patient', patientSchema);
module.exports = Patient;