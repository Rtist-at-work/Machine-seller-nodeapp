const express = require("express");
const nodemailer = require("nodemailer");
const NodeCache = require("node-cache");
const user = require("../models/userSIgnUp");
const mobileOrEmailCheck = require('../middlewares/mobileOrEmailCheck')
const gg = require('../models/categoryCreation')
const bcrypt = require("bcryptjs");
require("dotenv").config();

const router = express.Router();
const myCache = new NodeCache({ stdTTL: 60 });

// Utility Functions
const generateOTP = () => Math.floor(1000 + Math.random() * 9000).toString();

// Nodemailer Transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Utility to send OTP via Email
const sendEmailOTP = async (email, otp) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Your OTP Code",
    text: `Your OTP code is: ${otp}`,
  };

  try {
    await transporter.sendMail(mailOptions);
    return { success: true, message: "OTP sent to email successfully" };
  } catch (err) {
    console.error("Error sending OTP via email:", err);
    return { success: false, error: err.message };
  }
};

// Cache Helper Functions
const cacheStore = async (username, recipient, mailOrphone, otp) => {
  const response = await sendEmailOTP(mailOrphone, otp);
  const userOTP = {
    username,
    [recipient]: mailOrphone,
    OTP: otp,
  };
  myCache.set(mailOrphone, userOTP, 300);
  return response;
};

const getCache = (req, res, next) => {
  const { mailOrphone } = req.body;
  const cachedData = myCache.get(mailOrphone);
  console.log(cachedData);

  if (!myCache.has(mailOrphone)) {
    return res
      .status(404)
      .json({ message: "Email or phone number not found in cache." });
  } else if (!cachedData) {
    return res.status(410).json({ message: "OTP has expired." });
  }

  req.user = cachedData;
  console.log(req.user);
  next();
};

// Routes
router.post("/", mobileOrEmailCheck, async (req, res) => {
  const { mailOrphone, username } = req.body;

  const existingUser = await user.findOne({ [req.recipient]: mailOrphone });
  if (existingUser) {
    return res
      .status(400)
      .json({ message: "Email already exists. Please log in." });
  }

  try {
    const otp = generateOTP();
    const response = await cacheStore(
      username,
      req.recipient,
      mailOrphone,
      otp
    );

    if (response.success) {
      return res.status(200).json({
        message: response.message,
        [req.recipient]: mailOrphone,
        username,
        OTP: otp,
      });
    } else {
      throw new Error(response.error);
    }
  } catch (err) {
    console.error("Error in sending OTP:", err);
    return res
      .status(500)
      .json({ message: "Error in sending OTP", error: err.message });
  }
});
router.post("/otpcheck", mobileOrEmailCheck, getCache, async (req, res) => {
  try {
    const { otp, mailOrphone } = req.body;
    console.log(otp, mailOrphone);
    // Validate input
    if (!otp || !mailOrphone) {
      console.error("Missing OTP or email/mobile.");
      return res
        .status(400)
        .json({ message: "OTP and email/mobile are required." });
    }

    // Check OTP and mailOrphone against user data
    if (
      req.user &&
      mailOrphone === req.user[req.recipient] &&
      otp === req.user.OTP
    ) {
      console.log("OTP verification successful.");
      return res.status(200).json({ message: "OTP verification successful." });
    } else {
      return res.status(401).json({ message: "OYP verfication failed" });
    }
  } catch (error) {
    // Handle unexpected errors
    console.error("Error during OTP verification:", error);
    return res
      .status(500)
      .json({ message: "Internal server error. Please try again later." });
  }
});

router.post("/resendotp", mobileOrEmailCheck, getCache, async (req, res) => {
  try {
    const { mailOrphone } = req.body;
    const newOtp = generateOTP();
    const response = await cacheStore(
      req.user.username,
      req.recipient,
      mailOrphone,
      newOtp
    );
    console.log(mailOrphone);

    if (response.success) {
      return res.status(200).json({
        message: response.message,
        [req.recipient]: mailOrphone,
        username: req.user.username,
        OTP: newOtp,
      });
    } else {
      console.log(error);
      throw new Error(response.error);
    }
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ message: "Internal server error", error: err.message });
  }
});

router.post("/register", async (req, res) => {
  try {
    const { password, confirmpass, mailOrphone } = req.body;
    console.log(password, confirmpass, mailOrphone);
    // Validate input
    if (!password || !confirmpass || !mailOrphone) {
      return res.status(400).json({
        message: "Password, confirm password, and email/phone are required.",
      });
    }

    // Check if passwords match
    if (password !== confirmpass) {
      return res
        .status(400)
        .json({ message: "Password and confirm password do not match." });
    }

    // Check if cache exists for the provided email or phone
    const cachedUser = myCache.get(mailOrphone);
    if (!cachedUser) {
      return res.status(404).json({
        message: "No cached data found for the provided email/phone.",
      });
    }

    // Encrypt password
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log(hashedPassword);
    // Create user object
    const newUser = new user({
      username: cachedUser.username,
      Password: hashedPassword,
      Email: cachedUser.Email || null, // Set Email or Mobile based on cache
      Mobile: cachedUser.Mobile || null,
    });

    myCache.del(`${cachedUser.Email}`);

    // Save to the database
    await newUser.save();

    // Success response
    res.status(200).json({ message: "User registered successfully." });
  } catch (err) {
    console.error("Error in user registration:", err);
    res.status(500).json({
      message: "Internal server error",
      error: err.message,
    });
  }
});

module.exports = router;
