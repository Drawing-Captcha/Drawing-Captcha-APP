const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const allowedOriginschema = new Schema ({
    allowedOrigin:{
        type: String,
        required: true
    },
    companies:{
        type: Array,
        required: false

    }
})

module.exports = mongoose.model("allowedOrigin", allowedOriginschema)