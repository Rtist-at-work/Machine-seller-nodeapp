const express = require("express");
const mongoose = require("mongoose");
const multer = require("multer");
const { GridFsStorage } = require("multer-gridfs-storage");
const crypto = require("crypto");
const path = require("path");

const router = express.Router();

// MongoDB Connection
const mongoURI = "mongodb://localhost:27017/yourDatabaseName"; // Replace with your database
const conn = mongoose.createConnection(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Initialize GridFS
let gfs;
conn.once("open", () => {
  gfs = new mongoose.mongo.GridFSBucket(conn.db, {
    bucketName: "uploads",
  });
});

// Configure GridFS Storage for Multer
const storage = new GridFsStorage({
  url: mongoURI,
  file: (req, file) => {
    return new Promise((resolve, reject) => {
      crypto.randomBytes(16, (err, buf) => {
        if (err) return reject(err);
        const filename =
          buf.toString("hex") + path.extname(file.originalname);
        const fileInfo = {
          filename: filename,
          bucketName: "uploads", // Same as the bucket name
        };
        resolve(fileInfo);
      });
    });
  },
});

// Multer Middleware (Stores Directly in MongoDB)
const upload = multer({ storage }).array("images", 10); // Accept up to 10 images

// Middleware to Handle Upload
const uploadImages = (req, res, next) => {
  upload(req, res, (err) => {
    if (err) return res.status(500).json({ message: "Upload failed", error: err });

    // Store image IDs in req.images
    // req.images = req.files.map((file) => file.id);
    // next();
  });
};

module.exports = uploadImages;
