const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, "Create your username"],
      minlength: [3, "Username must be at least 3 characters long."],
    },
    profileImage: {
      type: [String],
      required: true,
    },
    password: {
      type: String,
      required: [true, "Password must be created"],
      minlength: [8, "Password must be at least 8 characters long"],
    },
    email: {
      type: String,
      unique: true,
      lowercase: true,
      index: true,
      sparse: true,
    },
    mobile: {
      type: String,
      minlength: [10, "Mobile number must be at least 10 digits"],
      maxlength: [15, "Mobile number must be at most 15 digits"],
      match: [/^\+?\d{1,4}?\d{10}$/, "Invalid mobile number format"],
      index: true,
      sparse: true,
    },
    searchTerms: {
      type: [String],
      validate: {
        validator: (arr) => arr.length <= 5,
        message: "Cannot have more than 5 search terms.",
      },
      sparse: true,
    },
    viewedProducts: {
      type: [String],
      validate: {
        validator: (arr) => arr.length <= 5,
        message: "Cannot have more than 5 viewed products.",
      },
      sparse: true,
    },
    favourites: {
      type: [String],
      sparse: true,
    },
    chats: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "User",
      sparse: true,
    },
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model("User", userSchema);

module.exports = User;
