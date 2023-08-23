const bcrypt = require("bcrypt");
const jwtUtils = require("../utils/jwtUtils");
const nodemailer = require("nodemailer");
const User = require("../models/user");


// Nodemailer configuration
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "rishabhprajapati411@gmail.com",
    pass: "shwrqvxxlpbiuprb",
  },
});

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

    const token = jwtUtils.generateToken(user.email);
    res.json({ token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error during login" });
  }
};


exports.registerUser = async (req, res) => {
  const email = req.body.email;
  const password = req.body.password
  try {
    if (!email) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const user = new User({
      email: email,
      password: hashedPassword,
    });
    const result = await user.save();

    // Send email
    const mailOptions = {
      from: "rishabhprajapati411@gmail.com",
      to: "rishabhprajapati53@gmail.com",
      subject: "Account Registered",
      text: `Your account has been registered successfully.`,
      
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log("Error sending email:", error);
      } else {
        console.log("Email sent:", info.response);
      }
    });

    res.status(201).json({ message: "User registered successfully" });
    console.log(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error registering user" });
  }
};


