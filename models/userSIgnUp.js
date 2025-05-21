const mongoose = require("mongoose");
const postModel = require("./postModel");
const subCategorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Subcategory name is required"],
  },
  services: {
    type: [String],
    sparse: true,
  },
});

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, "Create your username"],
      minlength: [3, "Username must be at least 3 characters long."],
    },
    profileImage: {
      type: String,
      sparse: true,
    },
    banner: {
      type: String,
      sparse: true,
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
      countryCode: {
        type: String,
        match: [/^\+\d+$/, "Invalid country code format"], // Starts with '+' followed by digits
      },
      number: {
        type: String,
        match: [/^\d{6,15}$/, "Invalid phone number"], // Allows 6 to 15 digits
      },
    },

    role: {
      type: String,
      enum: ["recruiter", "mechanic"],
      required: true,
    },
    industry: {
      type: String,
      required: function () {
        return this.role === "mechanic";
      },
    },
    bio: {
      type: String,
      maxlength: 50,
      sparse: true,
    },
    qr: {
      type: Boolean,
      default : false
    },
    subcategory: {
      type: [subCategorySchema],
      required: function () {
        return this.role === "mechanic";
      },
    },
    services: {
      type: [String],
      required: function () {
        return this.role === "mechanic";
      },
    },
    contact: {
      countryCode: {
        type: String,
        required: function () {
          return this.role === "mechanic";
        },
        match: [/^\+\d+$/, "Invalid country code format"], // e.g., +91
      },
      number: {
        type: String,
        required: function () {
          return this.role === "mechanic";
        },
        match: [/^\d{6,15}$/, "Invalid phone number"], // 6 to 15 digits
      },
    },

    geoCoords: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: function () {
          return this.role === "mechanic";
        },
      },
    },
    country: {
      type: String,
      required: function () {
        return this.role === "mechanic";
      },
    },
    region: {
      type: String,
      required: function () {
        return this.role === "mechanic";
      },
    },
    district: {
      type: String,
      required: function () {
        return this.role === "mechanic" && this.country === "India";
      },
      sparse: true,
    },

    organization: {
      type: String,
      required: function () {
        return this.role === "mechanic";
      },
    },
    posts: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Post", // This refers to the Post model
        required: function () {
          return this.role === "mechanic"; // Posts are only required for mechanics
        },
      },
    ],
    reviews: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Review", // This refers to the Post model
        required: function () {
          return this.role === "mechanic"; // Posts are only required for mechanics
        },
      },
    ],
    averageRating: {
      type: Number,
      // required: function () {
      //   return this.role === "mechanic"; // Posts are only required for mechanics
      // },
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
