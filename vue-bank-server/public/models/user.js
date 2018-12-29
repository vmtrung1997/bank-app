var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var userSchema = new Schema({
    fullname: String,
    phone: String,
    email: String,
    username: {type: String, unique: true},
    password: { type: String, select: false },
    role_id: String
});
const model = mongoose.model('User', userSchema, 'User');
module.exports = model;
