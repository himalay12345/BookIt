const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const AVATAR_PATH = path.join('/uploads/covid/avatars');
const newpath = path.join(__dirname, '..', AVATAR_PATH);
if (!fs.existsSync(newpath)) {
    fs.mkdirSync(newpath, { recursive: true });
}

const covidSchema = mongoose.Schema({
    name: {
        type: String
    },
    aadhar: {
        type: String
    },
    dob: {
        month:{
        type: String
        },
        day:{
            type: String
            },
            year:{
                type: String
                }
        
    },
    gender: {
        type: String

    },

    email: {
        type: String

    },
    phone: {
        type: String
    },
    address: {
        addr_line1:{
            type: String
        },
        addr_line2:{
            type: String
            },
        city:{
                type: String
            },
        state:{
                type: String
            },
        postal:{
                type: String
            }
        
    },
    doYou: {
        type: String
    },
    medicine:{
        type: Object
    },
    allergy:{
        type: Object
    },
    symptoms:{
        type:Object
    },
    haveYou:{
        type:String
    },
    ifYes:{
        type:String
    },
    iHereby:{
        type:String
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
covidSchema.statics.uploadedAvatar = multer({ storage: storage }).single('avatar');

covidSchema.statics.avatarPath = AVATAR_PATH;

const Covid = mongoose.model('Covid', covidSchema);
module.exports = Covid;