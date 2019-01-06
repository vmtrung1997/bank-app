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
const TRANFER_FEE = 1000;

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
router.post('/get_account', (req, res) => {
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
                Account.findOne({ accountId: req.body.accountId }, (_, data) => {
                    if (data) {
                        var id = new ObjectId(data.userId);
                        User.findOne({ _id: id }, (errorUser, user) => {
                            if (user) {
                                res.status(200).json({
                                    status: 'success',
                                    user: {
                                        fullname: user.fullname,
                                        email: user.email,
                                        phone: user.phone
                                    }
                                })
                            } else {
                                res.status(400).json({
                                    status: 'fail',
                                    msg: errorUser
                                })
                            }
                        })
                    } else {
                        res.status(400).json({
                            status: 'fail',
                            msg: 'Account number is not found'
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
                        console.log(account)
                        var _id = new ObjectId(account.userId);
                        User.findOne({ _id: _id }, (_, user) => {
                            if (user) {
                                console.log(user)
                                var code = generator.generate(6);
                                var mail = mailFormat(user.username, account.accountId, code);
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
                                        console.log('mail error');
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
                console.log(req.body);
                CodeOTP.findOne({ accountId: req.body.accountId, code: req.body.code }, (_, dataCode) => {
                    if (dataCode) {
                        console.log(dataCode);
                        var detail = dataCode.detail;
                        detail.balance = parseInt(detail.balance, 10)
                        Account.findOne({ accountId: dataCode.accountId }, (error, account) => {
                            if (account) {
                                CodeOTP.deleteOne({ accountId: account.accountId, code: dataCode.code }, (errorDelete) => {
                                    if (errorDelete) {
                                        res.status(400).json({
                                            status: 'fail',
                                            msg: errorDelete
                                        })
                                    } else {
                                        if (detail.balance < TRANFER_FEE) {
                                            console.log('Transfer money must be greater than transfer fee')
                                            res.status(400).json({
                                                status: 'fail',
                                                msg: 'Transfer money must be greater than transfer fee'
                                            })
                                        } else {
                                            console.log('detail.balance > TRANFER_FEE')
                                            console.log(account.balance);
                                            console.log(detail.balance);
                                            if (account.balance < detail.balance) {
                                                console.log('account.balance < detail.balance')
                                                res.status(400).json({
                                                    status: 'fail',
                                                    msg: 'Account balance can not afford to make a deposit'
                                                })
                                            } else {
                                                var transferType = detail.type;
                                                console.log(transferType)
                                                switch (transferType) {
                                                    // Case recipent pay fee
                                                    case 'RECIPIENT FEE':
                                                        Account.findOne({ accountId: detail.accountTo }, (errAccountTo, accountTo) => {
                                                            if (accountTo) {
                                                                console.log(accountTo)
                                                                if (accountTo.balance < TRANFER_FEE) {
                                                                    res.status(400).json({
                                                                        status: 'fail',
                                                                        msg: 'Recipient balance must be greater than transfer fee (1000 Dong)'
                                                                    })
                                                                }
                                                                else {
                                                                    var balanceAccountFrom = account.balance - detail.balance;
                                                                    Account.updateOne({ accountId: account.accountId }, {
                                                                        $set: {
                                                                            'balance': balanceAccountFrom
                                                                        }
                                                                    }, (_, accountUpdate) => {
                                                                        console.log('update account from success')
                                                                        if (accountUpdate) {
                                                                            var balanceAccountTo = accountTo.balance + detail.balance - TRANFER_FEE
                                                                            Account.updateOne({ accountId: accountTo.accountId }, {
                                                                                $set: {
                                                                                    'balance': balanceAccountTo
                                                                                }
                                                                            }, (_, accountToUpdate) => {
                                                                                console.log('update account to success')
                                                                                if (accountToUpdate) {
                                                                                    var time = Date.now();
                                                                                    var trans = new Transaction({
                                                                                        // userId: account.userId,
                                                                                        accountFrom: account.accountId,
                                                                                        accountTo: detail.accountTo,
                                                                                        balance: detail.balance,
                                                                                        message: detail.message,
                                                                                        type: detail.type,
                                                                                        time: time
                                                                                    })
                                                                                    trans.save().then(value => {
                                                                                        console.log('transaction save success')
                                                                                        res.status(200).json({
                                                                                            status: 'success',
                                                                                            data: value
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
                                                        if (account.balance < (TRANFER_FEE + detail.balance)) {
                                                            console.log('account.balance < (TRANFER_FEE + detail.balance)')
                                                            res.status(400).json({
                                                                status: 'fail',
                                                                msg: 'Account balance can not afford to make a deposit'
                                                            })
                                                        } else {
                                                            console.log('account.balance > (TRANFER_FEE + detail.balance)')
                                                            console.log(account.balance);
                                                            console.log(detail.balance);
                                                            console.log(TRANFER_FEE);
                                                            var balanceAccountFrom = account.balance - detail.balance - TRANFER_FEE;
                                                            console.log('balanceAccountFrom ' + balanceAccountFrom)
                                                            Account.updateOne({ accountId: account.accountId }, {
                                                                $set: {
                                                                    'balance': balanceAccountFrom
                                                                }
                                                            }, (_, accountUpdate) => {
                                                                if (accountUpdate) {
                                                                    console.log(accountUpdate)
                                                                    Account.findOne({ accountId: detail.accountTo }, (_, accountToFind) => {
                                                                        if (accountToFind) {
                                                                            console.log(accountToFind)
                                                                            var balanceAccountTo = accountToFind.balance + detail.balance;
                                                                            Account.updateOne({ accountId: detail.accountTo }, {
                                                                                $set: {
                                                                                    'balance': balanceAccountTo
                                                                                }
                                                                            }, (_, accountToUpdate) => {
                                                                                if (accountToUpdate) {
                                                                                    var time = Date.now();
                                                                                    var trans = new Transaction({
                                                                                        // userId: account.userId,
                                                                                        accountFrom: account.accountId,
                                                                                        accountTo: detail.accountTo,
                                                                                        balance: detail.balance,
                                                                                        message: detail.message,
                                                                                        type: detail.type,
                                                                                        time: time
                                                                                    })
                                                                                    trans.save().then(value => {
                                                                                        res.status(200).json({
                                                                                            status: 'success',
                                                                                            data: value
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
                                        }
                                    }
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
                Account.findOne({ accountId: req.body.accountNumber }, (errorAcc, account) => {
                    if (account) {
                        if (name == '') {
                            var id = new ObjectId(account.userId);
                            User.findOne({ _id: id }, (errUser, user) => {
                                if (user) {
                                    var contact = new Contact({
                                        userId: result._id,
                                        accountNumber: req.body.accountNumber,
                                        name: user.fullname,
                                    });
                                    contact.save().then(contact => {
                                        clientRepo.getContactList(result._id).then(value => {
                                            res.status(200).json({
                                                status: 'success',
                                                contactList: value
                                            })
                                        }).catch(() => {
                                            res.status(400).json({
                                                status: 'fail',
                                                msg: 'Can not get contact list'
                                            })
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
                        }
                        else{
                            var contact = new Contact({
                                userId: result._id,
                                accountNumber: req.body.accountNumber,
                                name: req.body.name,
                            });
                            contact.save().then(contact => {
                                clientRepo.getContactList(result._id).then(value => {
                                    res.status(200).json({
                                        status: 'success',
                                        contactList: value
                                    })
                                }).catch(() => {
                                    res.status(400).json({
                                        status: 'fail',
                                        msg: 'Can not get contact list'
                                    })
                                })
                            }).catch(errContact => {
                                res.status(400).json({
                                    status: 'fail',
                                    msg: errContact
                                })
                            })
                        }
                    } else {
                        res.status(400).json({
                            status: 'fail',
                            msg: `Can not find account ${req.body.accountNumber}`
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

router.post('/delete_contact', (req, res) => {
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
                var id = new ObjectId(req.body.contactId);
                Contact.findByIdAndDelete(id, error => {
                    if (error) {
                        res.status(400).json({
                            status: 'fail',
                            msg: error
                        })
                    } else {
                        clientRepo.getContactList(result._id).then(value => {
                            res.status(200).json({
                                status: 'success',
                                contactList: value
                            })
                        }).catch(() => {
                            res.status(400).json({
                                status: 'fail',
                                msg: 'Can not get contact list'
                            })
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

// update contact
router.post('/update_contact', (req, res) => {
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
                console.log(data);
                var id = new ObjectId(data.idContact);
                Contact.updateOne({ _id: id }, {
                    $set: {
                        accountNumber: data.accountNum,
                        name: data.name
                    }
                }, error => {
                    if (error) {
                        res.status(400).json({
                            status: 'fail',
                            msg: 'Can not update this contact'
                        })
                    } else {
                        clientRepo.getContactList(result._id).then(value => {
                            res.status(200).json({
                                status: 'success',
                                contactList: value
                            })
                        }).catch(() => {
                            res.status(400).json({
                                status: 'fail',
                                msg: 'Can not get contact list'
                            })
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

// output: account list of user
router.post('/submit_close', (req, res) => {
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
                console.log(data);
                Account.findOne({ accountId: data.accountFrom }, (_, accountFrom) => {
                    if (accountFrom) {
                        Account.findOne({ accountId: data.accountTo }, (_, accountTo) => {
                            if (accountTo) {
                                console.log(accountTo);
                                var balance = accountFrom.balance - TRANFER_FEE + accountTo.balance;
                                Account.updateOne({ accountId: data.accountTo }, {
                                    $set: {
                                        'balance': balance
                                    }
                                }, (errUpdate, accountToUpdate) => {
                                    if (accountToUpdate) {
                                        var time = Date.now();
                                        var balance = accountFrom.balance - TRANFER_FEE;
                                        Account.deleteOne({accountId: data.accountFrom}, errorDelete =>{
                                            if (errorDelete){
                                                res.status(400).json({
                                                    status: 'fail',
                                                    msg: errorDelete
                                                })
                                            } else {
                                                var trans = new Transaction({
                                                    accountFrom: data.accountFrom,
                                                    accountTo: data.accountTo,
                                                    balance: balance,
                                                    message: 'Transfer to close',
                                                    type: 'PAYER FEE',
                                                    time: time
                                                });
                                                trans.save().then(() => {
                                                    clientRepo.getAccountList(result._id).then(value => {
                                                        res.status(200).json({
                                                            status: 'success',
                                                            accountList: value
                                                        })
                                                    })
        
                                                })
                                            }
                                        })
                                    } else {
                                        res.status(400).json({
                                            status: 'fail',
                                            msg: errUpdate
                                        })
                                    }
                                })
                            }
                        })
                    } else {
                        res.status(400).json({
                            status: 'fail',
                            msg: 'Can not find account to'
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
// get history transaction
router.get('/transaction', (req, res) => {
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
                Account.find({ userId: decode.user._id }, 'accountId', (_, accounts) => {
                    if (accounts) {
                        accounts = accounts.map(x => x.accountId);
                        var cutoff = new Date();
                        cutoff.setDate(cutoff.getDate()-30);
                        Transaction.find({ accountFrom: { $in: accounts }, time: {$lt: cutoff} }, (error, trans) => {
                            if (trans) {
                                res.json({
                                    status: 'success',
                                    transList: trans
                                })
                            } else {
                                res.json({
                                    status: 'fail',
                                    msg: error
                                })
                            }
                        })
                    } else {
                        res.status(400).json({
                            status: 'fail',
                            msg: 'Invalid role id'
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
                    clientRepo.getTransactionList(accountList).then(transList => {
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


// update current when user transfer success
// return transaction list and accountList
router.get('/update_current', (req, res) => {
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
                        res.status(200).json({
                            status: 'success',
                            value: {
                                accountList: accountList,
                                transList: transList,
                                contactList: contactList
                            }
                        })
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

router.post('/close_account', (req, res) => {
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
                Account.find({ userId: decode.user._id }, (errorFind, accountList) => {
                    if (accountList.length > 1) {
                        var accountId = req.body.accountId;
                        Account.findOne({ accountId: accountId }, (error, account) => {
                            if (account) {
                                if (account.balance > 1000) {
                                    res.status(200).json({
                                        status: 'warning',
                                        msg: `There are ${account.balance - 1000} (dong) can be used. You must be transfer to another account to close account`,
                                        balance: `${account.balance - 1000}`
                                    })
                                }
                                else {
                                    Account.deleteOne({ accountId: accountId }, (errorDelete) => {
                                        if (errorDelete) {
                                            res.status(400).json({
                                                status: 'fail',
                                                msg: errorDelete
                                            })
                                        } else {
                                            res.status(200).json({
                                                status: 'success'
                                            })
                                        }
                                    })
                                }
                            } else {
                                res.status(400).json({
                                    status: 'fail',
                                    msg: error
                                })
                            }
                        })
                    } else if (accountList.length === 1) {
                        console.log(accountList.length = 1)
                        res.status(400).json({
                            status: 'fail',
                            msg: 'Can not delete the only account of user'
                        })
                    } else {
                        res.status(400).json({
                            status: 'fail',
                            msg: errorFind
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

module.exports = router