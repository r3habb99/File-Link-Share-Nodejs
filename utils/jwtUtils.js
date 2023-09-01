const jwt = require("jsonwebtoken");
const crypto = require("crypto");
require("dotenv").config();

const SECRET_KEY = process.env.SECRET_KEY;

exports.generateToken = (userId, email) => {
  return jwt.sign({ userId, email }, SECRET_KEY, { expiresIn: "7d" });
};

exports.verifyToken = (token) => {
  try {
    return jwt.verify(token, SECRET_KEY);
  } catch (error) {
    return error;
  }
};

exports.generateDownloadToken = (file, userId) => {
  const tokenData = `${file._id}:${userId}:${Date.now()}`;
  const token = crypto.createHash("sha256").update(tokenData).digest("hex");
  return token;
};