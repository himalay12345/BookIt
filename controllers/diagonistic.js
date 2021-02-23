const bcrypt = require('bcrypt')
const config = require('../config/twilio');
const client = require('twilio')(config.accountSID, config.authToken);
let User = require('../models/user');
let Test = require('../models/test');
const fs = require('fs')
const path = require('path')

module.exports.register = async (req, res) => {
    return res.render('diag-register',{
        title:'Diagonistic Login'
    })
}

module.exports.verifyNew = async(req,res) => {
    if(req.body.phone.length>10)
    {
        req.flash('error', 'Please do not use (+91 or 0) before your phone number.');
        return res.redirect('back');
    }
    
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
                console.log('verify',req.body)
                return res.render('diag-phone-verify', {
                    title: 'Phone verification',
                    phone: req.body.phone,
                });
            });

    }
}

module.exports.createAccount = async(req, res) => {
  

    let data = await client
        .verify
        .services(config.serviceID)
        .verificationChecks
        .create({
            to: `+91${req.body.phone}`,
            code: req.body.otp
        });


    if (data.status == 'approved') {
        console.log('register',req.body)
        return res.render('diag-signup', {
            title: 'Register',
            phone: req.body.phone

            
        });

    } else {
        req.flash('error', 'Wrong Otp');
        return res.render('diag-phone-verify', {
            title: 'Phone verification',
            phone: req.body.phone,

        })

    }
}

module.exports.create = async(req, res) => {
   
    if(req.body.password != req.body.cpassword)
    {
        req.flash('error','Passwords do not match')
        return res.render('diag-signup', {
            title: 'Register',
            phone: req.body.phone
        });
    }
    let hashedPass = await bcrypt.hash(req.body.password,10)
    console.log(req.body.password+'\n'+hashedPass)
    console.log('create',req.body)

    
    let user = await User.create({
        phone: req.body.phone,
        service: 'phone',
        type:'Diagonistic',
        password : hashedPass,
        encrypt : true
    });
    
            
                
                   

    req.flash('success', 'Account created successfully.Please Login!');
    // return res.redirect('/login');
    return res.redirect(307, '/diagonistic/create-session');

}

module.exports.createSession = async function(req, res) {

            if (req.user.approve1 == true && req.user.approve2 == true) {


                return res.redirect('/doctor-dashboard');
            } else {
                return res.redirect('/diagonistic/steps');
            }

}

module.exports.steps = (req, res) => {
    if (req.user.approve1 == true && req.user.approve2 == true) {
        return res.redirect('/doctor-dashboard');
    }
    return res.render('diag-steps', {
        title: 'Diagonistic Information'
    })
}

module.exports.updateProfile = async(req, res) => {

    let doctor = await User.findById(req.user.id);
    User.uploadedAvatar(req, res, function(err) {
        if (err) { console.log('*******Multer Error', err); return; }
        doctor.name = req.body.name;
        doctor.phone = req.body.phone;
        doctor.contacts.city = req.body.city;
        doctor.contacts.address = req.body.address;
        doctor.contacts.state = req.body.state;
        doctor.contacts.pincode = req.body.pincode;

        if (req.files['avatar']) {
            if (!doctor.avatar) {
                doctor.avatar = User.avatarPath + '/' + req.files['avatar'][0].filename;
            } else {
                if (fs.existsSync(path.join(__dirname, '..', doctor.avatar))) {
                    fs.unlinkSync(path.join(__dirname, '..', doctor.avatar));
                }

                
                doctor.avatar = User.avatarPath + '/' + req.files['avatar'][0].filename;
            }
        }

        doctor.step1 = true;
        doctor.save();


    });



    return res.redirect('back');
}

module.exports.profileInfo = async(req, res) => {
    let user = await User.findById(req.user.id);
    if (req.user.approve1 == true && req.user.approve2 == true) {
        return res.redirect('/doctor-dashboard');
    }
    return res.render('diag-profile-info', {
        title: 'Diagonistic Info',
        user: user
    })
}

module.exports.establishment = (req, res) => {
    if (req.user.approve1 == true && req.user.approve2 == true) {
        return res.redirect('/doctor-dashboard');
    }
    return res.render('diag-establishment', {
        title: 'Establishment Details'
    })
}

module.exports.uploadEProof = async function(req, res) {
    let user = await User.findById(req.user.id);

    User.uploadedAvatar(req, res, function(err) {

        if (req.files['avatar']) {
            if (!user.estphoto) {
                user.estphoto = User.avatarPath + '/' + req.files['avatar'][0].filename;
            } else {

                if (fs.existsSync(path.join(__dirname, '..', user.estphoto))) {
                    fs.unlinkSync(path.join(__dirname, '..', user.estphoto));
                }
                user.estphoto = User.avatarPath + '/' + req.files['avatar'][0].filename;
            }
        }

       
            user.step2 = true;
        

        user.save();

    });
    return res.redirect('/diagonistic/steps');

}

