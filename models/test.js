const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const AVATAR_PATH = path.join('/uploads/test/avatars');
const newpath = path.join(__dirname, '..', AVATAR_PATH);
if (!fs.existsSync(newpath)) {
    fs.mkdirSync(newpath, { recursive: true });
}

const testSchema = mongoose.Schema({
    testname: {
        type: String
    },
    testprice: {
        type: String
    },
    testid: {
        type: String
    },
    testdiscountprice: {
        type: String

    },
    testdiscripation: {
        type: String

    },
    testtotalprice: {
        type: String
    },
    testavatar: {
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
testSchema.statics.uploadedAvatar = multer({ storage: storage }).single('avatar');

testSchema.statics.avatarPath = AVATAR_PATH;

const Test = mongoose.model('Test', testSchema);
module.exports = Test;