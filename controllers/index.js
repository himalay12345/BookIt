const config = require('../config/twilio');
const User = require('../models/user');
const client = require('twilio')(config.accountSID, config.authToken);


module.exports.home = async(req, res) => {
    let doctors = await User.find({ type: "Doctor" });
    return res.render('index', {
        title: 'Home',
        doctors: doctors
    })
}

module.exports.addBilling = (req, res) => {
    return res.render('add-billing', {
        title: 'Add Billing'
    })
}
module.exports.consult = (req, res) => {
    return res.render('consult', {
        title: 'Consult'
    })
}
module.exports.addPrescription = (req, res) => {
    return res.render('add-prescription', {
        title: 'Add Prescription'
    })
}

module.exports.accountSetting = (req, res) => {
    return res.render('account-setting', {
        title: 'Account Settings'
    })
}



module.exports.Specialist = async function(req, res) {



    let doctors = await User.find({
        department: req.query.dep,
        type: "Doctor"
    });


    return res.render('specialist', {
        doctors: doctors
    });

}

module.exports.appointments = (req, res) => {
    return res.render('appointments', {
        title: 'Appointments'
    })
}

module.exports.blankPage = (req, res) => {
    return res.render('blank-page', {
        title: 'Blank'
    })
}
module.exports.bankDetails = (req, res) => {
    return res.render('bank-details', {
        title: 'Bank Details'
    })
}
module.exports.Doctors = async(req, res) => {
    let doctors = await User.find({ terms: true });
    return res.render('doctors', {
        title: 'Doctors',
        doctors: doctors
    })
}
module.exports.booking = async(req, res) => {
    let doctor = await User.findById(req.query.id);
    var today = new Date();
    today.setDate(today.getDate() - 1)
        var dd = String(today.getDate()).padStart(2, '0');
        var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
        var yyyy = today.getFullYear();
        var weekday = new Array('Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday');
        var dayOfWeek = weekday[today.getDay()].toUpperCase(); 
        // var result = today.setTime(today.getTime() - (1 * 24 * 60 * 60 * 1000));
        // var date = new Date(res);
        

        for(temp of doctor.schedule_time)
        {
            if(temp.day.toUpperCase() == dayOfWeek )
            {
                if(typeof(temp.booked)=='string')
                {
                    temp.booked = 0;
                }

                else{
                    temp.booked = [0,0];
                }
            }
        }

        doctor.save();
    
    return res.render('booking', {
        title: 'Booking',
        doctor: doctor
    })
}

module.exports.bookingSuccess = (req, res) => {
    return res.render('booking-success', {
        title: 'Booking-Success'
    })
}

module.exports.calendar = (req, res) => {
    return res.render('calendar', {
        title: 'Calendar'
    })
}

module.exports.changePassword = async(req, res) => {
    let user = await User.findById(req.user.id)
    return res.render('change-password', {
        title: 'Change Password',
        user: user
    })
}

module.exports.chat = async(req, res) => {
    let user = await User.findById(req.user.id)
    return res.render('chat', {
        title: 'Chat',
        user: user
    })
}

module.exports.chatDoctor = (req, res) => {
    return res.render('chat-doctor', {
        title: 'Chat user'
    })
}

module.exports.checkout = (req, res) => {
    return res.render('checkout', {
        title: 'Checkout'
    })
}
module.exports.components = (req, res) => {
    return res.render('components', {
        title: 'Components'
    })
}

module.exports.doctorChangePassword = (req, res) => {
    return res.render('doctor-change-password', {
        title: 'Change Password'
    })
}

module.exports.doctorTermsAndCondition = (req, res) => {
    return res.render('doctor-terms-and-condition', {
        title: 'Terms And Condition'
    })
}


module.exports.doctorDashboard = (req, res) => {
    return res.render('doctor-dashboard', {
        title: 'user Dashboard'
    })
}

module.exports.doctorProfile = async(req, res) => {
    console.log(req.query.id);
    let doctor = await User.findById(req.query.id);

    return res.render('doctor-profile', {
        title: 'Profile',
        doctor: doctor
    })
}

module.exports.doctorProfileSettings = (req, res) => {
    return res.render('doctor-profile-settings', {
        title: 'Profile Settings'
    })
}

module.exports.doctorRegister = (req, res) => {
    return res.render('doctor-register', {
        title: 'Register'
    })
}
module.exports.docRegister = (req, res) => {
    return res.render('doc-register', {
        title: 'user Register'
    })
}

module.exports.editBilling = (req, res) => {
    return res.render('edit-billing', {
        title: 'Edit Billing'
    })
}

module.exports.editPrescription = (req, res) => {
    return res.render('edit-prescription', {
        title: 'Edit prescription'
    })
}

