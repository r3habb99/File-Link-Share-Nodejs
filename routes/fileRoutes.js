const express = require("express");
const fileController = require("../controllers/fileController");
const multerConfig = require("../utils/multerConfig");
const auth = require("../middleware/authMiddleware");
const multer = require("multer");

const router = express.Router();


router.post(
  "/upload",
  auth.authenticateUser,
  multer(multerConfig).single("file"),
  fileController.uploadFile
);

router.post(
  "/upload-multiple",
  auth.authenticateUser,
  multer(multerConfig).array("files", 5),
  fileController.uploadMultipleFiles
);

router.get("/getallfiles", fileController.getAllFiles);



module.exports = router;
