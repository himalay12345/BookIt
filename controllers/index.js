const config = require('../config/twilio');
const User = require('../models/user');
const client = require('twilio')(config.accountSID, config.authToken);
const Test = require('../models/test');
const Consult = require('../models/consult');

const shortid = require('shortid');
const Razorpay = require('razorpay');
const env = require('../config/environment');
const emailVerification = require('../mailers/email-otp');




module.exports.home = async(req, res) => {
    let doctors = await User.find({ type: "Doctor" ,approve1: true, approve2: true, booking_service: true});
    let ar = [];
    for(i of doctors)
    {
        ar.push({
            name: i.name,
            id : i.id,
            dept: i.department,
            avatar: i.avatar
        });
    }

    console.log(ar);
    let consults = await Consult.find({})
    console.log(consults);
    if (req.isAuthenticated()) {
        let patient = await User.findById(req.user.id).populate({
            path: 'notification',
            populate: {
                path: 'did',
                populate: { path: 'user', }
            }
        });

        return res.render('index', {
            title: 'Home',
            doctors: doctors,
            consults: consults,
            patient: patient,
            ar:JSON.stringify(ar)
        })
    } else {
        return res.render('index', {
            title: 'Home',
            doctors: doctors,
            consults: consults,
            ar:JSON.stringify(ar)
        })
    }

}

module.exports.addBilling = (req, res) => {
    return res.render('add-billing', {
        title: 'Add Billing'
    })
}
module.exports.consult = async(req, res) => {
    let doctors = await User.find({ type: "Doctor" });
    let consults = await Consult.find({});

    return res.render('consult', {
        title: 'Consult',
        doctors: doctors,
        consults: consults
    })
}
module.exports.addPrescription = (req, res) => {
    return res.render('add-prescription', {
        title: 'Add Prescription'
    })
}



module.exports.addBank = (req, res) => {
    if (req.user.approve1 == true && req.user.approve2 == true) {
        return res.redirect('/doctor-dashboard');
    }
    return res.render('add-bank', {
        title: 'Add Bank Details'
    })
}




