const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    UserId : {
        type : String,
        unique : true,
        index : true
    },
    Username : {
        type : String,
        required : [true,'Create your username'],
        minlength : [3, 'Username must be at least 3 characters long'],
    },
    Password : {
        type : String,
        required : [true,'Password Must be create'],
        minlength : [8, 'Password must be at least 3 characters long'],
    },
    Email : {
        type : String,
        unique : true,
        required :  [true,'email Must be create'],
        match : [/^[A-Za-z0-9+@+.]*$/, 'email cannot contain special characters'],
        lowercase: true,
        index:true
    },
    Mobile: {
        type: String,
        required: true,
        minlength: [10, 'Mobile number must be at least 10 digits'],
        maxlength: [15, 'Mobile number must be at most 15 digits'],  // You can adjust the max length if needed
        match: [/^\+?\d{1,4}?\d{10}$/, 'Mobile number must be in a valid format, with or without country code'],
        index:true

    },    
    Location : {
        type : String,
        required : true,

    },
    createdAt : { 
        type : Date,
        default : Date.now,
    },
},{
    timestamps : true,
})

const users = mongoose.model('user',userSchema)

module.exports = users