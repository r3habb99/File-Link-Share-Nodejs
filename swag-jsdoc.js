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
