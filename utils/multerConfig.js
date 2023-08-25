const multer = require("multer");
const path = require("path");

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

module.exports = {
  storage,
  fileFilter,
};
