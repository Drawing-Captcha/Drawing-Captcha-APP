const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const colorKitSchema = new Schema ({
    buttonColorValue:{
        type: String,
        required: true
    },
    buttonColorHoverValue:{
        type: String,
        required: true
    },
    selectedCubeColorValue:{
        type: String,
        required: true
    },
    canvasOnHoverColorValue:{
        type: String,
        required: true
    },
    defaultTitle:{
        type: String,
        required: true
    }
})

module.exports = mongoose.model("colorKit", colorKitSchema)