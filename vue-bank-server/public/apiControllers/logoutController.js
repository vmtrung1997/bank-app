var express = require('express');
const ReToken = require('../models/token')
var router = express.Router();

router.get('/', (req, res) => {
	ReToken.findOneAndDelete({token: req.headers['x-refresh-token']}, function(err){
        if (err){
            console.log(err);
            res.json({
                status: 'fail',
                msg: err
            })
        } else {
            res.statusCode = 201;
            res.json({
                status: 'success',
                logout: true
            })
        }
    })
})

module.exports = router;