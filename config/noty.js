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
   if(token == null) return res.sendStatus(401)

   jwt.verify(token, '123456', (err, user) => {
       if(err) return res.sendStatus(403)
       req.user = user
      
   })
   next();
  
}