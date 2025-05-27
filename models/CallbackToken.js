const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const CallbackTokenSchema = new Schema ({
    origin:{
        type: String,
        required: true
    },
    token:{
        type: String,
        required: true 
    },
    issuedAt: {
        type: String,
        required: true
    }
})

module.exports = mongoose.model("callbackToken", CallbackTokenSchema)