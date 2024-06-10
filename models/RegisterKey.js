const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const RegisterKeySchema = new Schema ({
    RegisterKey:{
        type: String,
        required: true
    }
})

module.exports = mongoose.model("registerKey", RegisterKeySchema)