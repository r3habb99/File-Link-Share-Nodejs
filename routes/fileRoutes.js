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

router.get("/getallflies", fileController.getAllFiles);
router.get("/:id", fileController.getFile);

module.exports = router;
