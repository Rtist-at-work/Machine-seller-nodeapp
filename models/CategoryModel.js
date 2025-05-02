const mongoose = require("mongoose");

// Industry Schema
const industrySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    index: true,
  },
});

// Category Schema
const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    index: true,
  },
  industry: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Industry",
    required: true,
  },
});

// SubCategory Schema
const subCategorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    index: true,
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
    required: true,
  },
});

// Brand Schema
const brandSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    index: true,
  },
  subCategory: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "SubCategory",
    required: true,
  },
});

// Models
const Industry = mongoose.model("Industry", industrySchema);
const Category = mongoose.model("Category", categorySchema);
const SubCategory = mongoose.model("SubCategory", subCategorySchema);
const Brand = mongoose.model("Brand", brandSchema);

// Export
module.exports = {
  Industry,
  Category,
  SubCategory,
  Brand,
};
