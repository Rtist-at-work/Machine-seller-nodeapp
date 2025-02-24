const express = require("express");
const bcrypt = require("bcryptjs");
const usermodel = require("../models/userSIgnUp");
const mobileOrEmailCheck = require("../middlewares/mobileOrEmailCheck");
const router = express.Router();

router.post("/", mobileOrEmailCheck, async (req, res) => {
  try {
    const { mailOrphone, password } = req.body;

    // Search for user by email/mobile
    const user = await usermodel.collection.findOne({ [req.recipient]: mailOrphone });
    console.log(user)

    // Check if user exists and password matches
    if (user) {
      const isMatch = await bcrypt.compare(password, user.Password); // compare password with hashed password
      if (isMatch) {
        console.log("Logged In Successfully");
        res.status(200).json({
          message: "Logged In Successfully",
        });
      } else {
        console.log("Invalid Password");
        res.status(401).json({
          message: "Invalid Password",
        });
      }
    } else {
      console.log("User not found");
      res.status(404).json({
        message: "User not found",
      });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({
      status: "error",
      message: "An error occurred",
      error: err.message,
    });
  }
});

module.exports = router;
