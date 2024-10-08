const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const RegisterKeySchema = new Schema ({
    RegisterKey:{
        type: String,
        required: true
    },
    Company:{
        type: String,
        required: false 
    },
    AppKey: {
        type: Boolean,
        required: false
    }
})

module.exports = mongoose.model("registerKey", RegisterKeySchema)