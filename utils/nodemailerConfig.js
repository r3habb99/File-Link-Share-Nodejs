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

exports.singleMailOptions = (file, user) => {
  return {
    from: process.env.EMAIL, // Sender address
    to: user.email, // Receiver address
    subject: "Your file has been uploaded", // Subject line
    html: `<p>Hi ${user.email},</p>
<p>Thank you for uploading your file on our website. You can access your file using the link below.</p>
<p><a href="${file.filePath}">Download your file</a></p>
<p>If you have any questions or feedback, please reply to this email.</p>
<p>Best regards,</p>
<p>The Website Team</p>`, // HTML body
  };
};

exports.MultipleMailOptions = (file, filenames, user) => {
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

exports.successfulRegister = (user, verificationLink) => {
  return {
    from: process.env.EMAIL, // Sender address
    to: user.email, // Receiver address
    subject: "Verify your email address", // Subject line
    html: `<p>Hi ${user.email},</p>
                <p>Thank you for registering on our website. To complete your registration, please click on the link below to verify your email address.</p>
              <p><a href="${verificationLink}">Verify your email</a></p>
              <p>If you did not register on our website, please ignore this email.</p>
              <p>Best regards,</p>
              <p>The Website Team</p>`,
  };
};
