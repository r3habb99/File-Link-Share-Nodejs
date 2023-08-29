const express = require("express");
const fileController = require("../controllers/fileController");
const multerConfig = require("../utils/multerConfig");
const auth = require("../middleware/authMiddleware");
const multer = require("multer");

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: File
 *   description: API for managing files
 */

/**
 * @swagger
 * /files/upload:
 *   post:
 *     summary: Upload a single file
 *     tags: [File]
 *     consumes:
 *       - multipart/form-data
 *     parameters:
 *       - in: formData
 *         name: file
 *         type: file
 *         required: true
 *       - name: token
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: Verification token sent to the user
 *     responses:
 *       200:
 *         description: File uploaded successfully
 */
router.post(
  "/upload",
  auth.authenticateUser,
  multer(multerConfig).single("file"),
  fileController.uploadFile
);

/**
 * @swagger
 * /files/upload-multiple:
 *   post:
 *     summary: Upload multiple files (up to 5)
 *     tags: [File]
 *     consumes:
 *       - multipart/form-data
 *     parameters:
 *       - in: formData
 *         name: files
 *         type: file
 *         required: true
 *         maxItems: 5
 *     responses:
 *       200:
 *         description: Files uploaded successfully
 */
router.post(
  "/upload-multiple",
  multer(multerConfig).array("files", 5),
  fileController.uploadMultipleFiles
);

/**
 * @swagger
 * /files/getallfiles:
 *   get:
 *     summary: Get a list of all files
 *     tags: [File]
 *     responses:
 *       200:
 *         description: List of files
 */
router.get("/getallfiles", fileController.getAllFiles);

/**
 * @swagger
 * /files/{id}:
 *   get:
 *     summary: Get a file by ID
 *     tags: [File]
 *     parameters:
 *       - in: path
 *         name: id
 *         type: string
 *         required: true
 *     responses:
 *       200:
 *         description: File retrieved successfully
 */
router.get("/:id", fileController.getFile);

module.exports = router;
