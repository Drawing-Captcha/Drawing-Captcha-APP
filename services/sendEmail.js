const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const nodemailer = require('nodemailer');
var postmark = require("postmark");
const emailService = process.env.EMAIL_SERVICE;
const fromEmail = process.env.EMAIL_FROM;
if(process.env.ENVIRONMENT === "deveoplment"){
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
}

async function sendEmail(subject, text, html, toEmail) {
    switch (emailService) {
        case "smtpAuth":
            const transporter = nodemailer.createTransport({
                host: process.env.SMTPAUTH_EMAIL_HOST,
                port: process.env.SMTPAUTH_EMAIL_PORT,
                secure: process.env.SMTPAUTH_EMAIL_PORT === '465',
                auth: {
                    user: process.env.SMTPAUTH_EMAIL_USER,
                    pass: process.env.SMTPAUTH_EMAIL_PASS
                }
            });

            const mailOptions = {
                from: fromEmail,
                to: toEmail,
                subject: subject,
                html: html
            };

            await transporter.sendMail(mailOptions);
            break;

        case "postmark":
            const client = new postmark.ServerClient(process.env.POSTMARK_SERVER_CLIENT, {
                agent: false,
                rejectUnauthorized: false
            });

            client.sendEmail({
                "From": fromEmail,
                "To": toEmail,
                "Subject": subject,
                "HtmlBody": html,
                "MessageStream": process.env.POSTMARK_MESSAGE_STREAM
            });
            break;

        default:
            throw new Error(`Unsupported email service: ${emailService}`);
    }
}


module.exports = sendEmail;
