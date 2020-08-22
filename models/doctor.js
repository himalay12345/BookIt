const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path');
const AVATAR_PATH = path.join('/uploads/doctor/avatars');

const doctorSchema = mongoose.Schema({
    name: {
        type: String
    },
    dob: {
        type: String
    },
    bloodgroup: {
        type: String
    },
    gender: {
        type: String
    },
    type: {
        type: String
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
    service: {
        type: String
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
    },
    twitterid: {
        type: String
    },
    clinicname: {
        type: String
    },
    clinicaddr: {
        type: String
    },
    degree: {
        type: String
    },
    institutionname: {
        type: String
    },
    from: {
        type: Number
    },
    to: {
        type: Number
    },
    designation: {
        type: String

    },
    awards: {
        type: String

    },
    year: {
        type: Number
    },
    specialisation: {
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
doctorSchema.statics.uploadedAvatar = multer({ storage: storage }).single('avatar');
doctorSchema.statics.avatarPath = AVATAR_PATH;

const Doctor = mongoose.model('Doctor', doctorSchema);
module.exports = Doctor;