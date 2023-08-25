const mongoose = require("mongoose");

const fileSchema = new mongoose.Schema({
  filename: { type: String, required: true },
  filePath: { type: String, required: true }, // New field to store the path of the file
  uploader: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
});

module.exports = mongoose.model("File", fileSchema);