module.exports.terms = (req, res) => {
    return res.render('diag-terms', {
        title: 'Terms And Condition'
    })
}
module.exports.acceptAgreement = async(req, res) => {
    let user = await User.findById(req.user.id);
    user.step3 = true;
    user.save();
    return res.redirect('/diagonistic/steps');
}

module.exports.addBank = (req, res) => {
    if (req.user.approve1 == true && req.user.approve2 == true) {
        return res.redirect('/doctor-dashboard');
    }
    return res.render('diag-add-bank', {
        title: 'Add Bank Details'
    })
}

module.exports.bankDetails = async function(req, res) {

    if (req.body.accountnumber != req.body.reaccountnumber) {
        req.flash('error', 'Account numbers donot match!');
        return res.redirect('back');
    } else {

        let user = await User.findById(req.user.id);
        user.bank = {
            bankname: req.body.bankname,
            accountnumber: req.body.accountnumber,
            accountholdername: req.body.accountholdername,
            ifsccode: req.body.ifsccode
        }
        user.step4 = true;
        user.save();

        req.flash('success', 'Bank Details Updated');
        return res.redirect('/diagonistic/steps');
    }
}

module.exports.addTest = async(req, res) => {
   
    let tests = await Test.find({})
    return res.render('diag-add-test', {
        title: 'Add Tests',
        tests:tests
    })
}

module.exports.addTestData = async(req, res) => {
    let user = await User.findById(req.user.id);
    console.log(req.body)
    if(typeof(req.body.testname) == 'string')
    {
    user.tests.push({
        testname:req.body.testname,
        testprice:req.body.testprice[0]
    })
}

if(typeof(req.body.testname) == 'object')
{
    for(let i=0;i<req.body.testname.length;i++){
user.tests.push({
    testname:req.body.testname[i],
    testprice:req.body.testprice[i]
})
    }
}
user.save();
return res.redirect('back');
}

module.exports.deleteTest = async(req, res) => {
    let user = await User.findById(req.user.id);
    user.tests.pull(req.query.id);
    user.save()
    return res.redirect('back')
}

module.exports.updateTest = async(req, res) => {
    console.log(req.body);
    let n1 = await User.update({ "tests._id" : req.query.id}, {
        '$set': {
            
            'tests.$.testprice': req.body.testprice,
            'tests.$.testname': req.body.testname
            
        }
    });
    return res.redirect('back')
}

module.exports.labProfile = async(req, res) => {
    let lab = await User.findById(req.query.id);

    return res.render('lab-profile',{
        title:'Lab Profile',
        lab:lab
    })

}


module.exports.allTests = async(req, res) => {
    let test = await Test.find({});
    let user = await User.findById(req.user.id);
    let labs = await User.find({type:'Diagonistic'});
    let lab;


    console.log(user.cart.tests,lab)
    if(user.cart.tests.length > 0)
    {
    lab = await User.findById(user.cart.tests[0].labid);
    console.log(user.cart.tests,lab)
    }
 

    if(user.cart.tests.length>0)
    {
        return res.render('lab-all-tests1',{
            title:'Book Tests',
            tests:test,
            lab:lab,
            labs:labs,
            user:user
        })
    }
    else{
    return res.render('all-tests',{
        title:'All Tests',
        tests:test,
        labs:labs
    })
}

}

module.exports.allLabs = async(req, res) => {
    let lab = await User.find({type:'Diagonistic'});

    return res.render('all-labs',{
        title:'All Labs',
        labs:lab
    })

}



module.exports.selectLab = async(req, res) => {
    let data =[];
    let lab = await User.find({type:'Diagonistic'});
    for(let u of lab)
    {
        for(let u1 of u.tests)
        {
            if(u1.testname.trim()  == req.query.testname.trim() ){
              
                data.push({
                    name:u.name,
                    avatar:u.avatar,
                    price:u1.testprice,
                    address:u.contacts.address,
                    city:u.contacts.city,
                    id:u.id
                })
                
            }
        }
    }

  return res.json({
      doctors:data
  })
}

module.exports.selectLab1 = async(req, res) => {
    console.log(req.body);
    let tid;
    if(typeof(req.body.tid) == 'string')
    tid = req.body.tid;

    if(typeof(req.body.tid) == 'object')
    tid = req.body.tid[0];

    let uid;
    if(typeof(req.body.id) == 'string')
    uid = req.body.id;

    if(typeof(req.body.id) == 'object')
    uid = req.body.id[req.body.index];
    
    let test = await Test.findById(tid);
    let tests = await Test.find({});
    let labs = await User.find({type:'Diagonistic'});
    let lab = await User.findById(uid);
    let tname;
    for(let u of lab.tests)
    {
        if(u.testname.trim()  == test.testname.trim() ){
            tname = u.testprice;
        }
    }

    let user = await User.findById(req.user.id);
    if(!user.cart){

    user.cart.tests.push({
        testname:test.testname,
        testprice:tname,
        labname:lab.name,
        labid:lab._id
    });
}else{
    let flag = false;
    for(let u1 of user.cart.tests)
    {
        console.log(u1.testname,test.testname)
        if(u1.testname.trim()  == test.testname.trim() ){
          flag = true;
        }
    }
    console.log(flag)
    console.log(user.cart.tests)

    if(!flag)
    {
        user.cart.tests.push({
            testname:test.testname,
            testprice:tname,
            labname:lab.name,
            labid:lab._id
        });
    }
}
    user.save()

    return res.redirect('/diagonistic/lab-all-tests/?labid='+lab._id)
}
module.exports.labAllTests = async(req, res) => {
    let labs = await User.find({type:'Diagonistic'});
    let tests = await Test.find({});
    let user = await User.findById(req.user.id);
    let lab = await User.findById(req.query.labid)
    return res.render('lab-all-tests1',{
        title:'Book Tests',
        tests:tests,
        lab:lab,
        labs:labs,
        user:user
    })
}


