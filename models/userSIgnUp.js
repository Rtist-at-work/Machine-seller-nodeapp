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
    // category: {
    //   type: String,
    //   required: function () {
    //     return this.role === "mechanic";
    //   },
    // },
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
      type: String, // Changed to String for validation purposes
      required: true,
      match: [/^\d+$/, "Contact must contain only numbers"], // Allows only digits
      required: function () {
        return this.role === "mechanic";
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
        return this.role === "mechanic";
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
    // averageRating: {
    //   type: Number,
    //   required: function () {
    //     return this.role === "mechanic"; // Posts are only required for mechanics
    //   },
    // },

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
