const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const AVATAR_PATH = path.join('/uploads/user/avatars');
const newpath = path.join(__dirname, '..', AVATAR_PATH);
if (!fs.existsSync(newpath)) {
    fs.mkdirSync(newpath, { recursive: true });
}

const userSchema = mongoose.Schema({
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
    type: {
        type: String
    },
    fbid: {
        type: String
    },
    twitter: {
        type: String
    },
    facebook: {
        type: String
    },
    instagram: {
        type: String
    },
    clinicname: {
        type: String
    },
    idproof: {
        type: String
    },
    idproofname: {
        type: String
    },
    degreeproof: {
        type: String
    },
    verifyid: {
        type: Boolean
    },
    verifydegree: {
        type: Boolean
    },
    terms: {
        type: Boolean
    },
    clinicaddr: {
        type: String
    },
    degreephoto: {
        type: String
    },
    verifyid: {
        type: Boolean
    },
    verifydegree: {
        type: Boolean
    },
    bank: {
        bankname: {
            type: String
        },
        accountholdername: {
            type: String
        },
        accountnumber: {
            type: String
        },
        ifsccode: {
            type: String
        },

    },
    terms: {
        type: Boolean
    },
    clinicphoto: [{
        type: String
    }],
    booking_fee: {
        type: String
    },
    schedule_time: [{
        start: {
            type: Object
        },
        end: {
            type: Object
        },
        day: {
            type: String
        }
    }],
    education: [{
        degree: {
            type: String
        },
        college: {
            type: String
        },
        yoc: {
            type: String
        }
    }],

    awards: [{
        year: {
            type: Number
        },
        award: {
            type: String
        }

    }],
    registrations: [{
        registration: {
            type: String
        },
        regYear: {
            type: String
        }

    }],
    department: {
        type: String
    },
    services: {
        type: String

    },

    specialisation: {
        type: String

    },
    experience: [{
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

        }
    }]

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
userSchema.statics.uploadedAvatar = multer({ storage: storage }).fields([
    { name: 'avatar', maxCount: 1 },
    { name: 'clinicphoto', maxCount: 10 }
]);


// userSchema.statics.uploadedIDProof = multer({ storage: storage }).single('idproof');
// userSchema.statics.uploadedDegree = multer({ storage: storage }).single('degreeproof');
userSchema.statics.avatarPath = AVATAR_PATH;

const User = mongoose.model('User', userSchema);
module.exports = User;