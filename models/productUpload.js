const mongoose = require("mongoose");

const productupload = new mongoose.Schema({
  machineImages: {
    type: [String],
    require: true,
  },
  machineVideos: { 
    type: [String], 
    required: true
 },
 industry : {
    type : String,
    required : true
 },
 category : {
    type : String,
    required : true
 },
 make : {
    type : String,
    required : true
 },
 price : {
    type : String,
    required : true
 },
 description : {
    type : String,
    required : true
 },
 createdAt : {
    type : Date,
    default : Date.now
 }
});

const uploadSchema = mongoose.model('productupload',productupload);

module.exports = uploadSchema;
