const multer = require("multer");
const jwtUtils = require("../utils/jwtUtils");
const multerConfig = require("../utils/multerConfig");
const {
  transporter,
  singleMailOptions,
  MultipleMailOptions,
  sendDownloadLinkEmail,
} = require("../utils/nodemailerConfig");

require("dotenv").config();
const path = require("path");
const fs = require("fs");

const sharp = require("sharp");
const File = require("../models/file");
const User = require("../models/user");

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
    const userId = req.userId;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const uploadedFiles = [];
    for (const file of files) {
      const filePath = path.join("uploads", file.filename);
      const newFile = new File({
        filename: file.filename,
        filePath: filePath,
        uploader: userId,
      });
      await newFile.save();

      uploadedFiles.push(newFile._id);
    }
    if (uploadedFiles) {
      const mailOptions = MultipleMailOptions(uploadedFiles, user);
      transporter.sendMail(mailOptions, async (error, info) => {
        if (error) {
          console.log("Error sending email:", error);
        } else {
          console.log("Email sent:", info.response);
        }

        res.json({
          message: "Multiple File stored successfully",
          user: user.email,
          fileLinks: uploadedFiles.map((file) => {
            return `${req.protocol}://${req.get("host")}/files/${file}`;
          }),
          mailOptions,
        });
      });
    } else {
      res.status(400).json({ message: "No files uploaded" });
    }
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
  }
};

exports.uploadFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }
    const userId = req.userId;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const newFile = new File({
      filename: req.file.filename,
      filePath: `uploads/${req.file.filename}`,
      uploader: userId,
    });
    await newFile.save();

    user.files.push(newFile._id);
    await user.save();

    if (req.file.mimetype.startsWith("image")) {
      const inputFilePath = `uploads/image/${req.file.filename}`;
      const outputFilePath = `uploads/resized/${req.file.filename}`;
      const target = {
        width: 200,
        height: 200,
        fit: sharp.fit.cover,
        background: { r: 255, g: 255, b: 255, alpha: 0.5 },
      };

      await sharp(inputFilePath).resize(target).toFile(outputFilePath);
      newFile.resizedFilePath = outputFilePath;
      await newFile.save();
    }

    const mailOptions = singleMailOptions(newFile, user);
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log("Error sending email:", error);
      } else {
        console.log("Email sent:", info.response);
      }
    });

    return res.status(200).json({
      message: "File stored and resized successfully",
      user: user.email,
      fileLink: `${req.protocol}://${req.get("host")}/files/${
        req.file.filename
      }`,
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
  }
};

exports.getFile = async (req, res, next) => {
  const user = await User.findOne(req.body.email);
  const fileId = req.params.fileId;
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
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.updateFile = async (req, res) => {
  try {
    const fileId = req.params.fileId;
    const existingFile = await File.findById(fileId);

    if (!existingFile) {
      return res.status(404).json({ error: "File not found" });
    }

    if (req.file) {
      existingFile.filename = req.file.filename;
      existingFile.filePath = req.file.path;
    }
    if (req.user) {
      existingFile.uploader = req.user._id;
    }
    if (req.file.mimetype.startsWith("image")) {
      const inputFilePath = `uploads/image/${req.file.filename}`;
      const outputFilePath = `uploads/resized/${req.file.filename}`;
      const target = {
        width: 200,
        height: 200,
        fit: sharp.fit.cover,
        background: { r: 255, g: 255, b: 255, alpha: 0.5 },
      };

      await sharp(inputFilePath).resize(target).toFile(outputFilePath);
      existingFile.resizedFilePath = outputFilePath;
      await existingFile.save();
    }

    return res
      .status(200)
      .json({ message: "File updated successfully", file: existingFile });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
  }
};

// exports.updateMultipleFile = async (req, res) => {
//   try {
//     const fileId = req.params.fileId;

//     // Find the existing file by its ID
//     const existingFile = await File.findById(fileId);

//     if (!existingFile) {
//       return res.status(404).json({ error: "File not found" });
//     }

//     // If new files are provided, update the fields
//     if (req.files && req.files.length > 0) {
//       const updatedFiles = req.files.map((file) => ({
//         filename: file.filename,
//         filePath: file.path,
//         uploader: req.user ? req.user._id : existingFile.uploader,
//       }));

//       existingFile.files = updatedFiles;
//     }

//     // Save the updated file
//     await existingFile.save();

//     return res.status(200).json({ message: "Files updated successfully" });
//   } catch (error) {
//     console.error(error);
//     return res
//       .status(500)
//       .json({ error: "An error occurred while updating the files" });
//   }
// };

exports.getFileKey = async (req, res) => {
  try {
    let result = await File.find({
      $or: [{ filename: { $regex: req.params.key } }],
    });
    return res
      .status(200)
      .json({ message: "File Found successfully", file: result });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
  }
};

exports.deleteFIle = async (req, res) => {
  const fileId = req.params.fileId;
  try {
    const fileToDelete = await File.findById(fileId);

    if (!fileToDelete) {
      return res.status(404).json({ message: "File not found" });
    }
    if (fileToDelete.uploader.toString() !== req.userId) {
      return res
        .status(403)
        .json({ message: "You are not authorized to delete this file" });
    }

    const filePath = fileToDelete.filePath;
    const fullPath = path.join(__dirname, filePath);
    fs.unlink(fullPath, (err) => {
      if (err) {
        console.error("Error deleting file:", err);
      }
    });

    await File.findByIdAndDelete(fileId);

    return res.status(200).json({ message: "File deleted successfully" });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
  }
};

exports.downloadFile = async (req, res) => {
  const fileId = req.params.fileId;
  const file = await File.findById(fileId);

  if (!file) {
    return res.status(404).json({ message: "File not found" });
  }

  const filePath = file.filePath;
  const fullPath = path.join(__dirname, filePath);

  // Check if the file is public or private
  if (file.publicAccess === true) {
    res.download(fullPath);
  } else {
    const userId = req.userId;
    if (userId === file.uploader) {
      res.download(fullPath);
    } else {
      const token = jwtUtils.generateDownloadToken(file, userId);
      const downloadLink = `${req.protocol}://${req.get(
        "host"
      )}/download/${token}`;
      const mailOptions = sendDownloadLinkEmail(
        "idivyansh22@gmail.com",
        downloadLink
      );
      transporter.sendMail(mailOptions, async (error, info) => {
        if (error) {
          console.log("Error sending email:", error);
        } else {
          console.log("Email sent:", info.response);

          res
            .status(200)
            .json({ message: "Email sent with download link", mailOptions });
        }
      });
    }
  }
};