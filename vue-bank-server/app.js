var express = require('express'),
    bodyParser = require('body-parser'),
    morgan = require('morgan'),
    cors = require('cors');

var app = express();

app.use(morgan('tiny'));
app.use(bodyParser.json());
app.use(cors());

var userCtrl = require('./public/apiControllers/userController')
var logoutCtrl = require('./public/apiControllers/logoutController')
var staffCtrl = require('./public/apiControllers/staffControllers')
var clientCtrl = require('./public/apiControllers/clientController')
var verifyAccessToken = require('./public/repos/authRepo').verifyAccessToken;

app.use('/api/user', userCtrl);
app.use('/api/logout', verifyAccessToken, logoutCtrl);
app.use('/api/staff', verifyAccessToken, staffCtrl);
app.use('/api/client', verifyAccessToken, clientCtrl);
app.get('/', (req, res) => {
    res.json({
        msg: 'hello from nodejs express api'
    })
});

var port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`server runing on port ${port}`);
})