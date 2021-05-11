const jwt = require('jsonwebtoken')
module.exports.setFlash = function(req,res,next){
    res.locals.flash = {
        'success':req.flash('success'),
        'error':req.flash('error')
    }
    next();
}

module.exports.authenticateToken = function(req,res,next){
   const authHeader = req.headers['authorization']
   const token = authHeader && authHeader.split(' ')[1]
   if(token == null) return res.status(401).json({status:false,msg:'Unauthorised Aceess.Please login'})

   jwt.verify(token, '123456', (err, user) => {
       if(err) return res.sendStatus(403)
       req.user = user
      
   })
   next();
  
}


module.exports.authenticateWebToken = function(req,res,next){
try{    
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]
    if(token == null) return res.status(401).json({status:false,msg:'Unauthorised Aceess.Please login'})
 
    jwt.verify(token, 'access', (err, user) => {
        if(err){
            throw err;
        } 
        req.user = user
       
    })
    next();
}
catch(err){
   if(err.message == 'jwt expired'){
       return res.json({
           status:false,
           msg:'Access token expired'
       })
    }

       else{
        return res.json({
            status:false,
            msg:'User not authenticated'
        })
       }
}
   
 }