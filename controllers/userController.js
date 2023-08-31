const bcrypt = require("bcrypt");
const jwtUtils = require("../utils/jwtUtils");
const User = require("../models/user");
const VerificationToken = require("../models/verifictionToken");

const {
  transporter,
  successfulRegister,
} = require("../utils/nodemailerConfig");

require("dotenv").config();
const path = require("path");

const { validationResult } = require("express-validator");

exports.registerUser = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error("Validation Failed");
    error.statusCode = 422;
    error.data = errors.array();
    throw error;
  }
  const email = req.body.email;
  const password = req.body.password;
  try {
    const existingUser = await User.findOne({ email: email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already exists" });
    }

    // Hash the password and create a new user
    const hashedPassword = await bcrypt.hash(password, 12);
    const user = new User({
      email: email,
      password: hashedPassword,
      active: false,
    });

    const token = jwtUtils.generateToken();
    const verificationToken = new VerificationToken({
      userId: user._id,
      token: token,
    });
    await verificationToken.save();

    const verificationLink = `${req.protocol}://${req.get(
      "host"
    )}/users/verify/${user._id}/${token}`;
    const mailOptions = successfulRegister(user, verificationLink);

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log("Error sending email:", error);
      } else {
        console.log("Email sent:", info.response);
      }
    });

    // Save the user to the database and return a success message
    await user.save();
    res.status(201).json({
      message:
        "User registered successfully. Please check your email for verification link.",
      verificationLink,
      token,
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
  }
};

exports.loginUser = async (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwtUtils.generateToken(user._id);
    res.status(200).json({
      message: "User Logged In",
      id: user._id,
      token,
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
  }
};

exports.verifyEmail = async (req, res) => {
  try {
    const userId = req.params.userId;
    const token = req.params.token;

    const verificationToken = await VerificationToken.findOneAndDelete({
      userId: userId,
      token: token,
    });

    if (!verificationToken) {
      return res
        .status(404)
        .json({ message: "Invalid or expired verification link" });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.active) {
      return res.status(200).json({ message: "User already verified" });
    }

    user.active = true;
    await user.save();

    return res.status(200).json({
      message: "User verified successfully",
      user: user,
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
  }
};