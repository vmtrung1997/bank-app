const Account = require('../models/account');
const Transaction = require('../models/transaction');
const Contact = require('../models/contact');

exports.getAccountList = (userId) => {
    return new Promise((resolve,reject) => {
        Account.find({userId: userId}, (error, accountList)=>{
        if (accountList){
            resolve(accountList)
        } else {
            reject(error)
        }
    })})
}

exports.getTransactionList = (userId) => {
    return new Promise((resolve,reject) => {
        Transaction.find({userId: userId}, (error, transList)=>{
        if (transList){
            resolve(transList)
        } else {
            reject(error)
        }
    })})
}

exports.getContactList= (userId)=>{
    return new Promise((resolve,reject) => {
        Contact.find({userId: userId}, (error, contactList)=>{
        if (contactList){
            resolve(contactList)
        } else {
            reject(error)
        }
    })})
}