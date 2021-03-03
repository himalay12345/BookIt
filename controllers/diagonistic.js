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

module.exports.switchLab = async(req, res) => {
    console.log(req.body);

    let uid;
    if(typeof(req.body.id) == 'string')
    uid = req.body.id;

    if(typeof(req.body.id) == 'object')
    uid = req.body.id[req.body.index];
    

    let lab = await User.findById(uid);
    let user = await User.findById(req.user.id)

    let price;
   for(let u of lab.tests)
   {
       for(let u1 of user.cart.tests)
       {
           
           if(u1.testname.trim() == u.testname.trim())
           {
            let day = await User.updateOne({ 'cart.tests._id': u1._id }, {
                '$set': {
                    'cart.tests.$.testprice': u.testprice,
                    'cart.tests.$.labname': lab.name,
                    'cart.tests.$.labid': lab._id
                }
            });
               }
             

       }
   
   
    }

   
    return res.redirect('/diagonistic/cart');
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
    let labs = await User.find({type:'Diagonistic'});
    let nlabs = [];
    let price,cnt=0;
    for(let u of labs)
    {
        price = 0;
        cnt = 0;
        if(u.id == lab.id)
        continue;
        for(let u1 of u.tests)
        {
            for(let u2 of user.cart.tests)
            {
                if(u1.testname.trim()  == u2.testname.trim() ){
                   price = price + parseInt(u1.testprice);
                   cnt++;
                }
            }
        }
        if(cnt == user.cart.tests.length)
        {
            nlabs.push({
                avatar:u.avatar,
                name:u.name,
                price:price,
                address:u.contacts.address,
                city:u.contacts.city,
                id:u._id
            })
        }
        
    }
console.log('new labs are' + nlabs)
    return res.render('cart',{
        title:'My Cart',
        lab:lab,
        user:user,
        nlabs:nlabs
    })
}

module.exports.addPatient = async(req, res) => {
    let user = await User.findById(req.user.id);
    let lab = await User.findById(user.cart.tests[0].labid)

    return res.render('add_patient',{
        title:'Add Patient',
        user:user,
        lab:lab
    })
}

module.exports.addPatientData = async(req, res) => {
    let user = await User.findById(req.user.id);
console.log(req.body)
    if(req.body.edit == 'false')
    {
        if(user.add_patient.length == 0)
        {
            user.add_patient.push(req.body);
            user.save();

            let length  = user.add_patient.length - 1;
            let id = user.add_patient[length]._id;

            return res.json({
                name:req.body.name,
                phone:req.body.phone,
                age:req.body.age,
                gender:req.body.gender,
                id:id
            })
        }
        else{
            for(let u of user.add_patient)
            {
                if(u.flag == true)
                {
                    u.flag = false;
                }
            }

            
            user.add_patient.push(req.body);
            user.save();

            let length  = user.add_patient.length - 1;
            let id = user.add_patient[length]._id;

            return res.json({
                name:req.body.name,
                phone:req.body.phone,
                age:req.body.age,
                gender:req.body.gender,
                id:id
            })

        }
}

else{
    let day = await User.updateOne({ 'add_patient._id': req.body.edit }, {
        '$set': {
            'add_patient.$.name': req.body.name,
            'add_patient.$.phone': req.body.phone,
            'add_patient.$.age': req.body.age,
            'add_patient.$.gender': req.body.gender,
        }
    });
    return res.json({
        name:req.body.name,
        phone:req.body.phone,
        age:req.body.age,
        gender:req.body.gender,
        id:req.body.id
    })

}
}

