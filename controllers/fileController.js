const multer = require("multer");
const multerConfig = require("../utils/multerConfig");
 
const {
  transporter,
  singleMailOptions,
  MultipleMailOptions,
} = require("../utils/nodemailerConfig");

require("dotenv").config();
const path = require("path");
// const { sharpFilter } = require("../utils/multerConfig");

const sharp = require("sharp");
const File = require("../models/file");
const User = require("../models/user");
const user = require("../models/user");

exports.getAllFiles = async (req, res, next) => {
  const currentPage = req.query.page || 1;
  const perPage = 2;
  try {
    const totalItems = await File.find().countDocuments();
    const files = await File.find()
      .populate("uploader")
      .sort({ createdAt: -1 })
      .skip((currentPage - 1) * perPage)
      .limit(perPage);
    res.status(200).json({ files: files, totalItems: totalItems });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.uploadMultipleFiles = async (req, res) => {
  try {
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

    // const file = uploadedFiles.map((file) => file.filename);

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
      res.json({
        message: "Multiple File stored and resized successfully",
        fileLink: `${req.protocol}://${req.get("host")}/file/${
          req.file.filename
        }`,
      });
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
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

    // If the uploaded file is an image, resize it using sharp
    if (req.file.mimetype.startsWith("image")) {
      const inputFilePath = `uploads/image/${req.file.filename}`;
      const outputFilePath = `uploads/resized/${req.file.filename}`;
      const target = {
        width: 200,
        height: 200,
        fit: sharp.fit.cover,
        background: { r: 255, g: 255, b: 255, alpha: 0.5 },
      }; // Specify the desired width

      await sharp(inputFilePath).resize({ target }).toFile(outputFilePath);

      // Update the file's resized path in the database
      newFile.resizedFilePath = outputFilePath;
      await newFile.save();
    }

    // res.json({ fileLink: `${req.headers.origin}/file/${file.id}` });
    const mailOptions = singleMailOptions(newFile, user);

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log("Error sending email:", error);
      } else {
        console.log("Email sent:", info.response);
      }
      // Return a success message with the file and user details
      return res.status(200).json({
        message: "File stored and resized successfully",
        user: user.email,
        fileLink: `${req.protocol}://${req.get("host")}/file/${
          req.file.filename
        }`,
      });
    });
  } catch (err) {
    // If there is an error, return an error message
    return res.status(500).json({ message: err.message });
  }
};

exports.getFile = async (req, res, next) => {
  const user = await User.findOne(req.body.email);
  const fileId = req.params.id;
  const file = await File.findById(fileId);
  try {
    if (!file) {
      return res.status(404).json({ message: "file not found" });
    }
    res.status(200).json({
      file: file,
      filename: file.filename,
      uploader: user.email,
    });
  } catch (err) {
    if (!err.statusCode) {
      return res.status(500).json({ message: err.message });
    }
    next(err);
  }
};

// exports.updateFile = async (req, res) => {
//   try {
//     const fileId = req.params.id;
//     const updatedMetadata = req.body.metadata; // Assuming you want to update metadata

//     // Find the file by ID
//     const file = await File.findById(fileId);

//     if (!file) {
//       return res.status(404).json({ message: "File not found" });
//     }

//     // Assuming that you have some access control in place (similar to the checkFileAccess middleware)
//     if (file.uploader.toString() !== req.user.id.toString()) {
//       return res.status(403).json({ message: "Access forbidden" });
//     }

//     // Update the file's metadata
//     file.metadata = updatedMetadata;

//     // Save the updated file to the database
//     await file.save();

//     return res
//       .status(200)
//       .json({ message: "File updated successfully", updatedFile: file });
//   } catch (err) {
//     return res.status(500).json({ message: err.message });
//   }
// };

// exports.deleteFile = async (req, res) => {
//   try {
//     const fileId = req.params.id;

//     // Find the file by ID
//     const file = await File.findById(fileId);

//     if (!file) {
//       return res.status(404).json({ message: "File not found" });
//     }

//     // Assuming that you have some access control in place (similar to the checkFileAccess middleware)
//     if (file.uploader.toString() !== req.user._id.toString()) {
//       return res.status(403).json({ message: "Access forbidden" });
//     }

//     // Delete the file from storage
//     const filePath = path.join(__dirname, "..", file.filePath);
//     fs.unlinkSync(filePath);

//     // Remove the file from the database
//     await file.remove();

//     return res.status(200).json({ message: "File deleted successfully" });
//   } catch (err) {
//     return res.status(500).json({ message: err.message });
//   }
// };

