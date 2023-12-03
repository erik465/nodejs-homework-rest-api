const { func } = require("joi");
const nodemailer = require("nodemailer");
require("dotenv").config();

var transport = nodemailer.createTransport({
  host: "sandbox.smtp.mailtrap.io",
  port: 2525,
  auth: {
    user: process.env.MAILTRAP_USER,
    pass: process.env.MAILTRAP_PASSWORD,
  },
});

function sendEmail(message) {
  message.from = "ehalasz06@gmail.com";
  return transport.sendMail(message);
}

module.exports = sendEmail;
