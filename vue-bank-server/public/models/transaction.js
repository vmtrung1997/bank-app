var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var transactionSchema = new Schema({
    accountFrom: String,
    type: String,
    accountTo: String,
    balance: Number,
    time: Date,
    userId: String,
    message: String
});
const model = mongoose.model('Transaction', transactionSchema, 'Transaction');
module.exports = model;