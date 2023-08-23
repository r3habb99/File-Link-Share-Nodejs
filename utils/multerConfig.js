const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
  destination: "file/",
  filename: (req, file, cb) => {
    const filename = `${Date.now().toString()}-${file.originalname}`;
    cb(null, filename);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = ["image/jpeg", "image/png", "image/jpg"];
  const maxSize = 5 * 1024 * 1024; // 5MB

  if (allowedMimeTypes.includes(file.mimetype) || file.size <= maxSize) {
    cb(null, true);
  } else {
    cb(new Error("Invalid file type or size"), false);
  }

};

module.exports = {
  storage,
  fileFilter,
};
