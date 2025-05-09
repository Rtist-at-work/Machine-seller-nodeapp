const express = require("express");
const nodemailer = require("nodemailer");
const NodeCache = require("node-cache");
const user = require("../models/userSIgnUp");
const mobileOrEmailCheck = require("../middlewares/mobileOrEmailCheck");
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
const cacheStore = async (
  username,
  recipient,
  mailOrphone,
  role,
  mechanicDetails,
  otp
) => {
  console.log("username :", username)
  console.log("recipient :", recipient)
  console.log("mailOrphone :", mailOrphone)
  console.log("role :", role)
  console.log("mechanicDetails :", mechanicDetails)
  console.log("otp :", otp)
  const response = await sendEmailOTP(mailOrphone, otp);
  const userData = {
    username,
    [recipient]: mailOrphone,
    OTP: otp,
    role: role,
    mechanicDetails: mechanicDetails,
  };
  const userOtp = {
    username,
    OTP: otp,
  };
  console.log("userotp,", userOtp);
  myCache.set(mailOrphone + "otp", userOtp, 30);
  myCache.set(mailOrphone, userData, 300);
  return response;
};

const getCachedOtp = (req, res, next) => {
  const { mailOrphone } = req.body;
  const cachedData = myCache.get(mailOrphone+"otp");
  console.log("cached :", cachedData);

  if (!myCache.has(mailOrphone)) {
    return res.status(404).json({ message: "Otp expired." });
  } else if (!cachedData) {
    return res.status(410).json({ message: "OTP has expired." });
  }
  next();
};

const getCache = (req, res, next) => {
  const { mailOrphone } = req.body;
  // const cachedData = myCache.get(mailOrphone+"otp");
  const userData = myCache.get(mailOrphone);
  // console.log("cached :", cachedData);
  console.log("userData :", userData);

  if (!myCache.has(mailOrphone)) {
    return res.status(404).json({ message: "Session has expired." });
  } 
  else if (!userData) {
    return res.status(410).json({ message: "Session has expired." });
  }

  req.user = userData;
  console.log(req.user);
  next();
};

// Routes
router.post("/", mobileOrEmailCheck, async (req, res) => {
  const { mailOrphone, username, role, mechanicDetails } = req.body;
  console.log(req.body);

  const existingUser = await user.findOne({ [req.recipient]: mailOrphone });
  if (existingUser) {
    return res
      .status(400)
      .json({ message: "Email already exists. Please log in." });
  }

  try {
    const otp = generateOTP();
    console.log("otp", otp);
    const response = await cacheStore(
      username,
      req.recipient,
      mailOrphone,
      role,
      mechanicDetails,
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
router.post(
  "/otpcheck",
  mobileOrEmailCheck,
  getCachedOtp,
  getCache,
  async (req, res) => {
    try {
      const { otp, mailOrphone } = req.body;
      console.log("otp", otp);
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
        return res
          .status(200)
          .json({ message: "OTP verification successful." });
      } else {
        return res
          .status(401)
          .json({ message: "Incorrect Otp. OTP verfication failed !" });
      }
    } catch (error) {
      // Handle unexpected errors
      console.error("Error during OTP verification:", error);
      return res
        .status(500)
        .json({ message: "Internal server error. Please try again later." });
    }
  }
);

router.post("/resendotp", mobileOrEmailCheck, getCache, async (req, res) => {
  try {
    const { mailOrphone } = req.body;
    const newOtp = generateOTP();
    const response = await cacheStore(
      req.user.username,
      req.recipient,
      mailOrphone,
      req.user.role,
      req.user.mechanicDetails,
      newOtp
    );

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
    console.log(mailOrphone)
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
        message: "Something went wrong please try again later",
      });
    }

    // Encrypt password
    const hashedPassword = await bcrypt.hash(password, 10);
    // Create user object
    const newUserData = {
      username: cachedUser.username,
      role: cachedUser.role,
      password: hashedPassword,
      email: cachedUser.email || null,
      mobile: cachedUser.mobile || null,
    };

    // Check if the role is "mechanic" and add additional fields
    if (cachedUser.role === "mechanic") {
      console.log("mobile :", typeof cachedUser.mechanicDetails.mobile);
      const location = JSON.parse(cachedUser.mechanicDetails.location);
      newUserData.organization =
        cachedUser.mechanicDetails.organization || null;
      newUserData.services = cachedUser.mechanicDetails.services || null;
      newUserData.industry = cachedUser.mechanicDetails.industry || null;
      // newUserData.category = cachedUser.mechanicDetails.category || null;
      newUserData.subcategory = cachedUser.mechanicDetails.subcategory || null;
      newUserData.contact = cachedUser.mechanicDetails.contact;
      newUserData.bio = cachedUser.mechanicDetails.bio;
      newUserData.geoCoords = {
        type: "Point",
        coordinates: [
          Number(location.coords.longitude),
          Number(location.coords.latitude),
        ],
      };
      newUserData.country = location.country;
      newUserData.region = location.region;
      newUserData.district = location.district;
    }

    // Create a new user object with the updated data
    const newUser = new user(newUserData);

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
