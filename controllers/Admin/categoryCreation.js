const express = require("express");
const categoryModel = require("../../models/categoryCreation");
const mongoose = require("mongoose");

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const { category } = req.body;
    console.log(category);

    // Validate input
    if (!category) {
      return res.status(400).json({ message: "Category data is required" });
    }

    // Create category
    const response = await categoryModel.create(category); // Use await to ensure proper handling
    res.status(201).json({
      message: "Category created successfully",
      data: response, // Send back the created document for confirmation
    });
  } catch (err) {
    console.error("Error:", err.message);

    // Handle validation errors
    if (err.name === "ValidationError") {
      return res.status(400).json({
        message: "Validation error",
        details: err.errors,
      });
    }

    // Handle duplicate key errors (e.g., unique fields)
    if (err.code === 11000) {
      return res.status(409).json({
        message: "Duplicate key error",
        details: err.keyValue,
      });
    }

    // General server error
    return res.status(500).json({
      message: "Internal server error. Please try again later!",
    });
  }
});

router.put("/editCategory", async (req, res) => {
  try {
    const { objectId, category } = req.body;

    // Validate objectId
    if (!mongoose.Types.ObjectId.isValid(objectId)) {
      return res.status(400).json({ message: "Invalid objectId" });
    }

    // Validate category
    if (!category || typeof category !== "object") {
      return res.status(400).json({ message: "Invalid category data" });
    }

    // Update category
    const response = await categoryModel.updateOne(
      { _id: new mongoose.Types.ObjectId(String(objectId)) },
      { $set: category }
    );
    console.log(response);
    // Check if document was matched and modified
    if (response.matchedCount === 0) {
      return res.status(404).json({ message: "Category not found" });
    }

    return res.status(200).json({ message: "Category updated successfully!" });
  } catch (err) {
    return res.status(500).json({
      message: "An error occurred",
      error: err.message,
    });
  }
});

router.delete("/deleteCategory/:objectId", async (req, res) => {
  try {
    const { objectId } = req.params;
    console.log(objectId);

    if (!objectId) return res.status(400).json({ message: "id is required" });

    if (!mongoose.Types.ObjectId.isValid(objectId))
      return res.status(400).json({ message: "Invalid ObjectId" });

    const response = await categoryModel.deleteOne({ _id: objectId });

    if (response.matchedCount === 0)
      return res.status(200).json({ message: "category not found" });

    res.status(200).json({ message: "Category deleted successfully!" });
  } catch (err) {
    return re.status(500).json({
      error: "An error occured",
      message: err.message,
    });
  }
});

module.exports = router;
