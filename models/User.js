const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema ({
    username:{
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true   
    },
    password:{
        type: String,
        required: true
    },
    role:{
        type: String,
        required: true
    },
    ppURL:{
        type: String,
        required: false
    },
    initialUser:{
        type: Boolean,
        required: false
    },
    companies:{
        type: Array,
        required: false
    }
    
})

module.exports = mongoose.model("User", userSchema)