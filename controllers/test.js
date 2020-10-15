const User = require('../models/test');


module.exports.Pregancy = (req, res) => {
    return res.render('Pregancy-test', {
        title: 'Pregancy Test'
    })
}
module.exports.Hba1c = (req, res) => {
    return res.render('Hba1c-test', {
        title: 'Hba1c-Test'
    })
}
module.exports.Blood = (req, res) => {
    return res.render('Blood-test', {
        title: 'Blood Test'
    })
}
module.exports.Malarial = (req, res) => {
    return res.render('Malarial-test', {
        title: 'Malarial Test'
    })
}
module.exports.sugar = (req, res) => {
    return res.render('sugar-test', {
        title: 'Sugar Test'
    })
}
module.exports.thyroid = (req, res) => {
    return res.render('thyroid-test', {
        title: 'thyroid Test'
    })
}