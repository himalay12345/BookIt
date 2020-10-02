const config = require('../config/twilio');
const User = require('../models/user');
const client = require('twilio')(config.accountSID, config.authToken);
const shortid = require('shortid');
const Razorpay = require('razorpay');


module.exports.home = async(req, res) => {
    let doctors = await User.find({ type: "Doctor" });
    if(req.isAuthenticated())
    {
        let patient = await User.findById(req.user.id).populate({
            path: 'notification',
            populate: {
                path: 'did',
                sort:{createdAt:-1},
                populate: { path: 'user', }
            }
        });
    
        return res.render('index', {
            title: 'Home',
            doctors: doctors,
            patient:patient
        })
    }

    else{
        return res.render('index', {
            title: 'Home',
            doctors: doctors
        })
    }
   
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

module.exports.activeDevice = (req, res) => {
    return res.render('active-device', {
        title: 'Account Settings'
    })
}

module.exports.addBank = (req, res) => {
    return res.render('add-bank', {
        title: 'Add Bank Details'
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

module.exports.appointments = async(req, res) => {

    let patients = await User.findById(req.user.id).populate({
        path: 'patients',
        populate: {
            path: 'pid',
            populate: { path: 'user', }
        }
    });
    return res.render('appointments', {
        title: 'Appointments',
        allpatients: patients
    })
}

module.exports.appointmentDetail = async (req, res) => {
    let patients = await User.findById(req.user.id).populate({
        path: 'doctors',
        populate: {
            path: 'did',
            populate: { path: 'user', }
        }
    });
    return res.render('appointment-detail', {
        title: 'Apppointment Details',
        user:patients,
        i:req.query.index
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
    let doctors = await User.find({ approve1: true, approve2: true });
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
    console.log(dayOfWeek);


    for (temp of doctor.schedule_time) {
        if (temp.day.toUpperCase() == dayOfWeek) {
            if (typeof(temp.booked) == 'string') {
                temp.booked = 0;
            } else {
                temp.booked = [0, 0];
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
module.exports.test = (req, res) => {
    return res.render('test', {
        title: 'Test User'
    })
}
module.exports.test1 = (req, res) => {
    return res.render('test1', {
        title: 'Test1 User'
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

module.exports.deleteAccount = (req, res) => {
    return res.render('delete-acount', {
        title: 'Delete Account'
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


module.exports.doctorDashboard = async(req, res) => {
    let patients = await User.findById(req.user.id).populate({
        path: 'patients',
        populate: {
            path: 'pid',
            populate: { path: 'user', }
        }
    });
    return res.render('doctor-dashboard', {
        title: 'My Dashboard',
        allpatients: patients
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
module.exports.establishment = (req, res) => {
    return res.render('establishment', {
        title: 'Establishment Details'
    })
}


module.exports.educational = (req, res) => {
    return res.render('educational', {
        title: 'Educational Qualification'
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

module.exports.fees = (req, res) => {
    return res.render('fees', {
        title: 'Booking Fees'
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

module.exports.invoiceView = async(req, res) => {

    let doctor = await User.findById(req.query.id);
    return res.render('invoice-view', {
        title: 'Invoice View',
        doctor: doctor,
        order: req.query.order,
        date: req.query.date,
        fee: req.query.fee
    })
}

module.exports.invoices = async(req, res) => {
    let patients = await User.findById(req.user.id).populate({
        path: 'patients',
        populate: {
            path: 'pid',
            populate: { path: 'user', }
        }
    });
    return res.render('invoices', {
        title: 'Invoices',
        allpatients: patients
    })
}
module.exports.idProof = (req, res) => {
    return res.render('identity-proof', {
        title: 'ID Proof'
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

module.exports.myPatients = async(req, res) => {
    let patients = await User.findById(req.user.id).populate({
        path: 'patients',
        populate: {
            path: 'pid',
            populate: { path: 'user', }
        }
    });
    return res.render('my-patients', {
        title: 'My users',
        allpatients: patients
    })
}

module.exports.medicalRegistration = (req, res) => {
    return res.render('medical-registration', {
        title: 'Medical Registration'
    })
}

module.exports.medicalProof = (req, res) => {
    return res.render('medical-proof', {
        title: 'Medical Proof'
    })
}

module.exports.medicalRecords = async(req, res) => {
    let user = await User.findById(req.user.id);
    let doctors = await User.findById(req.user.id).populate({
        path: 'doctors',
        populate: {
            path: 'did',
            populate: { path: 'user' }
        }
    });
    return res.render('medical-record', {
        title: 'My Medical Records',
        user: user,
        alldoctors: doctors
    })
}

module.exports.myBilling = async(req, res) => {
    let user = await User.findById(req.user.id);
    let doctors = await User.findById(req.user.id).populate({
        path: 'doctors',
        populate: {
            path: 'did',
            populate: { path: 'user' }
        }
    });
    return res.render('my-billing', {
        title: 'My Billings',
        user: user,
        alldoctors: doctors
    })
}


module.exports.myAppointments = async(req, res) => {
    let user = await User.findById(req.user.id);
    let doctors = await User.findById(req.user.id).populate({
        path: 'doctors',
        populate: {
            path: 'did',
            populate: { path: 'user' }
        }
    });
    return res.render('my-appointments', {
        title: 'My Appointments',
        user: user,
        alldoctors: doctors
    })
}

module.exports.notificationSettings = (req, res) => {
    return res.render('notification-settings', {
        title: 'Notifications Settings'
    })
}


module.exports.otherPatients = async(req, res) => {
    let user = await User.findById(req.user.id);
    let patients = await User.findById(req.user.id).populate({
        path: 'others',
        populate: {
            path: 'doctors',
            populate: {
                path: 'did',
                populate: { path: 'user' }
            }
        }
    });
    return res.render('other-patients', {
        title: 'user Dashboard',
        user: user,
        otherpatients: patients
    })
}

module.exports.patientDashboard = async(req, res) => {
    let user = await User.findById(req.user.id);
    let doctors = await User.findById(req.user.id).populate({
        path: 'doctors',
        populate: {
            path: 'did',
            populate: { path: 'user' }
        }

    });
    return res.render('my-appointments', {
        title: 'user Dashboard',
        user: user,
        alldoctors: doctors
    })
}


module.exports.razorPay = async(req, res) => {
    const razorpay = new Razorpay({
        key_id: 'rzp_test_KPgD2YFDnBI7Ib',
        key_secret: 'dlb3M9b3nEWXU6TYSzRlDhTJ'
    });

    const payment_capture = 1;
    const amount = 499;
    const currency = 'INR';
    const response = await razorpay.orders.create({
        amount: amount * 100,
        currency,
        receipt: shortid.generate(),
        payment_capture
    });

    console.log(response);
    var options = {
        "key": "rzp_test_KPgD2YFDnBI7Ib",
        "amount": response.amount,
        "currency": response.currency,
        "name": "Book It",
        "description": "Procced to pay your booking fee.",
        "image": "/img/logo.png",
        "order_id": response.id,
        "handler": function(response) {
            alert(response.razorpay_payment_id);
            alert(response.razorpay_order_id);
            alert(response.razorpay_signature)
        },
        "prefill": {
            "name": "Gaurav Kumar",
            "email": "gaurav.kumar@example.com",
            "contact": "9999999999"
        },
        "notes": {
            "address": "Razorpay Corporate Office"
        },
        "theme": {
            "color": "#F37254"
        }
    };
    var rzp1 = new Razorpay(options);
    rzp1.open();


}


module.exports.refund = async(req, res) => {
    return res.render('refund', {
        title: 'Refund'
    });
}

module.exports.prescription = async(req, res) => {
    let user = await User.findById(req.user.id);
    let doctors = await User.findById(req.user.id).populate({
        path: 'doctors',
        populate: {
            path: 'did',
            populate: { path: 'user' }
        }
    });
    return res.render('prescription', {
        title: 'My Prescription',
        user: user,
        alldoctors: doctors
    })
}
module.exports.pay = async(req, res) => {
    let user = await User.findById(req.user.id)

    return res.render('pay', {
        title: 'Payment',
        user: user
    })
}

module.exports.patientProfile = async(req, res) => {
    let user = await User.findById(req.query.pid).populate({
        path: 'doctors',
        populate: {
            path: 'did',
            populate: { path: 'user' }
        }
    });
    let doctor = await User.findById(req.query.doctorid);
    return res.render('patient-profile', {
        title: 'Patient Profile',
        user1: user,
        doctor: doctor
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
module.exports.profileInfo = async(req, res) => {
    let user = await User.findById(req.user.id);
    return res.render('profile-info', {
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

module.exports.steps = (req, res) => {
    // if(req.user.approve == true)
    // {
    //     return res.redirect('/doctor-dashboard');
    // }
    return res.render('steps', {
        title: 'Profile Information'
    })
}

module.exports.settings = (req, res) => {
    return res.render('settings', {
        title: 'Settings'
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
    }

    if (req.body.type == 'book') {
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
            let doctor = await User.findById(req.body.doctorid);
            return res.render('checkout', {
                title: 'Phone verification',
                flag: 'login',
                phone: req.body.phone,
                type: req.body.type,
                booked: req.body.booked,
                available: req.body.available,
                slotindex: req.body.slotindex,
                dayindex: req.body.dayindex,
                id: req.body.id,
                doctor: doctor


            });

        } else {
            req.flash('error', 'Wrong Otp');
            let doctor = await User.findById(req.body.doctorid);
            return res.render('checkout', {
                title: 'Phone verification',
                flag: true,
                phone: req.body.phone,
                type: req.body.type,
                booked: req.body.booked,
                available: req.body.available,
                slotindex: req.body.slotindex,
                dayindex: req.body.dayindex,
                id: req.body.id,
                doctor: doctor


            });

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


module.exports.terms = (req, res) => {
    return res.render('terms', {
        title: 'Term Condition'
    })
}


module.exports.timing = (req, res) => {
    return res.render('timing', {
        title: 'Timings'
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
        if (req.body.type == 'book') {
            client
                .verify
                .services(config.serviceID)
                .verifications
                .create({
                    to: `+91${req.body.phone}`,
                    channel: req.query.service
                }).then(async(data) => {

                    let doctor = await User.findById(req.body.doctorid);
                    return res.render('checkout', {
                        title: 'Phone verification',
                        flag: true,
                        phone: req.body.phone,
                        type: req.body.type,
                        booked: req.body.booked,
                        available: req.body.available,
                        slotindex: req.body.slotindex,
                        dayindex: req.body.dayindex,
                        id: req.body.id,
                        doctor: doctor


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

}