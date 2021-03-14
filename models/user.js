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
    twofactor:{
        type:Boolean
    },
    encrypt:{
        type:Boolean
    },
    entries:[{
       entry:{
           type:String
       } 
    }],
    expenses:[{
        name:{
            type: String  
        },
        date:{
            type: String  
        },
        amount:{
            type:Number
        },
        remarks:{
            type:String
        },
       createdAt:{type: Date, default: Date.now}
   
    }],
    billings:[{
        name:{
            type: String  
        },
        address:{
            type: String  
        },
        phone:{
            type:Number
        },
        date:{
            type: String  
        },
        dues:{
            type:Number
        },
        service:[{
            type:Object
        }],
        amount:[{
            type:Object
        }],
       createdAt:{type: Date, default: Date.now}
   
    }],
    expenses1:[{
        name:{
            type: String  
        },
        date:{
            type: String  
        },
        amount:{
            type:Number
        },
        remarks:{
            type:String
        },
       createdAt:{type: Date, default: Date.now}
   
    }],
    billings1:[{
        name:{
            type: String  
        },
        address:{
            type: String  
        },
       
        date:{
            type: String  
        },
        remarks:{
            type: String  
        },
        amount:{
            type:Number
        },
       createdAt:{type: Date, default: Date.now}
   
    }],
    tests:[{
        testname:{
            type:String
        },
        testprice:{
            type:Number
        }
    }],

    cart:{
        tests:[{
            testname:{
                type:String
            },
            testprice:{
                type:Number
            },
            labname:{
                type:String
            },
            labid:{
                type: mongoose.Schema.Types.ObjectId
            }
        }]
    },
    bloodgroup: {
        type: String
    },
    gender: {
        type: String
    },
    service: {
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
        country: {
            type: String
        }
    },

    nots_settings:{
        email:{
            type:Object
        },
        phone:{
            type:Object
        }

    },
    favourites: [{
        dname:{
            type: String
        },
        davatar:{
            type: String
        },
        ddept:{
            type: String
        },
        dcity:{
            type: String
        },
        dstate:{
            type: String
        },
        dfee:{
            type: String
        },
        did:{
            type:  mongoose.Schema.Types.ObjectId
        }
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
    booking_service:{
        type:Boolean
    },
    account_change:{
        type:Boolean
    },
    approve_account_change:{
        type:Boolean
    },
    

    reviews:[{
        rating:{
            type:Number
        },
        title:{
            type:String
        },

        review_description:{
            type:String
        },
        pid:{
            type: mongoose.Schema.Types.ObjectId

        },
        pavatar:{
            type:String
        },
        pname:{
            type:String
        },

        createdAt: { type: Date, default: Date.now }
    }],
    
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
    holidays:[{
        date:{
            type:String
        },
        flag:{
            type:Boolean
        }
    }],

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

    doctorids:[{
        doctorid:{
            type: mongoose.Schema.Types.ObjectId
        }
    }],

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
    gender:{
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
        seat:{
            type:String
        },
        did:{
            type: mongoose.Schema.Types.ObjectId
        },
        davatar:{
            type:String
        },
        reschedule:{
            type:Boolean
        },
        dname:{
            type:String
        },
        old_flag:{
            type:Boolean
        },
        ddept:{
            type:String
        },
        cname:{
            type:String
        },
        dsid:{
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
        age:{
            type:String
        },
        gender:{
            type:String
        },
        cancel:{
            type:Boolean
        },
        phone:{
            type:String
        },
        address:{
            type:String
        },
        mode:{
            type:String
        } ,
        createdAt: { type: Date, default: Date.now }
    }],

    poc:{
        type:Boolean
    },

    poc_billing:[{
        month:{
            type:String
        },
        amount:{
            type:Number
        },
        paid:{
            type:Number
        },
        paid_by:{
            type:String
        },
        due:{
            type:Number
        },
        due_flag:{
            type:Boolean
        }
    }],

    patients:[{
        payment_id:{
            type:String
        },
        seat:{
            type:String
        },
        
        pid:{
            type: mongoose.Schema.Types.ObjectId
        },
        time:{
            type:String
        },
        avatar:{
            type:String

        },
        old_flag:{
            type:Boolean
        },
        city:{
            type:String
        },
        dob:{
            type:String
        },
        bloodgroup:{
            type:String
        },
        age:{
            type:String
        },
        gender:{
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
        mode:{
            type:String
        } ,
        address:{
            type:String
        },
        createdAt: { type: Date, default: Date.now }
    }],

    booking:[{
            name:{
                type:String
            },
            old_flag:{
                type:Boolean
            },
            payment_id:{
                type:String
            },
            waiting:{
                type:String
            },
            slot:{
                type:String
            },
            dayindex:{
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
            gender:{
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
            did:{
                type: mongoose.Schema.Types.ObjectId
            },
            accept:{
                type:Boolean
            },
            
            createdAt: { type: Date, default: Date.now }

    }],
    tracked:[{
        tid:{
            type: mongoose.Schema.Types.ObjectId
        },
        seat:{
            type:Number
        },
        time:{
            type:Date
        },
        name:{
            type:String
        },
        slot:{
            type:String
        },
        status:{
            type:String
        },
            did:{
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
    wexperience:{
        type:Number
    },
    estphoto: {
        type: String
    },
    temp_phone: {
        type: String
    },
    stemp_phone: {
        type: String
    },
    temp_email: {
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
    new_bank:{
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
        }

    },
    terms: {
        type: Boolean
    },
    biodata: {
        type: String
    },
    old_flag:{
        type: Boolean
    },
    clinicphoto: [{
        type: String
    }],
    booking_fee: {
        type: String
    },
    oldp:{
        pcount:{
            type:Number
        },
        dcount:{
            type:Number
        },
        flag:{
            type:Boolean
        }
    },

    add_patient:[{
        name:{
            type:String
        },
        phone:{
            type:Number
        },
        age:{
            type:Number
        },
        gender:{
            type:String
        },
        flag:{
            type:Boolean
        }
    }],

        add_address:[{
        name:{
            type:String
        },
        phone:{
            type:Number
        },
        pincode:{
            type:Number
        },
        city:{
            type:String
        },
        street:{
            type:String
        },
        flatno:{
            type:String
        },
        type:{
            type:String
        },
        flag:{
            type:Boolean
        }
    }],

    booked_test_user:[{
        user:{
            name:{
                type:String
            },
            phone:{
                type:Number
            },
            age:{
                type:Number
            },
            gender:{
                type:String
            }
        },
        my_reports:[{
            description:{
                type:String
            },
            report:{
                type:String
            }
        }],
        address:{
            name:{
                type:String
            },
            phone:{
                type:Number
            },
            pincode:{
                type:Number
            },
            city:{
                type:String
            },
            street:{
                type:String
            },
            flatno:{
                type:String
            },
            type:{
                type:String
            }
        },
        tests:{
            type:Object
        },

        labname:{
            type:String
        },
        labid:{
            type: mongoose.Schema.Types.ObjectId
        },
        tindex:{
            type:Number
        },
        mode:{
            type:String
        },
        date:{
            type:String
        },
        stime:{
            type:String
        },
        etime:{
            type:String
        },
        totalprice:{
            type:String
        },
        order_placed:{
            type:Boolean
        },
        phlebotomist:{
            type:Boolean
        },
        sample_collection:{
            type:Boolean
        },
        reports:{
            type:Boolean
        },
        order_complete:{
            type:Boolean
        },
        cancel:{
            type:Boolean
        },
        createdAt:{type: Date, default: Date.now}
    }],

    booked_test_lab:[{
        uid:{
            type:mongoose.Schema.Types.ObjectId
        },
        tid:{
            type:mongoose.Schema.Types.ObjectId
        },
        my_reports:[{
            description:{
                type:String
            },
            report:{
                type:String
            }
        }],
        user:{
            name:{
                type:String
            },
            phone:{
                type:Number
            },
            age:{
                type:Number
            },
            gender:{
                type:String
            }
        },
        address:{
            name:{
                type:String
            },
            phone:{
                type:Number
            },
            pincode:{
                type:Number
            },
            city:{
                type:String
            },
            street:{
                type:String
            },
            flatno:{
                type:String
            },
            type:{
                type:String
            }
        },
        tests:[{
            testname:{
                type:String
            },
            testprice:{
                type:Number
            }
        }],
        mode:{
            type:String
        },
        date:{
            type:String
        },
        stime:{
            type:String
        },
        etime:{
            type:String
        },
        totalprice:{
            type:String
        },
        cancel:{
            type:Boolean
        },
        order_placed:{
            type:Boolean
        },
        phlebotomist:{
            type:Boolean
        },
        sample_collection:{
            type:Boolean
        },
        reports:{
            type:Boolean
        },
        order_complete:{
            type:Boolean
        },
        createdAt:{type: Date, default: Date.now}
    }],

    old_schedule_time_fixed: [{
        max_count: {
            type: Number
        },
        day: {
            type: String
        },
        available:{
            type: Number
        },
        booked:{
            type: Number
        },
        reset_flag:{
            type:Boolean
        },
        alt_flag:{
            type:Boolean
        }

    }],

    old_schedule_time: [{
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
        },
        reset_flag:{
            type:Boolean
        },
        alt_flag:{
            type:Boolean
        }

    }],
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
        },
        reset_flag:{
            type:Boolean
        },
        alt_flag:{
            type:Boolean
        },
        booking_over:[{
            type:Number
        }]
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
    master_password:{
        type:String
    },
    root_user:{
        type:Boolean
    },

    emailverify:{
        type:Boolean
    },
    premium:{
        type:Boolean
    },

    emailkey:{
        type:String
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

        },
        excity:{
            type: String
        }
    }]

}, { timestamps: true });

userSchema.index({name: 'text'});
let storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, path.join(__dirname, '..', AVATAR_PATH));
    },
    filename: function(req, file, cb) {
        // cb(null, file.fieldname + '-' + Date.now());
        if(file.originalname){
            file.uploaded_name = Date.now() + file.originalname.replace(/ /g, "_").toLowerCase();
            var file_name=Date.now() + file.originalname.replace(/ /g, "_").toLowerCase();

            console.log(file);
            var ext = file.mimetype.split('/')[1];
            cb(null, file_name);
    }
    else
    {
            cb(null,  file.fieldname + '-' + Date.now()  + path.extname(file.originalname));
    }
    }
});

//static function
userSchema.statics.uploadedAvatar = multer({ storage: storage ,
    fileFilter: function (req, file, cb) {
        var ext=path.extname(file.originalname);
        if(file.fieldname && (file.fieldname=="avatar" || file.fieldname=="clinicphoto" || file.fieldname=="reports")){
            var validExtensions = ['.jpg','.png','.jpeg',".gif",".JPG",".PNG",".JPEG",".GIF",".pdf",".doc",".txt"];
            if (validExtensions.indexOf(ext) < 0) {
              return cb(new Error('Allowed image extentions are jpg,png,jpeg and gif'))
            }
        }
       
        cb(null, true)
   }}).fields([
    { name: 'avatar', maxCount: 1 },
    { name: 'clinicphoto', maxCount: 15 },
    {name: 'reports',maxCount:15}
]);


// userSchema.statics.uploadedIDProof = multer({ storage: storage }).single('idproof');
// userSchema.statics.uploadedDegree = multer({ storage: storage }).single('degreeproof');
userSchema.statics.avatarPath = AVATAR_PATH;

const User = mongoose.model('User', userSchema);
module.exports = User;