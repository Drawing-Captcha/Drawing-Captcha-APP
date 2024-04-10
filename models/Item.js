const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const itemSchema = new Schema ({
    ID:{
        type: String,
        required: true,
        unique: true
    },
    Name: {
        type: String,
        required: true
    },
    URL:{
        type: String,
        required: true
    },
    URL:{
        type: String,
        required: true
    },
    MaxTolerance: { 
        type: Number, 
        required: true 
    },
    MinTolerance: { 
        type: Number, 
        required: true 
    },
    ValidateF: { 
        type: [String], 
        required: true 
    },
    validateMinCubes: { 
        type: [String], 
        required: true 
    },
    validateMaxCubes: { 
        type: [String], 
        required: true 
    }
    
})

module.exports = mongoose.model("Item", itemSchema)