const express = require('express');
const router = express.Router();
const ObjectId = require('mongoose').mongo.ObjectId;
const md5 = require('md5');

var generator = require('generate-serial-number');
var moment = require('moment');
var jwt = require('jsonwebtoken');

const User = require('../models/user');
const Account = require('../models/account');
const Transaction = require('../models/transaction');

router.post('/create_user', (req, res) => {
    var token = req.headers['x-access-token'];
    var decode = jwt.decode(token);
    var idStaff = new ObjectId(decode.user._id)
    User.findOne({ _id: idStaff }, (err, result) => {
        if (err) {
            res.status(400).json({
                status: 'fail',
                msg: err
            })
        } else {
            if (result.role_id !== 'STAFF') {
                res.status(400).json({
                    status: 'fail',
                    msg: 'Invalid role id'
                })
            }
            else {
                var userObject = req.body;
                userObject.password = md5(userObject.password);
                userObject.role_id = 'CLIENT'
                var user = new User(userObject);
                user.save().then(value => {
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
            }
        }
    })
})

router.post('/list_user', (req, res) => {
    var token = req.headers['x-access-token'];
    var decode = jwt.decode(token);
    var idStaff = new ObjectId(decode.user._id)
    User.findOne({ _id: idStaff }, (err, result) => {
        if (err) {
            res.json({
                status: 'fail',
                msg: err
            })
        } else {
            if (result.role_id !== 'STAFF') {
                res.status(400).json({
                    status: 'fail',
                    msg: 'Invalid role id'
                })
            }
            else {
                User.find({role_id: 'CLIENT'}, (err, res) => {
                    if (err){
                        res.status(400).json({
                            status: 'fail',
                            msg: error
                        })
                    } else {
                        res.status(200).json({
                            status: 'success',
                            list: value
                        })                        
                    }
                })
            }
        }
    })
})

router.post('/create_account', (req, res) => {
    var token = req.headers['x-access-token'];
    var decode = jwt.decode(token);
    var idStaff = new ObjectId(decode.user._id)
    User.findOne({ _id: idStaff }, (err, result) => {
        if (err) {
            res.status(400).json({
                status: 'fail',
                msg: err
            })
        } else {
            if (result.role_id !== 'STAFF') {
                res.status(400).json({
                    status: 'fail',
                    msg: 'Invalid role id'
                })
            }
            else {
                var accountId = generator.generate(16);
                var account = new Account({
                    accountId: accountId,
                    userId: req.body._id,
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
            }
        }
    })
})

router.post('/make_deposit', (req, res) => {
    var token = req.headers['x-access-token'];
    var decode = jwt.decode(token);
    var idStaff = new ObjectId(decode.user._id)
    User.findOne({ _id: idStaff }, (err, result) => {
        if (err) {
            res.status(400).json({
                status: 'fail',
                msg: err
            })
        } else {
            if (result.role_id !== 'STAFF') {
                res.status(400).json({
                    status: 'fail',
                    msg: 'Invalid role id'
                })
            }
            else {
                var account = req.body.account;
                var balance = req.body.balance;
                var message = req.body.message || '';

                Account.findOne({accountId: account.accountId}, (errorFind, resultFind)=>{
                    if (resultFind){
                        var increase = resultFind.balance + balance;
                        Account.updateOne({accountId: account.accountId},
                            {
                                $set: {
                                'balance': increase
                            }
                        }, (errorUpdate, resultUpdate) => {
                            if (resultUpdate){
                                var trans = new Transaction({
                                        accountFrom: account.accountId,
                                        type: 'DEPOSIT',
                                        balance: balance,
                                        time: moment().format('YYYY-MM-DD HH:mm:ss'),
                                        message: message
                                    });
                                trans.save().then(transaction => {
                                    res.status(200).json({
                                        status: 'success',
                                        trans: transaction
                                    })
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
        }
    })
})

module.exports = router;