const express = require("express");
const categoryModel = require("../../models/categoryCreation");
const mongoose = require("mongoose");

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    // Create category
    const industryName = req.body.cat[0]; // Get industry name
    const data = req.body.cat[1]

    // Validate input
    if (!industryName || !data) {
      return res.status(400).json({ message: "Category data is required" });
    }

    const response = await categoryModel.create({
      industry: industryName,
      data: data.map((data) => ({
        category: Object.keys(data)[0],
        brands: Object.values(data)[0]
      }))
    });
    
    res.status(200).json({
      message: "Category created successfully",
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
        message: "Category Alreay createded  ",
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

router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) return res.status(400).json({ message: "id is required" });

    if (!mongoose.Types.ObjectId.isValid(id))
      return res.status(400).json({ message: "Invalid ObjectId" });

    const response = await categoryModel.deleteOne({ _id: id });
    console.log(response);

    if (response.deletedCount === 0)
      return res
        .status(200)
        .json({ message: "category not found or already deleted" });

    res.status(200).json({ message: "Category deleted successfully!" });
  } catch (err) {
    return res.status(500).json({
      error: "An error occured",
      message: err.message,
    });
  }
});
router.get("/getCategory/:selectedCategory?", async (req, res) => {
  try {
    const { selectedCategory } = req.params;
    let response;
    if (!selectedCategory) {
      response = await categoryModel.find({}, "industry ").lean();
    } else {
      response = await categoryModel.find(
        { _id: selectedCategory },
        "data -_id"
      );

      response = response[0].data.map((sub) => ({ [sub.category]: sub.brands }));
    }
    console.log(response);
    if (response)
      return res
        .status(200)
        .json({ message: "data fetched successfully", category: response });
  } catch (err) {
    res.status(500).json({ message: err.message, error: err });
  }
});
// router.get('/checkCategory',async(req,res)=>{
//   console.log("ok")
//   try{
//     const category = req.query.category;
//     console.log(category)
//     const response = await categoryModel.findOne({industry:{$regex : new RegExp(`^${category}$`,'i')}})
//     console.log(response)
//   }
//   catch(err){
//     console.log(err)
//   }
// })

module.exports = router;
