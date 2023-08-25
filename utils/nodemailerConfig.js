const nodemailer = require("nodemailer");

// require("dotenv").config();
const path = require("path");

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

exports.SIngleMailOptions = (file) => {
  return {
    from: process.env.EMAIL,
    to: "idivyansh22@gmail.com",
    subject: "File Uploaded",
    html: `<p>Your file has been uploaded successfully, <a href="/file/${file.filename}">Click here to Download file.</a></p>`,

    // attachments: [
    //   {
    //     path: path.join(__dirname, "..", file.path), //this is important don't change
    //     contentType: "image/jpg",
    //   },
    // ],
  };
};

exports.MultipleMailOptions = (filenames) => {
  return {
    from: process.env.EMAIL,
    to: "idivyansh22@gmail.com",
    subject: "Multiple Files Uploaded",
    text: `Your multiple files (${filenames.join(
      ",  "
    )}) have been uploaded successfully.`,
    // attachments: filenames.map((filename) => ({
    //   path: path.join(__dirname, "..", filename.path), //this is important don't change
    //   contentType: "image/jpg",
    // })),
  };
};

exports.successfulRegister = (user) => {
  return {
    from: process.env.EMAIL,
    to: `${user.email}`,
    subject: "Account Registered",
    text: `Your account has been registered successfully.`,
  };
};

