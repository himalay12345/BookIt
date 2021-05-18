const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const AVATAR_PATH = path.join('/uploads/speciality/avatars');
const newpath = path.join(__dirname, '..', AVATAR_PATH);
if (!fs.existsSync(newpath)) {
    fs.mkdirSync(newpath, { recursive: true });
}

const specialitySchema = mongoose.Schema({
    department: {
        type: String
    },
    description: {
        type: String
    },
    avatar: {
        type: String

    },
    createdAt:{type: Date, default: Date.now}

});
let storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, path.join(__dirname, '..', AVATAR_PATH));
    },
    filename: function(req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now());
    }
});

//static function
specialitySchema.statics.uploadedAvatar = multer({ storage: storage }).single('avatar');

specialitySchema.statics.avatarPath = AVATAR_PATH;

const Specialities = mongoose.model('Specialities', specialitySchema);
module.exports = Specialities;