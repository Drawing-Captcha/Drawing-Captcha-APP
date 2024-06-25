const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const companySchema = new Schema ({
    name:{
        type: String,
        required: true
    },
    companyId: {
        type: String,
        required: true,
        unique: true   
    },
    ppURL:{
        type: String,
        required: false
    },
    
})

module.exports = mongoose.model("Company", companySchema)