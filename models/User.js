const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Crear el esquema
const UserSchema = new Schema({
    name: {
        type: String,
        required:true
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required:true
    },
    avatar: {
        type:String
    },
    date: {
        type: Date,
        default: Date.now
    }
});
// @param 1 nombre del esquema en la bd
// @param 2 estructura del esquema
module.exports = User = mongoose.model('user',UserSchema)