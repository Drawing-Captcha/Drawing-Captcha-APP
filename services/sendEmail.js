const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const nodemailer = require('nodemailer');


const emailUser = process.env.DEFAULT_EMAIL_USER;
const emailPass = process.env.DEFAULT_EMAIL_PASS;

async function sendEmail(mailOptions) {

    const transporter = nodemailer.createTransport({
        host: process.env.DEFAULT_EMAIL_HOST,
        port: process.env.DEFAULT_EMAIL_PORT,
        secure: process.env.DEFAULT_EMAIL_PORT === '465', // true for 465, false for other ports
        auth: {
            user: emailUser,
            pass: emailPass
        }
    });



    await transporter.sendMail(mailOptions);
}


module.exports = sendEmail;