//  const product = require('../models/productUpload')
const mongoose = require("mongoose");
// const Grid = require("gridfs-stream");

// let gfs;
// const conn = mongoose.connection;

// conn.once("open", () => {
//   gfs = Grid(conn.db, mongoose.mongo);
//   gfs.collection("videos"); // Use the correct bucket
// });  
const ObjectId = mongoose.Types.ObjectId;

const video = async(req,res)=>{
    try {
        const fileId = new ObjectId(req.params.id);
    
        const db = mongoose.connection.db;
    
        const file = await db
          .collection('videos.files')
          .findOne({ _id: fileId });
    
        if (!file) {
          return res.status(404).json({ error: 'Video not found' });
        }
    
        // ✅ Create bucket here inside the request
        const bucket = new mongoose.mongo.GridFSBucket(db, {
          bucketName: 'videos',
        });
    
        res.set('Content-Type', file.contentType);
    
        const downloadStream = bucket.openDownloadStream(fileId);
        downloadStream.pipe(res);
      } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error streaming video' });
      }
  }

  module.exports = video