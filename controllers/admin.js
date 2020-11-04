const User = require('../models/user');
const Test = require('../models/test');
const Consult = require('../models/consult');
const fs = require('fs');
const path = require('path');
const accountChangeAlert = require('../mailers/account-change');
const serviceStartAlert = require('../mailers/service-start');
const config = require('../config/twilio');
const client = require('twilio')(config.accountSID, config.authToken);

module.exports.appointmentList = (req, res) => {
    return res.render('a-appointment-list', {
        title: 'Appointment List'
    })
}
module.exports.test = async(req, res) => {
    let tests = await Test.find({});
    return res.render('a-test', {
        tests: tests,
        title: 'Test'
    })
}
module.exports.addtest = async(req, res) => {


    return res.render('a-addtest', {

        title: 'Add Test'
    })
}
module.exports.applicationRequest = async(req, res) => {
    let user = await User.find({ step4: true });
    return res.render('a-application-request', {
        title: 'Application Request',
        user: user
    })
}
module.exports.accountChange = async(req, res) => {
    let user = await User.find({ account_change: true });
    return res.render('a-account-change', {
        title: 'Account Change Request',
        user: user
    })
}
module.exports.deletetest = async function(req, res) {


    let test = await Test.findOne({ _id: req.query.id });


    fs.unlinkSync(path.join(__dirname, '..', test.testavatar));
    // console.log(path.join(__dirname,'..','\assets',property.avatar[0]))


    let prope = await Test.deleteOne({ _id: req.query.id });

    req.flash('success', 'Test removed Successfully');
    return res.redirect('back');

}
module.exports.deleteconsult = async function(req, res) {


    let consult = await Consult.findOne({ _id: req.query.id });

    if (consult.consultavatar) {
        if (fs.existsSync(path.join(__dirname, '..', consult.consultavatar))) {
            fs.unlinkSync(path.join(__dirname, '..', consult.consultavatar));

        }
    }




    let prope = await Consult.deleteOne({ _id: req.query.id });

    req.flash('success', 'Consult removed Successfully');
    return res.redirect('back');

}
module.exports.edittest = async function(req, res) {
    let test = await Test.findOne({ _id: req.query.id });

    return res.render('a-edittest', {
        title: 'Edit Test',
        test: test
    })




}
module.exports.updatetest = async function(req, res) {

    try {

        Test.uploadedAvatar(req, res, async function(err) {
            if (err) {
                console.log('Multer Error', err);
                return;
            }
            let test = await Test.findById(req.body.id);
            test.testname = req.body.testname,
                test.testprice = req.body.testprice



            if (req.file) {
                let newPath = Test.avatarPath + '/' + req.file.filename;
                test.testavatar = newPath;
            }



            test.save();
            console.log(test);

            req.flash('success', 'Test updated Successfully');
            return res.redirect('back');

        });



    } catch (err) {
        console.log('Error', err);
        return;
    }

}

module.exports.atest = async function(req, res) {

    try {
        // let test = await User.findById(req.user.id);
        Test.uploadedAvatar(req, res, async function(err) {
            if (err) {
                console.log('Multer Error', err);
                return;
            }
            let test = await Test.create({
                testname: req.body.testname,
                testprice: req.body.testprice

            });

            let newPath = Test.avatarPath + '/' + req.file.filename;
            test.testavatar = newPath;

            test.save();
            console.log(test);
            req.flash('success', 'Test Added Successfully');
            return res.redirect('back');

        });



    } catch (err) {
        console.log('Error', err);
        return;
    }

}
module.exports.addConsultData = async function(req, res) {

    try {
        // let test = await User.findById(req.user.id);
        Consult.uploadedAvatar(req, res, async function(err) {
            if (err) {
                console.log('Multer Error', err);
                return;
            }
            let consult = await Consult.create({
                consultname: req.body.consultname,
                consultprice: req.body.consultprice,
                consultspecilisation: req.body.consultspecilisation

            });

            let newPath = Consult.avatarPath + '/' + req.file.filename;
            consult.consultavatar = newPath;

            consult.save();
            console.log(consult);
            req.flash('success', 'consult Added Successfully');
            return res.redirect('back');

        });



    } catch (err) {
        console.log('Error', err);
        return;
    }

}
module.exports.approveDocuments = async(req, res) => {
    let users = await User.findById(req.body.id);
    let user = await User.find({ step4: true });
    users.approve1 = true;
    users.save();
    if (users.approve2 == true) {
        return res.render('a-application-request', {
            title: 'Application Request',
            user: user
        })
    } else {
        return res.render('a-profile', {
            title: 'Profile',
            user: users
        })
    }
}


