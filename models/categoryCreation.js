const mongoose = require("mongoose");

// Define the schema for machines (e.g., "Flatlock" and "Overlock")
const machineSchema = new mongoose.Schema({
  category : {
    type: String, // Example: "Flatlock", "Overlock"
    index: true,  // Index for the machine type
  },
  brands: [
    {
      type: String, // Example: "Siruba", "Zuki", etc.
      index: true,  // Index for the brand names
    }
  ]
});

// Define the schema for categories (e.g., "Textile")
const categorySchema = new mongoose.Schema({
  industry : {
    type: String,
    required: true,
    unique: true, // Enforces unique names
    trim: true,   // Removes leading/trailing whitespaces
  },
  data: [machineSchema] // Array of machines and their brands
});

// Ensure unique indexes are created
categorySchema.index({ name: 1 }, { unique: true });

const machinecategory = mongoose.model("MachineCategory", categorySchema);

module.exports = machinecategory;
