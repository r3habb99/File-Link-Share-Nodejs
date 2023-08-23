const multer = require("multer");
const multerConfig = require("../utils/multerConfig");

const nodemailer = require("nodemailer");


require('dotenv').config()
const path = require('path');

const File = require("../models/file")
// Nodemailer configuration
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL,
    pass: process.env.PASSWORD
  }
});

exports.uploadFile = async (req, res) => {
  const file = req.file
  const newFile = await new File({ filename: file.filename });
  // console.log("@@@@@@@@@@@@@",process.env.EMAIL)

  if (!newFile) {
    return res.status(400).json({ message: "No file uploaded" });
  }
  await newFile.save();
  // console.log(path.join(__dirname, '..','file' , file.originalname)); 
    const mailOptions = {
      from: "rishabhprajapati411@gmail.com",
      to: [ "hvrathore02@gmail.com", "rishabhprajapati53@gmail.com"],
      subject: "File Uploaded",
      text: `Your file (${file.originalname}) has been uploaded successfully.`,
      attachments: [
        {
          path: path.join(__dirname, "..", "file", file.filename), 
          contentType: "image/jpg",
        },
      ],
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log("Error sending email:", error);
      } else {
        console.log("Email sent:", info.response);
      }
      res.json({ message: "File uploaded successfully" });
    });
  console.log(newFile);
};

exports.uploadMultipleFiles = async (req, res) => {
  const file = req.files;
  // console.log(file);
   if (!file || file.length === 0) {
     return res.status(400).json({ message: "No file uploaded" });
   }
  const filenames = [];
  for (const image of file) {
    // Save file path to the database
    const newFile = new File({ filename: image.filename });
    await newFile.save();
    filenames.push(image.filename);
  }
  //  console.log("@@@@@@@",filenames);
    const mailOptions = {
      from: "rishabhprajapati411@gmail.com",
      to: ["hvrathore02@gmail.com", "rishabhprajapati53@gmail.com"],
      subject: "File Uploaded",
      text: `Your multiple files (${filenames}) has been uploaded successfully.`,
      attachments: filenames.map((filename) => ({
        path: path.join(__dirname, "..", "file", filename),
        contentType: "image/jpg",
      })),
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log("Error sending email:", error);
      } else {
        console.log("Email sent:", info.response);
      }
    });

  res.json({ message: "Multiple Files uploaded successfully" });
  } 


exports.getFiles = async (req, res) => {
  // Retrieve file paths from the database
  const files = await File.find();
  res.status(200).json(files);
};
