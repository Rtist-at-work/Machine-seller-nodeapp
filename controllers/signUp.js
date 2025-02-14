const express = require("express");
const nodemailer = require("nodemailer");
const NodeCache = require("node-cache");
const { parsePhoneNumberFromString } = require("libphonenumber-js");
const user = require("../models/userSIgnUp");
const bcrypt = require("bcryptjs");
require("dotenv").config();

const router = express.Router();
const myCache = new NodeCache({ stdTTL: 60 });

// Utility Functions
const generateOTP = () => Math.floor(1000 + Math.random() * 9000).toString();

const emailRegex =
    /^[a-zA-Z0-9]+(\.[a-zA-Z0-9]+)*@gmail\.com$|^[a-zA-Z0-9]+(\.[a-zA-Z0-9]+)*@gmail\.co$/;
const mobileRegex = /^\d{10}$/;

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

// Middleware to validate and identify recipient type
const mobileOrEmailCheck = (req, res, next) => {
  const { mailOrphone } = req.body;

  console.log(emailRegex.test(mailOrphone) )

  if (!emailRegex.test(mailOrphone) && !mobileRegex.test(mailOrphone)) {
    return res.status(400).json({ message: "Enter a valid email or mobile number" });
  }

  req.recipient = emailRegex.test(mailOrphone) ? "Email" : "Mobile";
  next();
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

  if (!myCache.has(mailOrphone)) {
    return res.status(404).json({ message: "Email or phone number not found in cache." });
  } else if (!cachedData) {
    return res.status(410).json({ message: "OTP has expired." });
  }

  req.user = cachedData;
  next();
};

// Routes 
router.post("/", mobileOrEmailCheck, async (req, res) => {
  const { mailOrphone, username } = req.body;

  console.log("ok")
  const allCachedData = myCache.keys().reduce((acc, key) => {
    acc[key] = myCache.get(key);
    return acc;
  }, {});  
  
  const existingUser = await user.findOne({ [req.recipient] : mailOrphone });
  if (existingUser) {
    return res.status(400).json({ error: 'Email already exists. Please log in.' });
  }
  console.log(existingUser + "nok")

  try {
    const otp = generateOTP();
    const response = await cacheStore(username, req.recipient, mailOrphone, otp);

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
    return res.status(500).json({ message: "Error in sending OTP", error: err.message });
  }
});

router.post("/otpcheck",mobileOrEmailCheck, getCache, async (req, res) => {
  const { otp, mailOrphone } = req.body;


  if (!otp || !mailOrphone) {
    return res.status(400).json({ message: "OTP and email/mobile are required" });
  }

  if (req.user && mailOrphone === req.user[req.recipient] && otp === req.user.OTP) {
    return res.status(200).json({ message: "OTP verification successful" });
  } else {
    return res.status(500).json({ message: "OTP verification failed" });
  }
});

router.post("/resendotp", mobileOrEmailCheck, getCache, async (req, res) => {
  try {
    const { mailOrphone } = req.body;
    const newOtp = generateOTP();
    const response = await cacheStore(req.user.username, req.recipient, mailOrphone, newOtp);

    if (response.success) {
      return res.status(200).json({
        message: response.message,
        [req.recipient]: mailOrphone,
        username: req.user.username,
        OTP: newOtp,
      });
    } else {
      throw new Error(response.error);
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal server error", error: err.message });
  }
});


router.post("/register", async (req, res) => {
  try {
    const { password, confirmPassword, mailOrphone } = req.body;

    // Validate input
    if (!password || !confirmPassword || !mailOrphone) {
      return res.status(400).json({
        message: "Password, confirm password, and email/phone are required.",
      });
    }

    // Check if passwords match
    if (password !== confirmPassword) {
      return res
        .status(400)
        .json({ message: "Password and confirm password do not match." });
    }

    // Check if cache exists for the provided email or phone
    const cachedUser = myCache.get(mailOrphone);
    if (!cachedUser) {
      return res
        .status(404)
        .json({ message: "No cached data found for the provided email/phone." });
    }

    // Encrypt password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user object
    const newUser = new user({
      username: cachedUser.username,
      Password: hashedPassword,
      Email: cachedUser.Email || null, // Set Email or Mobile based on cache
      Mobile: cachedUser.Mobile || null,
    });

    myCache.del(`${cachedUser.Email}`)

    // Save to the database
    await newUser.save();

    // Success response
    res.status(201).json({ message: "User registered successfully." });
  } catch (err) {
    console.error("Error in user registration:", err);
    res.status(500).json({
      message: "Internal server error",
      error: err.message,
    });
  }
});

module.exports = router;
