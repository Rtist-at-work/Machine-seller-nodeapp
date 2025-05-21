const mongoose = require("mongoose");

const addressSchema = new mongoose.Schema({
  name: String,
  street: String,
  landmark: String,
  city: String,
  state: String,
  postalCode: String,
  phone: String,
});

const qrConfigSchema = new mongoose.Schema({
  text: String,
  backgroundImage: String, // base64 string
  dotScale: Number,
  colorLight: String,
  correctLevel: String,
  backgroundImageAlpha: Number,
  autoColor: Boolean,
  autoColorDark: String,
  autoColorLight: String,
});

const qrSchema = new mongoose.Schema({
  qrConfig: qrConfigSchema,
  address: addressSchema,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const QrModel = mongoose.model("QrCode", qrSchema);
module.exports = QrModel;
