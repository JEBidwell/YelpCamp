const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const passportLocalMongoose = require('passport-local-mongoose');

const UserSchema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true,
    }
    //no need to specify username or password
})

UserSchema.plugin(passportLocalMongoose);//Adds username and password

module.exports = mongoose.model('User', UserSchema);