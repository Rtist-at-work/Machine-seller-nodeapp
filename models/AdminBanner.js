const mongoose = require("mongoose");

const bannerSchema = new mongoose.Schema(
  {
    bannerImages: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const banner = mongoose.model("Banner", bannerSchema);

module.exports = banner;
