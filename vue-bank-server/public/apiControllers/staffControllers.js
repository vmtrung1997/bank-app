const express = require('express');
const router = express.Router();
const ObjectId = require('mongoose').mongo.ObjectId;
const md5 = require('md5');

var generator = require('generate-serial-number');
// var moment = require('moment');
var jwt = require('jsonwebtoken');

const User = require('../models/user');
const Account = require('../models/account');
// const Transaction = require('../models/transaction');

// input: 
// {
//     fullname: String,
//     phone: String,
//     email: String,
//     username: String,
//     password: ,
// }
router.post('/create_user', (req, res) => {
    var token = req.headers['x-access-token'];
    var decode = jwt.decode(token);
    var idStaff = new ObjectId(decode.user._id)
    User.findOne({ _id: idStaff }, (err, result) => {
        if (result) {
            if (result.role_id !== 'STAFF') {
                res.status(400).json({
                    status: 'fail',
                    msg: 'Invalid role id'
                })
            }
            else {
                var userObject = req.body;
                console.log(userObject)
                User.findOne({username: userObject.username},(_, usernameFind) => {
                    if (usernameFind){
                        console.log(usernameFind)
                        res.status(400).json({
                            status: 'fail',
                            msg: 'Username has been existed'
                        })
                    } else {
                        User.findOne({email: userObject.email}, (_, emailFind) => {
                            if (emailFind){
                                console.log('Email has been existed')
                                res.status(400).json({
                                    status: 'fail',
                                    msg: 'Email has been existed'
                                })
                            } else {
                                userObject.password = md5(userObject.password);
                                userObject.role_id = 'CLIENT'
                                var user = new User(userObject);
                                user.save().then(value => {
                                    var accountId = generator.generate(16);
                                    var account = new Account({
                                        accountId: accountId,
                                        userId: value._id,
                                        balance: 0
                                    })
                                    account.save().then(() => {
                                            res.status(200).json({
                                                status: 'success',
                                                user: value
                                            })
                                    }).catch(error => {
                                        res.status(400).json({
                                            status: 'fail',
                                            msg: error
                                        })
                                    })
                                }).catch(error => {
                                    res.status(400).json({
                                        status: 'fail',
                                        msg: error
                                    })
                                })
                            }
                        })
                    }
                })
                
            }
        } else {
            res.status(400).json({
                status: 'fail',
                msg: err
            })            
        }
    })
})

router.post('/users', (req, res) => {
    var token = req.headers['x-access-token'];
    var decode = jwt.decode(token);
    var idStaff = new ObjectId(decode.user._id)
    User.findOne({ _id: idStaff }, (err, result) => {
        if (result) {
            if (result.role_id !== 'STAFF') {
                res.status(400).json({
                    status: 'fail',
                    msg: 'Invalid role id'
                })
            }
            else {
                User.find({role_id: 'CLIENT'},'username fullname email phone', (error, values) => {
                    if (values){
                        res.status(200).json({
                            status: 'success',
                            list: values
                        })  
                    } else {
                        res.status(400).json({
                            status: 'fail',
                            msg: error
                        })                                              
                    }
                })
            }
        } else {
            res.json({
                status: 'fail',
                msg: err
            })            
        }
    })
})
// input: req.body
// {
//     _id: String,
// }
router.post('/create_account', (req, res) => {
    var token = req.headers['x-access-token'];
    var decode = jwt.decode(token);
    var idStaff = new ObjectId(decode.user._id)
    User.findOne({ _id: idStaff }, (err, result) => {
        if (result) {
            if (result.role_id !== 'STAFF') {
                res.status(400).json({
                    status: 'fail',
                    msg: 'Invalid role id'
                })
            }
            else {
                console.log(req.body)
                User.findOne({username: req.body.username}, (_, user) => {
                    if (user){
                        console.log(user);
                        var accountId = generator.generate(16);
                        var account = new Account({
                            accountId: accountId,
                            userId: user._id,
                            balance: 0
                        })
                        account.save().then(data => {
                                res.status(200).json({
                                    status: 'success',
                                    account: data
                                })
                        }).catch(error => {
                            res.status(400).json({
                                status: 'fail',
                                msg: error
                            })
                        })
                    } else {
                        res.status(400).json({
                            status: 'fail',
                            msg: 'Username is not existed'
                        })
                    }

                })
            }
        } else {
            res.status(400).json({
                status: 'fail',
                msg: err
            })            
        }
    })
})
// input: req.body
// {
//     "account": String,
//     "balance": Number,
//     "message": String
// }
router.post('/credit', (req, res) => {
    var token = req.headers['x-access-token'];
    var decode = jwt.decode(token);
    var idStaff = new ObjectId(decode.user._id)
    User.findOne({ _id: idStaff }, (err, result) => {
        if (result) {
            if (result.role_id !== 'STAFF') {
                res.status(400).json({
                    status: 'fail',
                    msg: 'Invalid role id'
                })
            }
            else {
                var account = req.body.account;
                var balance = req.body.balance;
                console.log(req.body);
                Account.findOne({accountId: account}, (errorFind, account)=>{
                    if (account){
                        var increase = account.balance + parseInt(balance);
                        Account.updateOne({accountId: account.accountId},
                            {
                                $set: {
                                'balance': increase
                            }
                        }, (errorUpdate, resultUpdate) => {
                            if (resultUpdate){
                                // var trans = new Transaction({
                                //         accountFrom: account.accountId,
                                //         type: 'DEPOSIT',
                                //         balance: balance,
                                //         time: moment().format('YYYY-MM-DD HH:mm:ss'),
                                //         message: message
                                //     });
                                // trans.save().then(transaction => {
                                //     res.status(200).json({
                                //         status: 'success',
                                //         trans: transaction
                                //     })
                                // })
                                res.status(200).json({
                                    status: 'success',
                                    value: resultUpdate
                                })
                            } else {
                                res.status(400).json({
                                    status: 'fail',
                                    msg: errorUpdate,
                                    type: 'update error'
                                })
                            }
                        })
                    } else {
                        res.status(400).json({
                            status: 'fail',
                            msg: errorFind,
                            type: 'find error'
                        })
                    }
                })
            }
        } else {
            res.status(400).json({
                status: 'fail',
                msg: err
            })            
        }
    })
})

module.exports = router;