module.exports.changeLab1 = async(req, res) => {
  let user = await User.findById(req.user.id);
  let labs = await User.find({type:'Diagonistic'});

  let newlabs = [];
  for(let u of labs)
  {
    var cnt = 0;price=0;
      for(let u1 of u.tests)
      {
         
          for(let u2 of user.cart.tests)
          {
            if(u2.testname.trim()  == u1.testname.trim() ){
                cnt++;
                price+=u1.testprice;
               
              }

              else{
                  break;
              }
          }
          console.log(cnt,user.cart.tests.length)
          if(cnt == user.cart.tests.length)
          {
            console.log(u1.testname,req.query.tname)
        if(u1.testname.trim()  == req.query.tname.trim() ){
            price+=u1.testprice
          newlabs.push({
              avatar:u.avatar,
              name:u.name,
              price:price,
              address:u.contacts.address,
              city:u.contacts.city,
              id:u._id
          })
        }
         }

         
      }
  }
  return res.json({
      tests:user.cart.tests,
      labs:newlabs
  })
}

module.exports.changeLab = async(req, res) => {
    console.log(req.body);
    let tid;
    if(typeof(req.body.tid) == 'string')
    tid = req.body.tid;

    if(typeof(req.body.tid) == 'object')
    tid = req.body.tid[0];

    let uid;
    if(typeof(req.body.id) == 'string')
    uid = req.body.id;

    if(typeof(req.body.id) == 'object')
    uid = req.body.id[req.body.index];
    
    let test = await Test.findById(tid);
    let tests = await Test.find({});
    let labs = await User.find({type:'Diagonistic'});
    let lab = await User.findById(uid);
    let user = await User.findById(req.user.id)

    let price;
   for(let u of lab.tests)
   {
    if(u.testname.trim() == test.testname.trim())
    {
        console.log('new test',test.testname)
        price = u.testprice
    }
       for(let u1 of user.cart.tests)
       {
           
           if(u1.testname.trim() == u.testname.trim())
           {
            let day = await User.updateOne({ 'cart.tests._id': u1._id }, {
                '$set': {
                    'cart.tests.$.labname': lab.name,
                    'cart.tests.$.labid': lab._id
                }
            });
               }
             

       }
   
   
    }


user.cart.tests.push({
    testname:test.testname,
    testprice:price,
    labname:lab.name,
    labid:lab._id

})
    
user.save()
   
    return res.redirect('/diagonistic/lab-all-tests/?labid='+lab._id)
}


module.exports.removeCartItem = async(req, res) => {
    let user = await User.findById(req.user.id);
    let count = 0,price,id;
  console.log('query is' + req.query)
    for(let u of user.cart.tests)
    {
        console.log(u.testname.trim(),req.query.name.trim())
      if(u.testname.trim()  == req.query.name.trim() ){
        console.log('hello')
          price = u.testprice;
          id = u._id;
            break;
        }
        count++;
    }


    user.cart.tests.pull(id);
    user.save()
    console.log(price)

    if(user.cart.tests.length == 0)
    {
        return res.json({
            length:user.cart.tests.length,
            count:count,
            price:price,
            counter:count,
            redirect:'/diagonistic/all-tests'
        }) 
    }

    else{
    
    return res.json({
        length:user.cart.tests.length,
        count:count,
        price:price,
        counter:count
    })
    }
}

module.exports.addCartItem = async(req, res) => {
    let user = await User.findById(req.user.id);
    let test = await Test.findOne({testname:req.query.name});
    let lab = await User.findById(req.query.lid);
let price;
    for(let u of lab.tests)
    {
        console.log(u.testname.trim(),req.query.name.trim())
      if(u.testname.trim()  == req.query.name.trim() ){
        console.log('hello')
          price = u.testprice;
            break;
        }
    }


   
    
    user.cart.tests.push({
        testname:test.testname,
        testprice:price,
        labname:lab.name,
        labid:lab._id
    });
    user.save()
    

    
    return res.json({
        length:user.cart.tests.length,
        testname:test.testname,
        testprice:price,
        count:user.cart.tests.length
    })

}

module.exports.cart = async(req, res) => {
    let user = await User.findById(req.user.id);
    let lab = await User.findById(user.cart.tests[0].labid)

    return res.render('cart',{
        title:'My Cart',
        lab:lab,
        user:user
    })
}
