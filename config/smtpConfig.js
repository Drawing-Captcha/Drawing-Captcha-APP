const SmtpConfig = require('../models/SMTPConfigSchema');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

async function saveSmtpConfigFromEnv() {
    const requiredEnvVars = ['DEFAULT_EMAIL_SERVICE', 'DEFAULT_EMAIL_USER', 'DEFAULT_EMAIL_PASS', 'DEFAULT_EMAIL_HOST', 'DEFAULT_EMAIL_PORT'];

    const missingVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

    if (missingVars.length > 0) {
        console.error(`Missing required environment variables: ${missingVars.join(', ')}`);
        return;
    }

    try {
        const smtpConfig = {
            service: process.env.DEFAULT_EMAIL_SERVICE,
            email: process.env.DEFAULT_EMAIL_USER,
            password: process.env.DEFAULT_EMAIL_PASS,
            host: process.env.DEFAULT_EMAIL_HOST,
            port: parseInt(process.env.DEFAULT_EMAIL_PORT, 10)
        };

        const existingConfig = await SmtpConfig.findOne();
        if (existingConfig) {
            await SmtpConfig.updateOne({}, smtpConfig);
        } else {
            const newConfig = new SmtpConfig(smtpConfig);
            await newConfig.save();
        }
        console.log('SMTP configuration saved successfully.');
    } catch (error) {
        console.error('Error saving SMTP configuration:', error);
    }
}

module.exports = saveSmtpConfigFromEnv;
