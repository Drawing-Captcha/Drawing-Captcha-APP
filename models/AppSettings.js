const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const AppSettingsSchema = new Schema ({
    JWTSecret:{
        type: String,
        required: true
    },
}, {
    validate: {
        validator: async function () {
            const count = await this.model('appSettings').countDocuments();
            return count === 0;
        },
        message: 'Only one entry is allowed in the AppSettings table.'
    }
})

module.exports = mongoose.model("appSettings", AppSettingsSchema)
