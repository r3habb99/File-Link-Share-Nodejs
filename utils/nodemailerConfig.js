const nodemailer = require("nodemailer");

// require("dotenv").config();
const path = require("path");
const user = require("../models/user");

try {
  exports.transporter = nodemailer.createTransport({
    service: "gmail",
    secure: false,
    port: 587,
    auth: {
      user: process.env.EMAIL,
      pass: process.env.PASSWORD,
    },
  });

  exports.transporter.verify((error, success) => {
    if (error) {
      console.log("Transporter verification error:", error);
    } else {
      console.log("Transporter is ready to send emails");
    }
  });
} catch (error) {
  console.log("Error creating transporter:", error);
}

exports.singleMailOptions = (file, user) => {
  return {
    from: process.env.EMAIL,
    to: user.email,
    subject: "Your file has been uploaded",
    html: `<p>Hi ${user.email},</p>
<p>Thank you for uploading your file on our website. You can access your file using the link below.</p>
<p><a href="${file.filePath}">Download your file</a></p>`,
  };
};

exports.MultipleMailOptions = (files, user) => {
  return {
    from: process.env.EMAIL,
    to: user.email,
    subject: "Multiple Files Uploaded",
    html: `<p>Hi ${user.email},</p>
    <p>Your multiple files have been uploaded successfully.</p>
    <p><a href="${files}">Download your file</a></p>
    <ul><li><a href="${files}">List of Files</a></li></ul>
        `,
    // attachments: filenames.map((filename) => ({
    //   path: path.join(__dirname, "..", filename.path), //this is important don't change
    //   contentType: "image/jpg",
    // })),
  };
};

exports.successfulRegister = (user, verificationLink) => {
  return {
    from: process.env.EMAIL,
    to: user.email,
    subject: "Verify your email address",
    html: `<p>Hi ${user.email},</p>
                <p>Thank you for registering on our website. To complete your registration, please click on the link below to verify your email address.</p>
              <p><a href="${verificationLink}">Verify your email</a></p>`,
  };
};

exports.sendDownloadLinkEmail = (toEmail, downloadLink) => {
  return {
    from: user.email,
    to: toEmail,
    subject: "Download your file",
    html: `<p>Hi ${toEmail}</p>
    <p>This is your file to download.</p>
    <p><a href="${downloadLink}">Download</a></p>`,
  };
};