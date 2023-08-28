const express = require("express");
const userController = require("../controllers/userController");

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: User
 *   description: API for user registration and authentication
 */

/**
 * @swagger
 * /users/register:
 *      post:
 *          summary: Register a new user
 *          description: Creates a new user account with the given email and password
 *          tags: [User]
 *          requestBody:
 *              description: User registration data
 *              required: true
 *              content:
 *                  application/json:
 *                  schema:
 *                      type: object
 *                      properties:
 *                          email:
 *                              type: string
 *                          password:
 *                              type: string
 *              responses:
 *                  200: 
 *                      description: Created
 *                  400:
 *                      description:  Bad Request
 *
 */
router.post("/register", userController.registerUser);

/**
 * @swagger
 * /users/login:
 *   post:
 *     summary: Authenticate a user
 *     description: Verifies the user credentials and returns a token if valid
 *     tags: [User]
 *     requestBody:
 *       description: User login data
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 format: password
 *             example:
 *               email: user@example.com
 *               password: 123456
 *     responses:
 *       200:
 *         description: User authenticated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                   description: JWT token for the user
 *
 *
 */
router.post("/login", userController.loginUser);

router.get("/verify/:userId/:token", userController.verifyEmail);

module.exports = router;
