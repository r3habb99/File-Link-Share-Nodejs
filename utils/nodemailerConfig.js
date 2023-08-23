const nodemailer = require("nodemailer");

require("dotenv").config();

const transporter = nodemailer.createTransport({
    try :{
        service: "gmail",
        auth: {
       user: process.env.EMAIL,
       pass: process.env.PASSWORD,
     }
    }, catch (error) {
        console.log(error);
    }
});

module.exports = transporter;
