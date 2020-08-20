const Patient = require('../models/patient');


module.exports.create = async (req, res)=>{
   let patient = await Patient.create({
       name:req.body.name,
       phone:req.body.phone,
       password:req.body.password
   });

   console.log(patient);
   return res.redirect('/login');
}

module.exports.createSession = function(req,res)
{
    //Todo Later
   return res.redirect('/');
}

module.exports.destroySession = function(req,res)
{
    req.logout();

    return res.redirect('/');
} 