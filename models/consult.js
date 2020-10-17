const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const AVATAR_PATH = path.join('/uploads/consult/avatars');
const newpath = path.join(__dirname, '..', AVATAR_PATH);
if (!fs.existsSync(newpath)) {
    fs.mkdirSync(newpath, { recursive: true });
}

const consultSchema = mongoose.Schema({
    consultname: {
        type: String
    },
    consultprice: {
        type: String
    },
    consultid: {
        type: String
    },
    consultspecialisation: {
        type: String

    },

    consultavatar: {
        type: String

    },

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
consultSchema.statics.uploadedAvatar = multer({ storage: storage }).single('avatar');

consultSchema.statics.avatarPath = AVATAR_PATH;

const Consult = mongoose.model('Consult', consultSchema);
module.exports = Consult;