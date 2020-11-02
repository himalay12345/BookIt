const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const AVATAR_PATH = path.join('/uploads/admin/avatars');
const newpath = path.join(__dirname, '..', AVATAR_PATH);
if (!fs.existsSync(newpath)) {
    fs.mkdirSync(newpath, { recursive: true });
}
const adminSchema = mongoose.Schema({
    name: {
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
    avatar: {
        type: String

    },
    master_password: {
        type: String
    },
    root_user: {
        type: Boolean

    }

},{timestamps:true});
let storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, path.join(__dirname, '..', AVATAR_PATH));
    },
    filename: function(req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now());
    }
});

//static function
adminSchema.statics.uploadedAvatar = multer({ storage: storage }).single('avatar');

adminSchema.statics.avatarPath = AVATAR_PATH;

const Admin = mongoose.model('Admin', adminSchema);
module.exports = Admin;