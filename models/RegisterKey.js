const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const RegisterKeySchema = new Schema ({
    RegisterKey:{
        type: String,
        required: true
    },
    company:{
        type: String,
        required: false 
    }
})

module.exports = mongoose.model("registerKey", RegisterKeySchema)