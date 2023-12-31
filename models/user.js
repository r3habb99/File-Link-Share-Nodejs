const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  gender: {
    type: String,
    enum: ["M", "F"],
    required: true,
  },
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  files: [{ type: mongoose.Schema.Types.ObjectId, ref: "File" }],
});

module.exports = mongoose.model("User", userSchema);
