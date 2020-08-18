const express = require('express');
const port = 4000;
const app = express();

app.use(express.static('./assets'));
app.use('/', require('./routes/index'));
app.set('view engine', 'ejs');
app.set('views', './views');

app.listen(port, function(err) {
    if (err) {
        console.log('Error', err);
        return;
    }

    console.log('Server is running on port ', port);
})