const express = require('express');
const router = express.Router();
const ObjectId = require('mongoose').mongo.ObjectId;
var nodemailer = require('nodemailer');
var sgTransport = require('nodemailer-sendgrid-transport');
var mailFormat = require('../fn/mailer');
var clientRepo = require('../repos/clientRepo')
var generator = require('generate-serial-number');

var options = {
    auth: {
        api_user: 'vmtrung1997',
        api_key: '123456Trung'
    }
}
var transporter = nodemailer.createTransport(sgTransport(options));

// var transporter = nodemailer.createTransport({
//     service: 'gmail',
//     auth: {
//       user: 'cppgroupcntt@gmail.com',
//       pass: '123789abc'
//     }
//   });

var jwt = require('jsonwebtoken');

const User = require('../models/user');
const Account = require('../models/account');
const Transaction = require('../models/transaction');
const CodeOTP = require('../models/codeOTP');
const Contact = require('../models/contact');
const { TRANFER_FEE } = require('../../config.js');

// output: account list of user
router.post('/account_list', (req, res) => {
    var token = req.headers['x-access-token'];
    var decode = jwt.decode(token);
    var idStaff = new ObjectId(decode.user._id)
    User.findOne({ _id: idStaff }, (err, result) => {
        if (result) {
            if (result.role_id !== 'CLIENT') {
                res.status(400).json({
                    status: 'fail',
                    msg: 'Invalid role id'
                })
            }
            else {
                Account.find({ userId: result._id }, (error, data) => {
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
        } else {
            res.status(400).json({
                status: 'fail',
                msg: err
            })
        }
    })
})
// input: x-access-token, req.body
// {
//     accountId: String,
//     detail: {
//         type: String, 'RECIPIENT FEE' || 'PAYER FEE'
//         accountTo: String,
//         balance: Number,
//         message: String
//     }
// }
// output: request mail otp
router.post('/transfer', (req, res) => {
    var token = req.headers['x-access-token'];
    var decode = jwt.decode(token);
    var idStaff = new ObjectId(decode.user._id)
    User.findOne({ _id: idStaff }, (err, result) => {
        if (result) {
            if (result.role_id !== 'CLIENT') {
                res.status(400).json({
                    status: 'fail',
                    msg: 'Invalid role id'
                })
            }
            else {
                var data = req.body;
                Account.findOne({ accountId: data.accountId }, (error, account) => {
                    if (account) {
                        var _id = new ObjectId(account.userId);
                        User.findOne({ _id: _id }, (_, user) => {
                            if (user) {
                                console.log(user);
                                var code = generator.generate(6);
                                var mail = mailFormat(user.username, account.accountId, code);
                                console.log(mail)
                                var mailOptions = {
                                    from: 'no-reply@bank-app.com',
                                    to: user.email,
                                    subject: 'Verify transfer money',
                                    html: mail
                                };
                                transporter.sendMail(mailOptions, (errorMail) => {
                                    if (errorMail) {
                                        res.status(400).json({
                                            status: 'fail',
                                            msg: errorMail
                                        })
                                    } else {
                                        var codeOpt = new CodeOTP({
                                            accountId: account.accountId,
                                            detail: data.detail,
                                            code: code
                                        })
                                        codeOpt.save().then(doc => {
                                            if (doc) {
                                                res.status(200).json({
                                                    status: 'success',
                                                    msg: 'MAIL SENT'
                                                })
                                            } else {
                                                res.status(500).json({
                                                    status: 'fail',
                                                    msg: error
                                                })
                                            }
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
                    } else {
                        res.status(400).json({
                            status: 'fail',
                            msg: 'Account not found'
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
// input: 
// {
//     accountId: String,
//     code: String
// }
// output: 'success' || 'fail'
router.post('/submit_opt', (req, res) => {
    var token = req.headers['x-access-token'];
    var decode = jwt.decode(token);
    var idStaff = new ObjectId(decode.user._id)
    User.findOne({ _id: idStaff }, (err, result) => {
        if (result) {
            if (result.role_id !== 'CLIENT') {
                res.status(400).json({
                    status: 'fail',
                    msg: 'Invalid role id'
                })
            }
            else {
                // Find code opt
                CodeOTP.findOne({ accountId: req.body.accountId, code: req.body.code }, (_, dataCode) => {
                    if (dataCode) {
                        var detail = dataCode.detail;
                        if (detail.balance < TRANFER_FEE) {
                            console.log('Transfer money must be greater than transfer fee')
                            res.status(400).json({
                                status: 'fail',
                                msg: 'Transfer money must be greater than transfer fee'
                            })
                        } else {
                            Account.findOne({ accountId: dataCode.accountId }, (error, account) => {
                                if (account) {
                                    if (account.balance < detail.balance) {
                                        res.status(400).json({
                                            status: 'fail',
                                            msg: 'Account balance can not afford to make a deposit'
                                        })
                                    } else {
                                        var transferType = detail.type;
                                        switch (transferType) {
                                            // Case recipent pay fee
                                            case 'RECIPIENT FEE':
                                                Account.findOne({ accountId: detail.accountTo }, (errAccountTo, accountTo) => {
                                                    if (accountTo){
                                                        if (accountTo.balance  < TRANFER_FEE) {
                                                            res.status(400).json({
                                                                status: 'fail',
                                                                msg: 'Recipient balance must be greater than transfer fee (1000 Dong)'
                                                            })
                                                        }
                                                        else {
                                                            var balanceAccountFrom = accountTo.balance - detail.balance;
                                                            Account.updateOne({ accountId: account.accountId }, {
                                                                $set: {
                                                                    'balance': balanceAccountFrom
                                                                }
                                                            }, (_, accountUpdate) => {
                                                                console.log('update account from success')
                                                                if (accountUpdate) {
                                                                    var balanceAccountTo = accountTo.balance - TRANFER_FEE
                                                                    Account.updateOne({ accountId: detail.accountTo }, {
                                                                        $set: {
                                                                            'balance': balanceAccountTo
                                                                        }
                                                                    }, (_,accountToUpdate) => {
                                                                        console.log('update account to success')
                                                                        if (accountToUpdate) {
                                                                            var time = Date.now();
                                                                            var trans = new Transaction({
                                                                                userId: result.userId,
                                                                                accountFrom: account.accountId,
                                                                                accountTo: detail.accountTo,
                                                                                balance: detail.balance,
                                                                                message: detail.message,
                                                                                type: detail.type,
                                                                                time: time
                                                                            })
                                                                            trans.save().then(value => {
                                                                                console.log('transaction save success')
                                                                                CodeOTP.deleteOne({ accountId: account.accountId, code: dataCode.code }, (errorDelete) => {
                                                                                    if (errorDelete) {
                                                                                        res.status(400).json({
                                                                                            status: 'fail',
                                                                                            msg: errorDelete
                                                                                        })
                                                                                    } else {
                                                                                        console.log('delete success')
                                                                                        res.status(200).json({
                                                                                            status: 'success',
                                                                                            data: value
                                                                                        })
                                                                                    }
                                                                                })
                                                                            }).catch(errTrans => {
                                                                                res.status(400).json({
                                                                                    status: 'fail',
                                                                                    msg: errTrans
                                                                                })
                                                                            })
                                                                        } else {
                                                                            res.status(400).json({
                                                                                tatus: 'fail',
                                                                                msg: errorAccountToUpdate
                                                                            })                                                                            
                                                                        }
                                                                    })
                                                                } else {
                                                                    res.status(400).json({
                                                                        status: 'fail',
                                                                        msg: errorAccountFromUpdate
                                                                    })                                                                    
                                                                }
                                                            })
                                                        };
                                                    } else {
                                                        res.status(400).json({
                                                            status: 'fail',
                                                            msg: errAccountTo
                                                        })
                                                    }
                                                })
                                                break;
                                            case 'PAYER FEE':
                                                if (account.balance < TRANFER_FEE + detail.balance) {
                                                    res.status(400).json({
                                                        status: 'fail',
                                                        msg: 'Account balance can not afford to make a deposit'
                                                    })
                                                } else {
                                                    var balanceAccountFrom = account.balance - detail.balance - TRANFER_FEE;
                                                    Account.updateOne({ accountId: account.accountId }, {
                                                        $set: {
                                                            'balance': balanceAccountFrom
                                                        }
                                                    }, (_, accountUpdate) => {
                                                        if (accountUpdate) {
                                                            Account.findOne({ accountId: detail.accountto }, (_, accountToFind) => {
                                                                if (accountToFind) {
                                                                    var balanceAccountTo = accountToFind.balance + detail.balance;
                                                                    Account.updateOne({ accountId: detail.accountTo }, {
                                                                        $set: {
                                                                            'balance': balanceAccountTo
                                                                        }
                                                                    }, (_, accountToUpdate) => {
                                                                        if (accountToUpdate) {
                                                                            var time = Date.now();
                                                                            var trans = new Transaction({
                                                                                userId: result.userId,
                                                                                accountFrom: account.accountId,
                                                                                accountTo: detail.accountTo,
                                                                                balance: detail.balance,
                                                                                message: detail.message,
                                                                                type: detail.type,
                                                                                time: time
                                                                            })
                                                                            trans.save().then(value => {
                                                                                CodeOTP.deleteOne({ accountId: account.accountId, code: dataCode.code }, (errorDelete) => {
                                                                                    if (errorDelete) {
                                                                                        res.status(400).json({
                                                                                            status: 'fail',
                                                                                            msg: errorDelete
                                                                                        })
                                                                                    } else {
                                                                                        res.status(200).json({
                                                                                            status: 'success',
                                                                                            data: value
                                                                                        })
                                                                                    }
                                                                                })
                                                                            }).catch(errTrans => {
                                                                                res.status(400).json({
                                                                                    status: 'fail',
                                                                                    msg: errTrans
                                                                                })
                                                                            })
                                                                        } else {
                                                                            res.status(400).json({
                                                                                status: 'fail',
                                                                                msg: error
                                                                            })
                                                                        }
                                                                    })
                                                                } else {
                                                                    res.status(400).json({
                                                                        status: 'fail',
                                                                        msg: ''
                                                                    })
                                                                }
                                                            })
                                                        } else {
                                                            res.status(400).json({
                                                                status: 'fail',
                                                                msg: errorAccountFromUpdate
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

                    } else {
                        res.code(400).json({
                            status: 'fail',
                            msg: 'INVALID CODE'
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
// create contact
// input: 
// {
//     userId,
//     accountId,
//     name,
// }
router.post('/create_contact', (req, res) => {
    var token = req.headers['x-access-token'];
    var decode = jwt.decode(token);
    var idStaff = new ObjectId(decode.user._id)
    User.findOne({ _id: idStaff }, (err, result) => {
        if (result) {
            if (result.role_id !== 'CLIENT') {
                res.status(400).json({
                    status: 'fail',
                    msg: 'Invalid role id'
                })
            }
            else {
                var name = req.body.name;
                if (name == '') {
                    Account.findOne({ accountId: req.body.accountNumber }, (errorAcc, account) => {
                        if (errorAcc){
                            
                        }
                        if (account) {
                            var id = new ObjectId(account.userId);
                            User.findOne({_id: id},(errUser, user) =>{
                                if (user){
                                    var contact = new Contact({
                                        userId: result._id,
                                        accountNumber: req.body.accountNumber,
                                        name: user.fullname,
                                    });
                                    contact.save().then(contact => {
                                        res.status(200).json({
                                            status: 'success',
                                            value: contact
                                        })
                                    }).catch(errContact => {
                                        res.status(400).json({
                                            status: 'fail',
                                            msg: errContact
                                        })
                                    })
                                } else {
                                    res.status(400).json({
                                        status: 'fail',
                                        msg: errUser
                                    })
                                }
                            })
                        } else {
                            res.status(400).json({
                                status: 'fail',
                                msg: errorAcc
                            })                            
                        }
                    })
                } else {
                    var contact = new Contact({
                        userId: result._id,
                        accountNumber: req.body.accountNumber,
                        name: req.body.name,
                    });
                    contact.save().then(contact => {
                        res.status(200).json({
                            status: 'success',
                            value: contact
                        })
                    }).catch(errContact => {
                        res.status(400).json({
                            status: 'fail',
                            msg: errContact
                        })
                    })
                }
            }
        } else {
            res.status(400).json({
                status: 'fail',
                msg: err
            })
        }
    })
})
// output: account list of user
router.get('/contacts', (req, res) => {
    var token = req.headers['x-access-token'];
    var decode = jwt.decode(token);
    var idStaff = new ObjectId(decode.user._id)
    User.findOne({ _id: idStaff }, (err, result) => {
        if (result) {
            if (result.role_id !== 'CLIENT') {
                res.status(400).json({
                    status: 'fail',
                    msg: 'Invalid role id'
                })
            }
            else {
                clientRepo.getContactList(result._id).then(values => {
                    res.status(200).json({
                        status: 'success',
                        contactList: values
                    })
                }).catch(error => {
                    res.status(500).json({
                        status: 'fail',
                        msg: error
                    })
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
// get history transaction
router.post('/transaction', (req, res) => {
    var token = req.headers['x-access-token'];
    var decode = jwt.decode(token);
    var idStaff = new ObjectId(decode.user._id)
    User.findOne({ _id: idStaff }, (err, result) => {
        if (result) {
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
        } else {
            res.json({
                status: 'fail',
                msg: err
            })
        }
    })
})

// get client infomation
router.get('/infomation', (req, res) => {
    var token = req.headers['x-access-token'];
    var decode = jwt.decode(token);
    var idStaff = new ObjectId(decode.user._id)
    User.findOne({ _id: idStaff }, (err, result) => {
        if (result) {
            if (result.role_id !== 'CLIENT') {
                res.status(400).json({
                    status: 'fail',
                    msg: 'Invalid role id'
                })
            }
            else {
                clientRepo.getAccountList(result._id).then(accountList => {
                    clientRepo.getTransactionList(result._id).then(transList => {
                        clientRepo.getContactList(result._id).then(contactList => {
                            res.status(200).json({
                                status: 'success',
                                value: {
                                    accountList: accountList,
                                    transList: transList,
                                    contactList: contactList
                                }
                            })
                        }).catch(contactErr => res.status(400).json({
                            status: 'fail',
                            msg: contactErr
                        }))
                    }).catch(transErr => res.status(400).json({
                        status: 'fail',
                        msg: transErr
                    }))
                }).catch(accountErr => res.status(400).json({
                    status: 'fail',
                    msg: accountErr
                }))
            }
        } else {
            res.json({
                status: 'fail',
                msg: err
            })
        }
    })
})


module.exports = router