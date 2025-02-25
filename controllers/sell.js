const express = require("express");
const router = express.Router();
const uploadImages = require("../middlewares/productUpload");
const uploadModel = require("../models/productUpload");

router.post("/", uploadImages, async (req, res) => {
  try {
    if (!req.files || (!req.files.images && !req.files.videos)) {
      return res.status(400).json({ message: "No images or videos uploaded" });
    }

    const videos = req.files.videos ? req.files.videos.map(video => video.id) : [];
    const images = req.files.images ? req.files.images.map(image => image.id) : [];

    if (!req.body.industry || !req.body.category || !req.body.make || !req.body.price || !req.body.description) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const newMachine = {
      machineImages: images,
      machineVideos: videos,
      industry: req.body.industry.trim(),
      category: req.body.category.trim(),
      make: req.body.make.trim(),
      price: Number(req.body.price), // Ensures it's a number
      description: req.body.description.trim(),
    };

    const result = await uploadModel.collection.insertOne(newMachine);

    return res.status(201).json({ 
      message: "Machine details uploaded successfully", 
    //   data: result.ops[0]  // MongoDB returns inserted data in `ops`
    });

  } catch (err) {
    console.error("Error uploading machine details:", err);
    return res.status(500).json({
      message: "Internal server error. Please try again later.",
      error: err.message 
    });
  }
});

module.exports = router;