module.exports.approveRequestedBank = async(req, res) => {
    let users = await User.findById(req.body.id);
    let user = await User.find({ account_change: true });

    if (req.body.accountid == req.body.reaccountid) {
        users.accountid = req.body.accountid;
        users.bank = {
            accountholdername : req.body.accountholdername,
            bankname : req.body.bankname,
            accountnumber : req.body.accountnumber,
            ifsccode : req.body.ifsccode
        }
        users.approve_account_change = true;
        users.account_change = false;
        users.save();

        if(users.phone)
        {
            client.messages
            .create({
               body: 'Hii Dr.'+users.name+'! Your request of bank account change in doccure is approved. Now all your online transactions will be routed to your requested bank.If you have disabled your online booking service then click on this link to enable http://localhost:4000/booking-service',
               from: '+12019755459',
               statusCallback: 'http://postb.in/1234abcd',
               to: '+91'+users.phone
             })
            .then(message => console.log(message.sid));
        }

        if(users.email)
        {
        accountChangeAlert.newAlert(user,users.email);
        }
       
       
            return res.render('a-change-profile', {
                title: 'Profile',
                user: users
            })
        }
    else {
        req.flash('error', 'AccountId Donot match');
        return res.render('a-profile', {
            title: 'Profile',
            user: users
        })
    }

}

module.exports.approveBank = async(req, res) => {
    let users = await User.findById(req.body.id);
    let user = await User.find({ step4: true });

    if (req.body.accountid == req.body.reaccountid) {
        users.accountid = req.body.accountid;
        users.approve2 = true;
        users.booking_service = true;
        users.save();
        if (users.approve1 == true) {
            if(users.phone)
            {
                client.messages
                .create({
                   body: 'Hii Dr.'+users.name+'! Your documents has been approved and now you are live. Now your patients can book you online through Doccure. You can visit your dashboard to keep track of appointments. If you want to see your dashboard now then use this link http://localhost:4000/doctor-dashboard',
                   from: '+12019755459',
                   statusCallback: 'http://postb.in/1234abcd',
                   to: '+91'+users.phone
                 })
                .then(message => console.log(message.sid));
            }
    
            if(users.email)
            {
            serviceStartAlert.newAlert(user,users.email);
            }
            return res.render('a-application-request', {
                title: 'Application Request',
                user: user
            })
        } else {
            return res.render('a-profile', {
                title: 'Profile',
                user: users
            })
        }
    } else {
        req.flash('error', 'AccountId Donot match');
        return res.render('a-profile', {
            title: 'Profile',
            user: users
        })
    }

}
module.exports.blankPage = (req, res) => {
    return res.render('a-blank-page', {
        title: 'Blank Page'
    })
}
module.exports.componentsList = (req, res) => {
    return res.render('a-components', {
        title: 'Components'
    })
}
module.exports.dataTables = (req, res) => {
    return res.render('a-data-tables', {
        title: 'Data Tables'
    })
}
module.exports.doctorList = async(req, res) => {

    let user = await User.find({ type: "Doctor" });
    return res.render('a-doctor-list', {
        title: 'Doctor List',

        doctors: user
    })
}
module.exports.error404 = (req, res) => {
    return res.render('a-error-404', {
        title: 'Error 404'
    })
}
module.exports.error500 = (req, res) => {
    return res.render('a-error-500', {
        title: 'Error 500'
    })
}
module.exports.forgotPassword = (req, res) => {
    return res.render('a-forgot-password', {
        title: 'Forgot Password'
    })
}
module.exports.formBasicInputs = (req, res) => {
    return res.render('a-form-basic-inputs', {
        title: 'Form Basic Inputs'
    })
}
module.exports.formHorizontal = (req, res) => {
    return res.render('a-form-horizontal', {
        title: 'Form horizontal'
    })
}
module.exports.formInputGroups = (req, res) => {
    return res.render('a-form-input-groups', {
        title: 'Form Input Group'
    })
}
module.exports.formMask = (req, res) => {
    return res.render('a-form-mask', {
        title: 'Form Mask'
    })
}
module.exports.formVertical = (req, res) => {
    return res.render('a-form-vertical', {
        title: 'Form Vertical'
    })
}
module.exports.aconsult = async(req, res) => {
    let consults = await Consult.find({})
    return res.render('a-consult', {
        title: 'Consult',
        consults: consults
    })
}

