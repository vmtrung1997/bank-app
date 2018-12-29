const express = require('express');
const router = express.Router();
const ObjectId = require('mongoose').mongo.ObjectId;
var nodemailer = require('nodemailer');
var mailFormat = require('../fn/mailer')
var generator = require('generate-serial-number');
var
var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'cppgroupcntt@gmail.com',
        pass: '123789abc'
    }
});

var moment = require('moment');
var jwt = require('jsonwebtoken');

const User = require('../models/user');
const Account = require('../models/account');
const Transaction = require('../models/transaction');
const CodeOpt = require('../models/codeOpt');

const { TRANFER_FEE } = require('../../config.js');

router.post('/account_list', (req, res) => {
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
            if (result.role_id !== 'CLIENT') {
                res.status(400).json({
                    status: 'fail',
                    msg: 'Invalid role id'
                })
            }
            else {
                Account.find({ userId: req.body._id }, (error, data) => {
                    if (data) {
                        res.status(200).json({
                            status: 'success',
                            accountList: data
                        })
                    } else {
                        res.status(400).json({
                            status: 'fail',
                            msg: error
                        })
                    }
                })
            }
        }
    })
})

router.post('/transfer', (req, res) => {
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
            if (result.role_id !== 'CLIENT') {
                res.status(400).json({
                    status: 'fail',
                    msg: 'Invalid role id'
                })
            }
            else {
                var data = req.body;
                var userId = new ObjectId(data.userId);
                User.findOne({ _id: userId }, (error, data) => {
                    if (data) {
                        var code = generator.generate(6);
                        var codeOpt = new CodeOpt({
                            accountId: data.accountId,
                            detail: data.detail,
                            code: code
                        })
                        codeOpt.save().then(doc => {
                            if (doc) {
                                var mail = mailFormat(data.email, doc.accountId, doc.code);
                                var mailOptions = {
                                    from: 'no-reply@yourwebapplication.com',
                                    to: data.email,
                                    subject: 'Verify transfer money',
                                    text: mail
                                };
                                transporter.sendMail(mailOptions, (errorMail) => {
                                    if (errorMail) {
                                        res.status(400).json({
                                            status: 'fail',
                                            msg: errorMail
                                        })
                                    } else {
                                        res.status(200).json({
                                            status: 'success',
                                            msg: 'MAIL SENT'
                                        })
                                    }
                                })
                            } else {
                                res.status(500).json({
                                    status: 'fail',
                                    msg: error
                                })
                            }
                        })
                    } else {
                        res.status(400).json({
                            status: 'fail',
                            msg: 'User not found'
                        })
                    }

                })
            }
        }
    })
})

router.post('/submit_opt', (req, res) => {
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
            if (result.role_id !== 'CLIENT') {
                res.status(400).json({
                    status: 'fail',
                    msg: 'Invalid role id'
                })
            }
            else {
                // Find code opt
                CodeOpt.findOne({ accountId: req.body.accountId, code: req.body.code }, (errorCode, dataCode) => {
                    if (errorCode) {
                        res.code(400).json({
                            status: 'fail',
                            msg: 'INVALID CODE'
                        })
                    } else {
                        var detail = dataCode.detail;
                        if (detail.balance < TRANFER_FEE){
                            res.status(400).json({
                                status: 'fail',
                                msg: 'Transfer money must be greater than transfer fee'
                            })
                        }
                        Account.findOne({ accountId: detail.accountId }, (error, data) => {
                            if (data) {
                                if (data.balance < detail.balance) {
                                    res.code(400).json({
                                        status: 'fail',
                                        msg: 'Account balance can not afford to make a deposit'
                                    })
                                } else {
                                    var transferType = detail.type;
                                    switch (transferType) {
                                        // Case recipent pay fee
                                        case 'RECIPIENT FEE':
                                            var accountObj = Account.findOne({ accountId: detail.accountTo })
                                            if (accountObj.balance < TRANFER_FEE) {
                                                res.status(400).json({
                                                    status: 'fail',
                                                    msg: 'Recipient balance must be greater than transfer fee (1000 Dong)'
                                                })
                                            }
                                            else {
                                                var balanceAccountFrom = data.balance - detail.balance;
                                                Account.updateOne({ accountId: detail.accountFrom }, {
                                                    $set: {
                                                        'balance': balanceAccountFrom
                                                    }
                                                }, (errorAccountFromUpdate) => {
                                                    if (errorAccountFromUpdate) {
                                                        res.status(400).json({
                                                            status: 'fail',
                                                            msg: errorAccountFromUpdate
                                                        })
                                                    } else {
                                                        var balanceAccountTo = accountObj.balance - TRANFER_FEE
                                                        Account.updateOne({ accountId: detail.accountTo }, {
                                                            $set: {
                                                                'balance': balanceAccountTo
                                                            }
                                                        }, (errorAccountToUpdate) => {
                                                            if (errorAccountToUpdate) {
                                                                res.status(400).json({
                                                                    tatus: 'fail',
                                                                    msg: errorAccountToUpdate
                                                                })
                                                            } else {
                                                                var trans = new Transaction({ ...detail, time: Date.now })
                                                                trans.save().then(value => {
                                                                    res.status(200).json({
                                                                        status: 'success',
                                                                        data: value
                                                                    })
                                                                })
                                                            }
                                                        })
                                                    }
                                                })
                                            };
                                            break;
                                        case 'PAYER FEE':
                                            if (data.balance < TRANFER_FEE + detail.balance) {
                                                res.status(400).json({
                                                    status: 'fail',
                                                    msg: 'Account balance can not afford to make a deposit'
                                                })
                                            } else {
                                                var balanceAccountFrom = data.balance - detail.balance - TRANFER_FEE;
                                                Account.updateOne({ accountId: detail.accountFrom }, {
                                                    $set: {
                                                        'balance': balanceAccountFrom
                                                    }
                                                }, (errorAccountFromUpdate) => {
                                                    if (errorAccountFromUpdate) {
                                                        res.status(400).json({
                                                            status: 'fail',
                                                            msg: errorAccountFromUpdate
                                                        })
                                                    } else {
                                                        var trans = new Transaction({ ...detail, time: Date.now })
                                                        trans.save().then(value => {
                                                            res.status(200).json({
                                                                status: 'success',
                                                                data: value
                                                            })
                                                        })
                                                    }
                                                })
                                            };
                                            break;
                                    }
                                }
                                var transferType = detail.type;
                            } else {
                                res.status(400).json({
                                    status: 'fail',
                                    msg: error
                                })
                            }
                        })
                    }
                })

            }
        }
    })
})

router.post('/transaction', (req, res) => {
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
            if (result.role_id !== 'CLIENT') {
                res.json({
                    status: 'fail',
                    msg: 'Invalid role id'
                })
            }
            else {
                Transaction.find({ accountFrom: req.body.accountId }, (error, data) => {
                    if (data) {
                        res.json({
                            status: 'success',
                            transaction: data
                        })
                    } else {
                        res.json({
                            status: 'fail',
                            msg: error
                        })
                    }
                })
            }
        }
    })
})

module.exports = router