var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var contactSchema = new Schema({
    userId: String,
    accountNumber: String,
    name: String
});
const model = mongoose.model('Contact', contactSchema, 'Contact');
module.exports = model;