const mongoose = require('mongoose');
const feedbackSchema = mongoose.Schema({
    value: {
        type: Number
    },
    description:{
        type:String
    },
    did:{
        type: mongoose.Schema.Types.ObjectId
    }
},
{timestamps:true})


const Feedback = mongoose.model('Feedback', feedbackSchema);
module.exports = Feedback;