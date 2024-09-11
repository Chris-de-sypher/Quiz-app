const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "christiansilvester700@gmail.com",
    pass: "rqif phfu eypn rpxc",
  },
});


module.exports = transporter;