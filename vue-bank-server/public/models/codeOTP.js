var mongoose = require('mongoose');
var Schema = mongoose.Schema;

const codeSchema = new Schema({
    accountId: { type: String, required: true },
    code: { type: String, required: true },
    detail: { type: Object, required: true},
    createdAt: { type: Date, required: true, default: Date.now, expires: 43200 }
});

const model = mongoose.model('CodeOTP', codeSchema, 'CodeOTP');
module.exports = model;