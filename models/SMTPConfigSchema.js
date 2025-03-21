const mongoose = require('mongoose');

const smtpConfigSchema = new mongoose.Schema({
    service: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true },
    host: { type: String },
    port: { type: Number }
}, { collection: 'smtpConfig' });

const SmtpConfig = mongoose.model('SmtpConfig', smtpConfigSchema);

module.exports = SmtpConfig;