module.exports.addAddressData = async(req, res) => {
    let user = await User.findById(req.user.id);
console.log(req.body)
    if(req.body.edit == 'false')
    {
        if(user.add_address.length == 0)
        {
            user.add_address.push(req.body);
            user.save();

            let length  = user.add_address.length - 1;
            let id = user.add_address[length]._id;

            return res.json({
                name:req.body.name,
                phone:req.body.phone,
                flatno:req.body.flatno,
                street:req.body.street,
                city:req.body.city,
                pincode:req.body.pincode,
                type:req.body.type,
                id:id
            })
        }
        else{
            for(let u of user.add_address)
            {
                if(u.flag == true)
                {
                    u.flag = false;
                }
            }

            
            user.add_address.push(req.body);
            user.save();

            let length  = user.add_address.length - 1;
            let id = user.add_address[length]._id;

            return res.json({
                name:req.body.name,
                phone:req.body.phone,
                flatno:req.body.flatno,
                street:req.body.street,
                city:req.body.city,
                pincode:req.body.pincode,
                type:req.body.type,
                id:id
            })

        }
}

else{
    let day = await User.updateOne({ 'add_address._id': req.body.edit }, {
        '$set': {
            'add_address.$.name': req.body.name,
            'add_address.$.phone': req.body.phone,
            'add_address.$.flatno': req.body.flatno,
            'add_address.$.street': req.body.street,
            'add_address.$.city': req.body.city,
            'add_address.$.pincode': req.body.pincode,
            'add_address.$.type': req.body.type,
        }
    });
    return res.json({
        name:req.body.name,
        phone:req.body.phone,
        flatno:req.body.flatno,
        street:req.body.street,
        city:req.body.city,
        pincode:req.body.pincode,
        type:req.body.type,
        id:req.body.id
    })

}
}


module.exports.getPatientData = async(req, res) => {
    let user = await User.findById(req.user.id);
    var a ;
    for(let u of user.add_patient)
    {
        if(req.query.id == u._id)
        {
           a = u;
           break;
        }
    }
console.log(a,req.query.id)
    return res.json({
        name:a.name,
        phone:a.phone,
        age:a.age,
        gender:a.gender,
        id:a._id
    })
   
}


module.exports.getAddressData = async(req, res) => {
    let user = await User.findById(req.user.id);
    var a ;
    for(let u of user.add_address)
    {
        if(req.query.id == u._id)
        {
           a = u;
           break;
        }
    }
console.log(a,req.query.id)
    return res.json({
        name:a.name,
        phone:a.phone,
        flatno:a.flatno,
        street:a.street,
        city:a.city,
        pincode:a.pincode,
        type:a.type,
        id:a._id
    })
   
}


module.exports.getPatientByIndex = async(req, res) => {
    let user = await User.findById(req.user.id);

    for(let i=0;i<user.add_patient.length;i++)
            {
                if(i == req.query.index)
                {
                    user.add_patient[i].flag = true;
                }
                else{
                if(user.add_patient[i].flag == true)
                {
                    user.add_patient[i].flag = false;
                }
            }
            }
user.save()

    return res.json({
        name:user.add_patient[req.query.index].name,
        phone:user.add_patient[req.query.index].phone,
        age:user.add_patient[req.query.index].age,
        gender:user.add_patient[req.query.index].gender,
        id:user.add_patient[req.query.index]._id
    })
   
}

module.exports.getAddressByIndex = async(req, res) => {
    let user = await User.findById(req.user.id);
console.log(req.query.index)
    for(let i=0;i<user.add_address.length;i++)
            {
                if(i == req.query.index)
                {
                    user.add_address[i].flag = true;
                }
                else{
                if(user.add_address[i].flag == true)
                {
                    user.add_address[i].flag = false;
                }
            }
            }
user.save()

    return res.json({
        name:user.add_address[req.query.index].name,
        phone:user.add_address[req.query.index].phone,
        flatno:user.add_address[req.query.index].flatno,
        street:user.add_address[req.query.index].street,
        city:user.add_address[req.query.index].city,
        pincode:user.add_address[req.query.index].pincode,
        type:user.add_address[req.query.index].type,
        id:user.add_address[req.query.index]._id
    })
   
}

module.exports.getallPatients = async(req, res) => {
    let user = await User.findById(req.user.id);
    let patients = [];

    for(let u of user.add_patient)
    {
        patients.push({
            name:u.name,
            age:u.age,
            phone:u.phone,
            gender:u.gender,
            id:u._id,
            flag:u.flag
        })
    }

    return res.json(patients);
}

module.exports.getallAddress = async(req, res) => {
    let user = await User.findById(req.user.id);
    let address = [];

    for(let u of user.add_address)
    {
        address.push({
            name:u.name,
            flatno:u.flatno,
            phone:u.phone,
            street:u.street,
            city:u.city,
            type:u.type,
            pincode:u.pincode,
            id:u._id,
            flag:u.flag
        })
    }

    return res.json(address);
}


