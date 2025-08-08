const nodemailer = require("nodemailer");
require('dotenv').config()


const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.MY_GMAIL_USER_NAME,
    pass: process.env.MY_GMAIL_PASSWORD,
  },
});


module.exports = transporter;