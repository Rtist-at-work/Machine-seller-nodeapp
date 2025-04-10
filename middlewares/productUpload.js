const multer = require("multer");
const { GridFsStorage } = require("multer-gridfs-storage");
const crypto = require("crypto");
require("dotenv").config();

const storage = new GridFsStorage({
  url: process.env.Mongo_URI,
  cache :true,
  disableMD5:false,

  file: (req, file) => {
    console.log(file)
    return new Promise((resolve, reject) => {
      crypto.randomBytes(16, (err, buf) => {
        if (err) {
          return reject(err);
        }
        const filename = buf.toString("hex") + file.originalname;
        const bucketName = file.mimetype.startsWith("image/") ? "images" : "videos"; // Separate bucket names

        const fileInfo = {
          filename: filename,
          bucketName: bucketName, 
        //   metadata: { uploadedBy: req.userId },
        };
        resolve(fileInfo);
      });
    });
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB limit for files
  },
  fileFilter: (req, file, callback) => {
    const imageTypes = /jpeg|jpg|png/;
    const videoTypes = /mp4|quicktime/;
    const isImage = imageTypes.test(file.mimetype);
    const isVideo = videoTypes.test(file.mimetype);

    if (isImage || isVideo) {
      callback(null, true);
    } else {
      callback(new Error("Invalid file format. Only images (jpeg, jpg, png) and videos (mp4) are allowed."));
    }
  },
}).fields([
  { name: "images", maxCount: 10 }, // Adjust maxCount as needed
  { name: "videos", maxCount: 10 }, 
]);

const uploadFiles = (req, res, next) => {
  //multer call
  upload(req, res, (err) => {
    if (err) {
      console.log(err)
      return res
        .status(500)
        .json({ message: "File upload failed", error: err.message });
    }

    req.images = req.files?.images || []; 
    req.videos = req.files?.videos || []; 

    next();
  });
};

module.exports = uploadFiles;