module.exports.Specialist = async function(req, res) {



    let doctors = await User.find({
        department: req.query.dep,
        type: "Doctor",
        approve1: true, approve2: true, booking_service: true
    });


    return res.render('specialist', {
        doctors: doctors,
        title: 'Specialist'
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

module.exports.appointmentDetail = async(req, res) => {
    let patients = await User.findById(req.user.id).populate({
        path: 'doctors',
        populate: {
            path: 'did',
            populate: { path: 'user', }
        }
    });
    return res.render('appointment-detail', {
        title: 'Apppointment Details',
        user: patients,
        i: req.query.index
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
    let doctors = await User.find({ approve1: true, approve2: true, booking_service: true });
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
            }

            if (typeof(temp.booked) == 'number') {
                temp.booked = 0;
            } else {
                temp.booked = [0, 0];
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

module.exports.bookingServiceSetting = (req, res) => {
    return res.render('booking-service-setting', {
        title: 'Booking-Service'
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

module.exports.chatDoctor = async(req, res) => {
    let user = await User.findById(req.user.id)
    return res.render('chat-doctor', {
        title: 'Chat user'
    })
}
module.exports.test = async(req, res) => {
    let test = await Test.find({})
    return res.render('test', {

        title: 'Tests',
        test: test


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
    return res.render('email-verification', {
        title: 'Components'
    })
}

module.exports.comingSoon = (req, res) => {
    return res.render('coming-soon', {
        title: 'Coming-Soon'
    })
}
module.exports.appComingSoon = (req, res) => {
    return res.render('app_coming_soon', {
        title: 'App Coming-Soon'
    })
}

module.exports.changeBankAccount = (req, res) => {
    return res.render('change-bank-account', {
        title: 'Change Bank Acoount'
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

    let staff = await User.findById(patients.staff_id);
    return res.render('doctor-dashboard', {
        title: 'My Dashboard',
        allpatients: patients,
        staff:staff
    })
}

module.exports.doctorProfile = async(req, res) => {
    console.log(req.query.id);
    let doctor = await User.findById(req.query.id).populate({
        path: 'reviews',
        populate: {
            path: 'pid',
            populate: { path: 'user', }
        }
    });

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

module.exports.emailVerified = (req, res) => {
    return res.render('email-verify-success', {
        title: 'Email Verified'
    })
}
module.exports.emailNotVerified = (req, res) => {
    return res.render('email-not-verified', {
        title: 'Email Not Verified'
    })
}
module.exports.establishment = (req, res) => {
    if (req.user.approve1 == true && req.user.approve2 == true) {
        return res.redirect('/doctor-dashboard');
    }
    return res.render('establishment', {
        title: 'Establishment Details'
    })
}


module.exports.educational = (req, res) => {
    if (req.user.approve1 == true && req.user.approve2 == true) {
        return res.redirect('/doctor-dashboard');
    }
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
    if (req.user.approve1 == true && req.user.approve2 == true) {
        return res.redirect('/doctor-dashboard');
    }
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
        fee: req.query.fee,
        name : req.query.name,
        age : req.query.age,
        phone : req.query.phone,
        address:req.query.address,
        gender:req.query.gender,
        layout: 'invoice-view' 

    })
}

module.exports.prescriptionPad = async(req, res) => {

    let doctor = await User.findById(req.query.id);
    return res.render('doctor_prescription_pad', {
        title: 'Invoice View',
        doctor: doctor,
        order: req.query.order,
        date: req.query.date,
        fee: req.query.fee,
        name : req.query.name,
        age : req.query.age,
        phone : req.query.phone,
        address:req.query.address,
        gender:req.query.gender,
        layout: 'doctor_prescription_pad' 

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
    if (req.user.approve1 == true && req.user.approve2 == true) {
        return res.redirect('/doctor-dashboard');
    }
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

module.exports.livePatientTracking = async (req, res) => {
    let doctor = await User.findById(req.query.id);
    var today = new Date();
    var dd = String(today.getDate()).padStart(2, '0');
    var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
    var yyyy = today.getFullYear();
    var weekday = new Array('Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday');
    var dayOfWeek = weekday[today.getDay()].toUpperCase();
    let i = 0;
    let index;
    for(days of doctor.schedule_time)
    {
        if(days.day.toUpperCase() == dayOfWeek)
        {
            index=i;
            break;
        }
        i++;
    }

    if(typeof(doctor.schedule_time[index].start) == 'string')
    {
        return res.redirect(`/patient-tracking/?id=${doctor.staff_id}&slotindex=`)
    }

    if(typeof(doctor.schedule_time[index].start) == 'object')
    {
        return res.render('patient-slot-select',{
            title:'Choose Slot Timing',
            doctor:doctor,
            index:index
        })
    }
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
        title: 'My Patients',
        allpatients: patients
    })
}

module.exports.medicalRegistration = (req, res) => {
    if (req.user.approve1 == true && req.user.approve2 == true) {
        return res.redirect('/doctor-dashboard');
    }
    return res.render('medical-registration', {
        title: 'Medical Registration'
    })
}

module.exports.medicalProof = (req, res) => {
    if (req.user.approve1 == true && req.user.approve2 == true) {
        return res.redirect('/doctor-dashboard');
    }
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
        title: 'My appointments',
        user: user,
        alldoctors: doctors
    })
}


module.exports.razorPay = async(req, res) => {
    const razorpay = new Razorpay({
        key_id: env.razorpay_key_id,
        key_secret: env.razorpay.key_secret
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

module.exports.patientTracking = async(req, res) => {
    if(req.isAuthenticated()){
        if (req.user.type == 'Staff') {
            let user = await User.findById(req.user.id).populate({
                path: 'doctorid',
                populate: {
                    path: 'user'
                }
            });
    
            return res.render('patient-tracking', {
                title: 'Track patients',
                user1: user
    
            })
        }


        else {
            let user = await User.findById(req.query.id).populate({
                path: 'doctorid',
                populate: {
                    path: 'user'
                }
            });
    
    
            return res.render('patient-tracking', {
                title: 'Track patients',
                user1: user,
                slotnumber: req.query.slotindex
    
            })
        }
    }

     else {
        let user = await User.findById(req.query.id).populate({
            path: 'doctorid',
            populate: {
                path: 'user'
            }
        });


        return res.render('patient-tracking', {
            title: 'Track patients',
            user1: user,
            slotnumber: req.query.slotindex

        })
    }
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
    if (req.user.approve1 == true && req.user.approve2 == true) {
        return res.redirect('/doctor-dashboard');
    }
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
    if (req.user.approve1 == true && req.user.approve2 == true) {
        return res.redirect('/doctor-dashboard');
    }
    return res.render('steps', {
        title: 'Profile Information'
    })
}

module.exports.settings = (req, res) => {
    return res.render('settings', {
        title: 'Settings'
    })
}
module.exports.staffLogin = (req, res) => {
    return res.render('staff-login', {
        title: 'Staff Login'
    })
}

module.exports.staffLoginPage = (req, res) => {
    return res.render('staff-login-page', {
        title: 'Staff Login'
    })
}

module.exports.staffDashboard = async(req, res) => {
    let patients = await User.findById(req.user.id);
    return res.render('staff-dashboard', {
        title: 'My Dashboard',
        allpatients: patients
    })
}

module.exports.staffForgotPassword = (req, res) => {
    return res.render('staff-forgot-password', {
        title: 'Staff Login'
    })
}

module.exports.staffSignup = async(req, res) => {

    if (req.body.type == 'email') {
        let doctor = await User.findById(req.body.id);
        if (req.body.otp == doctor.emailkey) {
            return res.render('staff-register', {
                title: 'Staff Register',
                phone: req.body.phone,
                id: req.body.id,
                type: 'email'
            });
        } else {
            req.flash('error', 'Wrong Otp');
            return res.render('doctor-phone-verify', {
                title: 'Phone verification',
                phone: req.body.phone,
                id: req.body.id,
                type: 'email'
            })

        }
    }

    if (req.body.designation == 'Staff') {
        let data = await client
            .verify
            .services(config.serviceID)
            .verificationChecks
            .create({
                to: `+91${req.body.phone}`,
                code: req.body.otp
            });

        console.log(req.body.id);


        if (data.status == 'approved') {
            return res.render('set-password', {
                title: 'Reset Pasword',
                phone: req.body.phone,
                id: req.body.id,
                designation: req.body.designation
            });

        } else {
            req.flash('error', 'Wrong Otp');
            return res.render('doctor-phone-verify', {
                title: 'Phone verification',
                phone: req.body.phone,
                id: req.body.id,
                designation: req.body.designation
            })

        }
    } else {
        let data = await client
            .verify
            .services(config.serviceID)
            .verificationChecks
            .create({
                to: `+91${req.body.phone}`,
                code: req.body.otp
            });

        console.log(req.body.id);


        if (data.status == 'approved') {
            return res.render('staff-register', {
                title: 'Staff Register',
                phone: req.body.phone,
                id: req.body.id
            });

        } else {
            req.flash('error', 'Wrong Otp');
            return res.render('doctor-phone-verify', {
                title: 'Phone verification',
                phone: req.body.phone,
                id: req.body.id
            })

        }
    }



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

module.exports.reviews = async(req, res) => {
    let users = await User.findById(req.user.id).populate({
        path: 'reviews',
        populate: {
            path: 'pid',
            populate: { path: 'user' }
        }
    })
    return res.render('reviews', {
        title: 'Reviews',
        users: users
    })
}

module.exports.scheduleTimings = async(req, res) => {
    let user = await User.findById(req.user.id).populate('schedule_time');

    return res.render('schedule-timings', {
        title: 'Schedule Timings',
        user: user
    })
}
module.exports.staffScheduleTimings = async(req, res) => {
    let user = await User.findById(req.user.id);
    let user1 = await User.findById(user.doctorid).populate('schedule_time');

    return res.render('staff_schedule_timing', {
        title: 'Schedule Timings',
        user: user,
        user1: user1
    })
}

module.exports.staffProfile = async(req, res) => {
    // let user = await User.findById(req.user.id);
    return res.render('staff-profile', {
        title: 'Profile Settings'
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

module.exports.staffBooking = async(req, res) => {
    let doctor = await User.findById(req.query.id);
    let user1 = await User.findById(req.user.id).populate('doctorid');
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
    }
    // var todayd = new Date();
    // for (temp of user1.tracked) {
    //     if (todayd > temp.createdAt) {
    //         user1.tracked.pull(temp._id);
    //     }
    // }

    // user1.save()


    doctor.save();

    return res.render('staff-booking-page', {
        title: 'Booking',
        doctor: doctor,
        user1: user1
    })
}

module.exports.termCondition = (req, res) => {
    return res.render('term-condition', {
        title: 'Term Condition'
    })
}


module.exports.terms = (req, res) => {
    if (req.user.approve1 == true && req.user.approve2 == true) {
        return res.redirect('/doctor-dashboard');
    }
    return res.render('terms', {
        title: 'Term Condition'
    })
}


module.exports.timing = (req, res) => {
    if (req.user.approve1 == true && req.user.approve2 == true) {
        return res.redirect('/doctor-dashboard');
    }
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

module.exports.verifyDoctor = async(req, res) => {

    const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    var check = re.test(String(req.body.phone).toLowerCase());
    if (check == true) {
        let doctor = await User.findOne({ email: req.body.phone, type: 'Doctor', service: 'google', staff_flag: false });
        if (doctor) {
            var key = Math.floor(100000 + Math.random() * 900000);
            emailVerification.newAlert(doctor, key, req.body.phone);
            doctor.emailkey = key;
            doctor.save();


            return res.render('doctor-phone-verify', {
                title: 'Phone verification',
                phone: req.body.phone,
                type: 'email',
                id: doctor._id,
                designation:'Verify'

            });

        } else {

            req.flash('error', 'Either No Doctor account is associated with this number or Staff account already created.')
            return res.redirect('back');
        }


    } else {
        let doctor = await User.findOne({
            phone: req.body.phone,
            type: 'Doctor',
            staff_flag: false,
            service: 'phone'
        });


        if (doctor) {
            client
                .verify
                .services(config.serviceID)
                .verifications
                .create({
                    to: `+91${req.body.phone}`,
                    channel: req.query.service
                }).then((data) => {




                    return res.render('doctor-phone-verify', {
                        title: 'Phone verification',
                        phone: req.body.phone,
                        id: doctor._id,
                        designation:'Verify'

                    });
                });
        } else {

            req.flash('error', 'Either No Doctor account is associated with this number or Staff account already created.')
            return res.redirect('back');
        }
    }




}

module.exports.verify = async(req, res) => {

    if (req.body.type == 'forgot') {
        let user = await User.findOne({ phone: req.body.phone, service: 'phone', type: 'Staff' });
        console.log(user)
        if (!user) {
            req.flash('error', 'No account linked with this phone number.');
            return res.redirect('back');
        } else {
            console.log(req.body.type)
            client
                .verify
                .services(config.serviceID)
                .verifications
                .create({
                    to: `+91${req.body.phone}`,
                    channel: req.query.service
                }).then((data) => {

                    if (req.body.designation == 'Staff') {


                        return res.render('doctor-phone-verify', {
                            title: 'Phone verification',
                            phone: req.body.phone,
                            type: req.body.type,
                            designation: req.body.designation

                        });

                    } else {

                        return res.render('phone-verify', {
                            title: 'Phone verification',
                            phone: req.body.phone,
                            type: req.body.type

                        });

                    }
                });
        }


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

            let user = await User.findOne({ phone: req.body.phone, service: 'phone' });

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