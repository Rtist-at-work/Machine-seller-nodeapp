const express = require("express");
const signUp = require("../models/userSIgnUp");
const { v4: uuidv4 } = require("uuid");
const bcrypt = require("bcrypt");

const router = express.Router();

// Password hashing function
const hashedPassword = async (password) => {
  try {
    const hp = await bcrypt.hash(password, 10);
    return hp;
  } catch (err) {
    throw new Error("Error hashing password");
  }
};

router.post('/', async (req, res) => {
  const userDetails = req.body;

  try {
    // Hash password
    userDetails.password = await hashedPassword(userDetails.Password);
    
    // Prepare user object
    const id = uuidv4();
    const newUser = {
      UserId: id,
      Username: userDetails.username,
      Password: userDetails.password,
      email: userDetails.email,
      mobile: userDetails.number, // If the frontend sends `number`, you can change it here to `mobile` if needed
      Location: userDetails.location,
      createdAt: Date.now(),
    };

    // Save the user to the database
    const result = await signUp.create(newUser);  // Use create for better Mongoose handling

    res.status(200).json({ message: "User details saved successfully" });
  } catch (err) {
    // Handle validation errors
    if (err.name === "ValidationError") {
      const errors = Object.values(err.errors).map((e) => e.message);
      return res.status(400).json({
        status: false,
        errors,
      });
    }
    // General error handling if it's not a validation error
    return res.status(500).json({
      status: false,
      message: "Something went wrong! Please try again later.",
      err
    });
  }
});

module.exports = router;
