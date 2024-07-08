const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const apikeyschema = new Schema ({
    apiKey:{
        type: String,
        required: true
    },
    name:{
        type: String,
        required: true
    },
    companies:{
        type: Array,
        required: false
    }
})

module.exports = mongoose.model("apiKey", apikeyschema)