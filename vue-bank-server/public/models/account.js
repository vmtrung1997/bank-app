var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var accountSchema = new Schema({
    userId: String,
    accountId: String,
    balance: Number
});
const model = mongoose.model('Account', accountSchema, 'Account');
module.exports = model;