module.exports.scheduleTiming = async(req, res) => {
    let user = await User.findById(req.user.id).populate('schedule_time');


    return res.render('test-schedule-timings', {
        title: 'Schedule Timings',
        user: user
    })
}


module.exports.setScheduleTiming = async function(req, res) {

    let user = await User.findById(req.user.id);




    if (typeof(req.body.start) == 'string') {
        user.schedule_time.push({
            start: req.body.start,
            end: req.body.end,
            day: req.body.day,
            reset_flag:false,
            alt_flag:false
        })
    }

    if (typeof(req.body.start) == 'object') {
        user.schedule_time.push({
            day: req.body.day,
            start: req.body.start,
            end: req.body.end,
            reset_flag:false,
            alt_flag:false
        });

    }



    user.save();
    console.log(req.body);

    return res.redirect('back');

}

module.exports.updateSchedule = async function(req, res) {


    if ((!req.body.start) || (!req.body.end)) {
        let user = await User.findById(req.user.id);
        user.schedule_time.pull({ _id: req.body.id });
        user.save();
        return res.redirect('back');
    } 
    
    if(req.body.flag)
    {
        if(typeof(req.body.start) == 'string')
        {
            let day = await User.updateOne({ 'schedule_time._id': req.body.id }, {
                '$set': {
                    'schedule_time.$.start': req.body.start,
                    'schedule_time.$.end': req.body.end,
                }
            });
        
        }

        if(typeof(req.body.start) == 'object')
        { 
       
            console.log('index is',req.body.index);
           let user = await User.findById(req.user.id);
          
            let day = await User.updateOne({ 'schedule_time._id': req.body.id }, {
                '$set': {
                    'schedule_time.$.start': req.body.start,
                    'schedule_time.$.end': req.body.end,

                }
            });
        
        }
    }

    else{
    let day = await User.updateOne({ 'schedule_time._id': req.body.id }, {
        '$set': {
            'schedule_time.$.start': req.body.start,
            'schedule_time.$.end': req.body.end
        }
    });

}


    return res.redirect('back');

}

module.exports.booking = async(req, res) => {
    let doctor = await User.findOne({ _id: req.query.id });
    let ndoctor = await User.findOne({ _id: req.query.id });

    if (!doctor) {
        return res.render('not-available', {
            title: 'Doctor Not Availble',
            type: 'Doctor'
        })
    }

    return res.render('test-booking', {
        title: 'Booking',
        doctor: doctor,
        ndoctor: ndoctor
    })

}

module.exports.bookTest = async(req, res) => {
let lab = await User.findById(req.body.did);
let user = await User.findById(req.user.id);

let stime;
let etime;
if(typeof(lab.schedule_time[req.body.dayindex].start) == 'string')
{
  stime = lab.schedule_time[req.body.dayindex].start;
  etime = lab.schedule_time[req.body.dayindex].end;
} 

if(typeof(lab.schedule_time[req.body.dayindex].start) == 'object')
{
  stime = lab.schedule_time[req.body.dayindex].start[req.body.slotindex];
  etime = lab.schedule_time[req.body.dayindex].end[req.body.slotindex];
}

let redirect = '/diagonistic/review-order/?stime='+stime+'&etime='+etime+'&date='+req.body.date+'&lid='+lab._id;

return res.json(redirect);

}

module.exports.createOrder = async(req, res) => {

    let lab = await User.findById(req.query.lid);
    return res.render('create-order',
    {
        title:'Confirm Order',
        stime:req.query.stime,
        etime:req.query.etime,
        date:req.query.date,
        lab:lab,
        index:req.query.index
    })
}

module.exports.trackOrder = async(req, res) => {

    let lab = await User.findById(req.query.lid);
    return res.render('track-order',
    {
        title:'Track Order',
        stime:req.query.stime,
        etime:req.query.etime,
        date:req.query.date,
        lab:lab,
        index:req.query.index
    })
}

