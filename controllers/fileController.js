const multer = require("multer");
const multerConfig = require("../utils/multerConfig");
 
const {
  transporter,
  SIngleMailOptions,
  MultipleMailOptions,
} = require("../utils/nodemailerConfig");

require("dotenv").config();
const path = require("path");

const File = require("../models/file");
const User = require("../models/user");

exports.getAllFiles = async (req, res) => {
  // Retrieve file paths from the database
  const files = await File.find();
  return res.status(200).json(files);
};

exports.uploadMultipleFiles = async (req, res) => {
  const files = req.files;
  if (!files || files.length === 0) {
    return res.status(400).json({ message: "No files uploaded" });
  }
  const uploadedFiles = [];
  // Save file paths to the database
  for (const file of files) {
    const newFile = new File({
      filename: file.filename,
      filePath: path.join("uploads", file.filename),
    });
    await newFile.save();
    uploadedFiles.push(newFile);
    console.log(uploadedFiles);
  }

  const file = uploadedFiles.map((file) => file.filename);

  const mailOptions = MultipleMailOptions(files);

  transporter.sendMail(mailOptions, async (error, info) => {
    if (error) {
      console.log("Error sending email:", error);
    } else {
      console.log("Email sent:", info.response);
      // Delete the file records from the database after sending the email
      await File.deleteMany({
        _id: { $in: uploadedFiles.map((file) => file._id) },
      });
    }
    res.json({ message: "Multiple files uploaded successfully" });
  });
};

exports.uploadFile = async (req, res) => {
  try {
    // If no file is provided, return an error message
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }
    const userId = req.body._id;

    // Find the user by email or userId in the database
    const user = await User.findOne({ userId });

    // If no user is found, return an error message
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Create a new file document with the file and user information
    const newFile = new File({
      filename: req.file.filename,
      filePath: `uploads/${req.file.filename}`,
      uploader: user._id,
    });

    // Save the file document to the database
    await newFile.save();

    // Add the file's id to the user's files array
    user.files.push(newFile._id);

    // Save the user document to the database
    await user.save();
    // res.json({ fileLink: `${req.headers.origin}/file/${file.id}` });
    const mailOptions = SIngleMailOptions(newFile);

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log("Error sending email:", error);
      } else {
        console.log("Email sent:", info.response);
      }
      // Return a success message with the file and user details
      return res.status(200).json({
        message: "File stored successfully",
        user: user.email,
        fileLink: `/file/${req.file.filename}`,
      });
    });
  } catch (err) {
    // If there is an error, return an error message
    return res.status(500).json({ message: err.message });
  }
};

exports.getFile = async (req, res) => {
  const user = await User.findOne(req.body.email);
  try {
    const fileId = req.params.id;
    const file = await File.findById(fileId);

    if (!file) {
      return res.status(404).json({ message: "File not found" });
    }

    // Here, you might want to implement access control logic if needed,
    // such as checking if the user requesting the file has appropriate permissions.

    const fileUrl = `/file/${file.filename}`; // Adjust the path as needed

    return res.status(200).json({
      filename: file.filename,
      filePath: fileUrl,
      uploader: user.email,
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

