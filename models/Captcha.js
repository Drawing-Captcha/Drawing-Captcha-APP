const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const captchaSchema = new Schema ({
    ID:{
        type: String,
        required: true,
        unique: true
    },
    Name:{
        type: String,
        required: true,
    },
    URL: {
        type: String,
        required: true
    },
    MaxTolerance:{
        type: String,
        required: true
    },
    MinTolerance:{
        type: String,
        required: true
    },
    ValidateF:{
        type: Array,
        required: true
    },
    validateMinCubes:{
        type: Array,
        required: true
    },
    validateMaxCubes:{
        type: Array,
        required: true
    },
    todoTitle:{
        type: String,
        required: false
    },
    backgroundSize:{
        type: String,
        required: true
    },
    initialCaptcha:{
        type: Boolean,
        required: false
    }
    
})

module.exports = mongoose.model("Captcha", captchaSchema)