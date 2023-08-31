const express = require("express");
const userController = require("../controllers/userController");
const { body } = require("express-validator");
const User = require("../models/user");
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
 *   post:
 *     summary: Register a new user
 *     description: Creates a new user account with the given email and password
 *     tags: [User]
 *     requestBody:
 *       description: User registration data
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: user@example.com
 *               password:
 *                 type: string
 *                 example: password
 *     responses:
 *       201:
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 verificationLink:
 *                   type: string
 *                 token:
 *                   type: string
 *
 */
router.post(
  "/register",
  [
    body("email")
      .isEmail()
      .withMessage("Please enter valid email")
      .custom((value, { req }) => {
        return User.findOne({ email: value }).then((userDoc) => {
          if (userDoc) {
            return Promise.reject("Email already already exists");
          }
        });
      })
      .normalizeEmail(),
    body("password").trim().isLength({ min: 5 }),
  ],
  userController.registerUser
);

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
 *                 example: user@example.com
 *               password:
 *                 type: string
 *                 example: password
 *     responses:
 *       200:
 *         description: User authenticated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 user:
 *                   type: string
 *                 token:
 *                   type: string
 *
 */
router.post("/login", userController.loginUser);

/**
 * @swagger
 * /users/verify/{userId}/{token}:
 *   get:
 *     summary: Verify user's email
 *     description: Verifies a user's email by checking the provided token
 *     tags: [User]
 *     parameters:
 *       - name: userId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: User's ID
 *       - name: token
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: Verification token sent to the user
 *     responses:
 *       200:
 *         description: User verified successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 user:
 *                   type: object
 *
 */
router.get("/verify/:userId/:token", userController.verifyEmail);

module.exports = router;
