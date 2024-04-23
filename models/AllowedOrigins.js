const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const allowedOriginschema = new Schema ({
    allowedOrigin:{
        type: String,
        required: true
    }
})

module.exports = mongoose.model("allowedOrigin", allowedOriginschema)