module.exports.trackTest = async(req, res) => {

    let lab = await User.findById(req.query.lid);
    return res.render('test-track',
    {
        title:'Track Order',
        stime:req.query.stime,
        etime:req.query.etime,
        date:req.query.date,
        lab:lab,
        index:req.query.index
    })
}

module.exports.printBill = async(req, res) => {

    let lab = await User.findById(req.query.lid);
    return res.render('test-bill',
    {
        lab:lab,
        index:req.query.index,
        layout:'test-bill'
    })
}


module.exports.assignPhlebotomist = async(req, res) => {


   
    let day1 = await User.updateOne({ 'booked_test_user._id': req.query.tid }, {
        '$set': {
            'booked_test_user.$.phlebotomist': true
        }
    });
    let day2 = await User.updateOne({ 'booked_test_lab._id': req.query.lid }, {
        '$set': {
            'booked_test_lab.$.phlebotomist': true
        }
    });

    return res.redirect('back');


}


module.exports.collectSample = async(req, res) => {


   
    let day1 = await User.updateOne({ 'booked_test_user._id': req.query.tid }, {
        '$set': {
            'booked_test_user.$.sample_collection': true
        }
    });
    let day2 = await User.updateOne({ 'booked_test_lab._id': req.query.lid }, {
        '$set': {
            'booked_test_lab.$.sample_collection': true
        }
    });

    return res.redirect('back');


}

module.exports.completeOrder = async(req, res) => {


   
    let day1 = await User.updateOne({ 'booked_test_user._id': req.query.tid }, {
        '$set': {
            'booked_test_user.$.order_complete': true
        }
    });
    let day2 = await User.updateOne({ 'booked_test_lab._id': req.query.lid }, {
        '$set': {
            'booked_test_lab.$.order_complete': true
        }
    });

    return res.redirect('back');


}




module.exports.amountPayable = async(req, res) => {

    return res.render('amount-payable',
    {
        title:'Select Payment',
        labid:req.query.lid,
        stime:req.query.stime,
        etime:req.query.etime,
        date:req.query.date
    })
}

module.exports.bookedTest = async(req, res) => {

    return res.render('booked-test',
    {
        title:'Booked Test'
    })
}

module.exports.orderSuccess = async(req, res) => {

    return res.render('order-success',
    {
        title:'Order Placed Suceessfully',
        index:req.query.index
    })
}

module.exports.bookTestByCash = async(req, res) => {

    let user = await User.findById(req.user.id);
    let lab  = await User.findById(req.body.lid);
    let index = user.booked_test_user.length + 1;
    if(req.body.pay == 'offline')
    {
     
        let patient;
        let address;
        let tests = [];
        let stime = req.body.stime;
        let etime = req.body.etime;
        let date  = req.body.date;
        let mode = 'Offline';
        let lname = lab.name;
        let lid = lab._id;
        for(let u of user.add_patient)
        {
            if(u.flag)
            {
                patient = u;
                break;
            }
        }
        for(let u1 of user.add_address)
        {
            if(u1.flag)
            {
                address = u1;
                break;
            }
        }
        let price = 0;
        for(let u3 of user.cart.tests)
        {
            price = price + parseInt(u3.testprice)
            tests.push({
                testname:u3.testname,
                testprice:u3.testprice
            })
        
        }
        let i = user.cart.tests.length;
        while(i != 0)
        {
            console.log('hii'+i,user.cart.tests.length)
           user.cart.tests.pull(user.cart.tests[0]._id);
           i--;
        
        }

       
        user.booked_test_user.push({
            user:patient,
            address:address,
            tests:tests,
            labname:lname,
            labid:lid,
            mode:mode,
            stime:stime,
            etime:etime,
            date:date,
            totalprice:price,
            order_placed:true

        })

        let length = user.booked_test_user.length;

        lab.booked_test_lab.push({
            uid:user._id,
            tid:user.booked_test_user[length-1]._id,
            user:patient,
            address:address,
            tests:tests,
            labname:lname,
            labid:lid,
            mode:mode,
            stime:stime,
            etime:etime,
            date:date,
            totalprice:price,
            order_placed:true
        })

        user.save()
        lab.save()
    }
   return res.redirect('/diagonistic/order-success/?index='+index);
}


