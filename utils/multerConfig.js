const multer = require("multer");
const path = require("path");
const sharp = require("sharp");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let destinationFolder = "uploads/";
    if (file.mimetype.startsWith("image")) {
      destinationFolder += "image/";
    } else if (file.mimetype === "application/pdf") {
      destinationFolder += "pdf/";
    } else if (file.mimetype === "application/msword") {
      destinationFolder += "docs/";
    } else {
      destinationFolder += "other/";
    }
    cb(null, destinationFolder);
  },
  filename: (req, file, cb) => {
    const filename = `${Date.now().toString()}-${file.originalname}`;
    cb(null, filename);
  },
});

const fileFilter = (req, file, cb) => {
  console.log(file);
  console.log(file.size + "!!!!!!!!!!!!!!");
  const allowedImageMimeTypes = [
    "image/jpeg",
    "image/png",
    "image/jpg",
    "application/pdf",
    "application/msword",
  ];
  const maxSize = 5 * 1024 * 1024; // 5MB

  if (allowedImageMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Invalid file type or size"), false);
  }
};
// exports.sharpFilter = async (req) => {
//   if (req.file.mimetype.startsWith("image")) {
//     const inputFilePath = `uploads/image/${req.file.filename}`;
//     const outputFilePath = `uploads/resized/${req.file.filename}`;
//     const target = {
//       width: 200,
//       height: 200,
//       fit: sharp.fit.cover,
//       background: { r: 255, g: 255, b: 255, alpha: 0.5 },
//     }; // Specify the desired width

//     await sharp(inputFilePath).resize({ target }).toFile(outputFilePath);
//   }
// };

module.exports = {
  storage,
  fileFilter,
};
