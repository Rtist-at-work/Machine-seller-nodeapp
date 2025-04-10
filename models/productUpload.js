const mongoose = require("mongoose");
const User = require('./userSIgnUp')


const LocationSchema = new mongoose.Schema({
    
  });
const productupload = new mongoose.Schema({
  userId : {
    type: mongoose.Schema.Types.ObjectId,
         ref: User,
         required: true,
  },
  machineImages: {
    type: [String],
    required: true,
  },
  machineVideos: { 
    type: [String], 
    required: true,
  },
  industry: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  make: {
    type: String,
    required: true,
  },
  yearOfMake : {
    type : Number,
    required : true
  },
  price: {
    type: String, // Changed to String to allow regex validation
    required: true,
    match: [/^\d+(\.\d{1,2})?$/, "Price must be a valid number"], // Allows integers and decimals (e.g., 100 or 100.50)
  },
  condition: {
    type: String,
    required: true,
  },
  contact: {
    type: String, // Changed to String for validation purposes
    required: true,
    match: [/^\d+$/, "Contact must contain only numbers"], // Allows only digits
  },
  adminApproval: {
    type: String,
    default: "pending",
    required: true,
  },
  geoCoords: {
    type: {
      type: String,
      enum: ["Point"],
      default: "Point",
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true,
    },
  },
  country: { type: String, required: true },
  region: { type: String, required: true },
  district: { type: String, required: true, sparse:true },
  description: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

productupload.index({ "geoCoords.coordinates": "2dsphere" });

// ✅ Index for Fast Filtering
productupload.index({ category: 1, industry: 1, make:1, country:1, region:1, district:1  });

const uploadSchema = mongoose.model('productupload', productupload);

module.exports = uploadSchema;
