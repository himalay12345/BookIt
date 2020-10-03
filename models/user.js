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
    contacts: {
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
    },
    favourites: [{
        type: mongoose.Schema.Types.ObjectId
    }],

    avatar: {
        type: String
    },
    phone: {
        type: String
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
    notification:[{
        type:{
            type:String
        },
        message:{
            type:String
        },
        flag:{
            type:Boolean
        },
        did:{
            type: mongoose.Schema.Types.ObjectId 
        },
        createdAt: { type: Date, default: Date.now }

    }],
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

    step1:{
        type: Boolean
    },
     step2:{
        type: Boolean
    },
    step3:{
        type: Boolean
    },
    step4:{
        type: Boolean
    },

    payments:[{
        payment_id:{
            type:String
        },
        order_id:{
            type:String
        },
        signature:{
            type:String
        }
    }],
    prescriptions:[{
        type:String
    }], 
    medical_records:[{
        type:String
    }],
    refresh_flag:{
        type:Boolean
    },

    doctorid:{
        type: mongoose.Schema.Types.ObjectId
    },

   others:[{
    name : {
        type:String
    },
    email :{
        type:String
    } ,
    phone : 
    {
        type:String
    },
    age:{
        type:String
    },
    address:{
        type:String
    }

   }],
    doctors:[{
        payment_id:{
            type:String
        },
        did:{
            type: mongoose.Schema.Types.ObjectId
        },
        time:{
            type:String
        },
        date:{
            type:String
        },
        day:{
            type:String
        },
        fee:{
            type:String
        },
        type:{
            type:String
        },
        count:{
            type:String
        },
        slotindex:{
            type:String
        },
        dayindex:{
            type:String
        },
        name:{
            type:String
        },
        email:{
            type:String
        },
        cancel:{
            type:Boolean
        },
        phone:{
            type:String
        },
        createdAt: { type: Date, default: Date.now }
    }],

    patients:[{
        payment_id:{
            type:String
        },
        
        pid:{
            type: mongoose.Schema.Types.ObjectId
        },
        time:{
            type:String
        },
        date:{
            type:String
        },
        day:{
            type:String
        },
        fee:{
            type:String
        },
        cancel:{
            type:Boolean
        },
        type:{
            type:String
        },
        count:{
            type:String
        },
        name:{
            type:String
        },
        email:{
            type:String
        },
        phone:{
            type:String
        },
        createdAt: { type: Date, default: Date.now }
    }],

    booking:[{
            name:{
                type:String
            },
            address:{
                type:String
            },
            phone:{
                type:Number
            },
            cancel:{
                type:Boolean
            },
            age:{
                type:String
            },
            time:{
                type:String 
            },
            date:{
                type:String
            },
            day:{
                type:String
            },
            fee:{
                type:String
            },
            seat:{
                type:String
            },
            type:{
                type:String
            },
            pid:{
                type: mongoose.Schema.Types.ObjectId

            },
            createdAt: { type: Date, default: Date.now }

    }],

    staff_id:{
        type: mongoose.Schema.Types.ObjectId

    },

    staff_flag:{
        type: Boolean,
        default: false

    },
   
    clinicaddr: {
        type: String
    },
    cliniccity: {
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
    approve1: {
        type: Boolean
    },
    age:{
        type:String
    },
    approve2: {
        type: Boolean
    },
    accountid:{
        type:String
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
    biodata: {
        type: String
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
        max_count: {
            type: Object
        },
        day: {
            type: String
        },
        available:{
            type: Object
        },
        booked:{
            type: Object
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
    registrations: {
        registration: {
            type: String
        },
        regYear: {
            type: String
        },
        regCouncil:{
            type: String
        }

    },
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