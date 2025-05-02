const mongoose = require("mongoose");

const subCategorySchema = new mongoose.Schema({
  subCategory: {
    type: String, // Example: "Flatlock", "Overlock"
    index: true, // Creates an index for faster searches
  },
  brands: [
    {
      type: String, // Example: "Siruba", "Zuki", etc.
      index: true, // Creates an index for brand names
    },
  ],
});

// Define the schema for machines (e.g., "Flatlock" and "Overlock")
const machineSchema = new mongoose.Schema({
  category: {
    type: String, // Example: "Flatlock", "Overlock"
    index: true, // Creates an index for faster searches
  },
  subCategory: [subCategorySchema],
});


// Define the schema for categories (e.g., "Textile")
const categorySchema = new mongoose.Schema({
  industry: {
    type: String,
    required: true,
    unique: true, // Ensures unique industry names
    trim: true, // Removes leading/trailing spaces
    lowercase: true, // Converts to lowercase (prevents case-sensitive duplicates)
  },
  data: [machineSchema], // Array of machines and their brands
});

// Create a unique index
categorySchema.index({ industry: 1 }, { unique: true });

// Define and export the model
const MachineCategory = mongoose.model("MachineCategory", categorySchema);
module.exports = MachineCategory;
