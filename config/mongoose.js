const mongoose = require('mongoose');
const url = 'mongodb://localhost/BookAnAppointment';
const opts = { useNewUrlParser: true ,
    useFindAndModify:false,
    useCreateIndex:true,
    useUnifiedTopology: true
};

mongoose.connect(url, opts);

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'Error in creating database'));
db.once('open', function(){
    console.log('Database successfully created');
});


module.exports = db;