module.exports.favourites = async(req, res) => {
    let doctors = await User.findById(req.user.id).populate({
        path: 'favourites',
        populate: { path: 'user' }
    });
    return res.render('favourites', {
        title: 'Favourites',
        doctors: doctors
    })
}

module.exports.forgotPassword = (req, res) => {
    return res.render('forgot-password', {
        title: 'Forgot Password'
    })
}

module.exports.home2 = (req, res) => {
    return res.render('index', {
        title: 'Home'
    })
}

module.exports.invoiceView = (req, res) => {
    return res.render('invoice-view', {
        title: 'Invoice View'
    })
}

module.exports.invoices = (req, res) => {
    return res.render('invoices', {
        title: 'Invoices'
    })
}

module.exports.login = (req, res) => {
    if (req.isAuthenticated()) {
        return res.redirect('/')
    }
    return res.render('login', {
        title: 'Login'
    })
}

module.exports.myPatients = (req, res) => {
    return res.render('my-patients', {
        title: 'My users'
    })
}

module.exports.patientDashboard = async(req, res) => {
    let user = await User.findById(req.user.id)
    return res.render('patient-dashboard', {
        title: 'user Dashboard',
        user: user
    })
}

module.exports.patientProfile = (req, res) => {
    return res.render('patient-profile', {
        title: 'user Profile'
    })
}


module.exports.privacyPolicy = (req, res) => {
    return res.render('privacy-policy', {
        title: 'Privacy Policy'
    })
}

module.exports.profileSettings = async(req, res) => {
    let user = await User.findById(req.user.id);
    return res.render('profile-settings', {
        title: 'Profile Settings',
        user: user
    })
}

module.exports.previewProfile = async(req, res) => {
    // let user = await User.findById(req.user.id);
    return res.render('preview-profile', {
        title: 'Preview Profile'
    })
}

module.exports.register = (req, res) => {
    if (req.isAuthenticated()) {
        return res.redirect('/')
    }
    return res.render('phone-login', {
        title: 'Register'
    })
}

module.exports.signUp = async(req, res) => {

    if (req.body.type == 'forgot') {
        console.log(req.body.type)
        let data = await client
            .verify
            .services(config.serviceID)
            .verificationChecks
            .create({
                to: `+91${req.body.phone}`,
                code: req.body.otp
            });


        if (data.status == 'approved') {
            return res.render('set-password', {
                title: 'Reset Pasword',
                phone: req.body.phone
            });

        } else {
            req.flash('error', 'Wrong Otp');
            return res.render('phone-verify', {
                title: 'Phone verification',
                phone: req.body.phone,
                type: req.body.type
            })

        }
    } else {
        console.log('hiii')

        let data = await client
            .verify
            .services(config.serviceID)
            .verificationChecks
            .create({
                to: `+91${req.body.phone}`,
                code: req.body.otp
            });


        if (data.status == 'approved') {
            return res.render('register', {
                title: 'Register',
                phone: req.body.phone,
                type: req.body.type
            });

        } else {
            req.flash('error', 'Wrong Otp');
            return res.render('phone-verify', {
                title: 'Phone verification',
                phone: req.body.phone,
                type: req.body.type
            })

        }

    }


}

module.exports.reviews = (req, res) => {
    return res.render('reviews', {
        title: 'Reviews'
    })
}

module.exports.scheduleTimings = async(req, res) => {
    let user = await User.findById(req.user.id).populate('schedule_time');

    return res.render('schedule-timings', {
        title: 'Schedule Timings',
        user: user
    })
}

module.exports.search = (req, res) => {
    return res.render('search', {
        title: 'Search'
    })
}

module.exports.socialMedia = (req, res) => {
    return res.render('social-media', {
        title: 'Social Media'
    })
}

module.exports.termCondition = (req, res) => {
    return res.render('term-condition', {
        title: 'Term Condition'
    })
}


module.exports.uploadDocuments = (req, res) => {
    return res.render('upload-documents', {
        title: 'Upload Documents'
    })
}

module.exports.videoCall = (req, res) => {
    return res.render('video-call', {
        title: 'Video Call'
    })
}

module.exports.voiceCall = (req, res) => {
    return res.render('voice-call', {
        title: 'Voice Call'
    })
}

module.exports.verify = async(req, res) => {

    if (req.body.type == 'forgot') {
        console.log(req.body.type)
        client
            .verify
            .services(config.serviceID)
            .verifications
            .create({
                to: `+91${req.body.phone}`,
                channel: req.query.service
            }).then((data) => {

                return res.render('phone-verify', {
                    title: 'Phone verification',
                    phone: req.body.phone,
                    type: req.body.type

                });
            });

    } else {

        console.log('hii')
        let user = await User.findOne({ phone: req.body.phone });

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
                    return res.render('phone-verify', {
                        title: 'Phone verification',
                        phone: req.body.phone,
                        type: req.body.type

                    });
                });

        }
    }

}