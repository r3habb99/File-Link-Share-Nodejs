const express = require("express");
const fileController = require("../controllers/fileController");
const authMiddleware = require("../middleware/authMiddleware");
const multerConfig = require("../utils/multerConfig");
const multer = require('multer')

const router = express.Router();

router.post(
  "/upload",
  multer(multerConfig).single("file"),
  fileController.uploadFile
);

router.post(
  "/upload-multiple",
  multer(multerConfig).array("files", 5), 
  fileController.uploadMultipleFiles
);


router.get("/",  fileController.getFiles);

module.exports = router;
