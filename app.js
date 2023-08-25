const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("./utils/mongoose"); // Import the Mongoose configuration
const userRoutes = require("./routes/userRoutes");
const fileRoutes = require("./routes/fileRoutes");
const path = require("path");
require("dotenv").config();
const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());
// console.log("global path", path.join(__dirname));
// app.use("/static", express.static(path.join(__dirname)));
app.use("/users", userRoutes);
app.use("/files", fileRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