module.exports.addconsult = (req, res) => {
    return res.render('add-consult', {
        title: ' Add Consult'
    })
}
module.exports.index = async(req, res) => {
    let doctors = await User.find({ type: "Doctor" });
    let patients = await User.find({ type: "Patient" });
    return res.render('a-index', {
        title: 'Index List',
        doctors: doctors,
        patients: patients
    })
}
module.exports.formValidation = (req, res) => {
    return res.render('a-form-validation', {
        title: 'Form Validation'
    })
}
module.exports.invoice = (req, res) => {
    return res.render('a-invoice', {
        title: 'Invoice List'
    })
}
module.exports.invoiceReport = (req, res) => {
    return res.render('a-invoice-report', {
        title: 'Invoice Report'
    })
}
module.exports.lockScreen = (req, res) => {
    return res.render('a-lock-screen', {
        title: 'lock Screen'
    })
}
module.exports.login = (req, res) => {
    return res.render('a-login', {
        title: 'Login '
    })
}
module.exports.patientList = async(req, res) => {
    let user = await User.find({ type: "Patient" });
    return res.render('a-patient-list', {
        title: 'Patient List',
        patients: user
    })
}
module.exports.profile = async(req, res) => {
    let user = await User.findById(req.query.id);
    return res.render('a-profile', {
        title: 'Profile',
        user: user
    })
}


module.exports.phoneLogin = async(req, res) => {
    
    return res.render('a-phone-login', {
        title: 'Phone Login'
    })
}

module.exports.changeProfile = async(req, res) => {
    let user = await User.findById(req.query.id);
    return res.render('a-change-profile', {
        title: 'Profile',
        user: user
    })
}
module.exports.register = (req, res) => {
    return res.render('a-register', {
        title: 'Register'
    })
}
module.exports.reviews = (req, res) => {
    return res.render('a-reviews', {
        title: 'Reviews'
    })
}
module.exports.settings = (req, res) => {
    return res.render('a-settings', {
        title: 'Setting'
    })
}
module.exports.tablesBasic = (req, res) => {
    return res.render('a-tables-basic', {
        title: 'tablesBasic'
    })
}
module.exports.specialities = (req, res) => {
    return res.render('a-specialities', {
        title: 'Specialities List'
    })
}
module.exports.transactionsList = (req, res) => {
    return res.render('a-transactions-list', {
        title: 'Transactions List'
    })
}

module.exports.createSession = async (req, res) => {
    return res.redirect('/admin/index');

}

module.exports.createAccount = async (req, res) => {
    let admins = await User.find({root_user:true ,service:'phone'});
    let count = admins.length;
    if(req.body.flag == 'false')
    {
        if(req.body.password == req.body.cpassword)
        {
            User.create({
                name:req.body.name,
                phone:req.body.phone,
                service:'phone',
                type:'Adminstrator',
                email:req.body.email,
                password:req.body.password,
                master_password:req.body.master_password,
                root_user:true
            });
            req.flash('success','Account Created Successfully');
            return res.redirect('/admin/login');
        }

        else{
            req.flash('error','Password Donot Match')
            return res.render('a-register', {
                title: 'Register',
                phone: req.body.phone,
                type: req.body.type,
                count:count
            });
        }
    }

    else{
        let admin = await User.findOne({root_user:true, service:'phone'});
        if(req.body.master_password == admin.master_password)
        {
            if(req.body.password == req.body.cpassword)
            {
                User.create({
                    name:req.body.name,
                    service:'phone',
                    type:'Adminstrator',
                    email:req.body.email,
                    phone:req.body.phone,
                    password:req.body.password
                });

                req.flash('success','Account Created Successfully');
                return res.redirect('/admin/login');
            }

            else{
                req.flash('error','Password Donot Match')
                return res.render('a-register', {
                    title: 'Register',
                    phone: req.body.phone,
                    type: req.body.type,
                    count:count
                });
            }
        }

        else{
            req.flash('error','Wrong Master Password')
            return res.render('a-register', {
                title: 'Register',
                phone: req.body.phone,
                type: req.body.type,
                count:count
            });
        }
    }
}


module.exports.signUp = async(req, res) => {

    let admins = await User.find({root_user:true, service:'phone'});
    let count = admins.length;

        let data = await client
            .verify
            .services(config.serviceID)
            .verificationChecks
            .create({
                to: `+91${req.body.phone}`,
                code: req.body.otp
            });


        if (data.status == 'approved') {
            return res.render('a-register', {
                title: 'Register',
                phone: req.body.phone,
                type: req.body.type,
                count:count
            });

        } else {
            req.flash('error', 'Wrong Otp');
            return res.render('a-phone-verify', {
                title: 'Phone verification',
                phone: req.body.phone,
                type: req.body.type
            })

        }

    


}

module.exports.verify = async(req, res) => {
  let user = await User.findOne({ phone: req.body.phone, service:'phone' });

            if (user) {
                req.flash('error', 'Account already linked with this mobile number');
                return res.redirect('back');
            } else {

                client
                    .verify
                    .services(config.serviceID)
                    .verifications
                    .create({
                        to: `+91${req.body.phone}`,
                        channel: req.query.service
                    }).then((data) => {
                        // console.log(data);
                        return res.render('a-phone-verify', {
                            title: 'Phone verification',
                            phone: req.body.phone,
                            type: req.body.type

                        });
                    });

            }
        


 
}