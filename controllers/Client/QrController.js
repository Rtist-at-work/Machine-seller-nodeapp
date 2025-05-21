const express = require("express");
const router = express.Router();
const QrCode = require("../../models/QrModel");
const User = require("../../models/userSIgnUp");

const postQr =
  ("/qrcode",
  async (req, res) => {
    try {
      if (!req.files || !req.files.images) {
        return res
          .status(400)
          .json({ message: "No images or videos uploaded" });
      }

      const userId = req.user.id;
      const user = await User.findById(userId);

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const images = req.files.images.map((image) => image.id.toString());

      let { qrConfig, address } = req.body;

      if (typeof qrConfig === "string") {
        qrConfig = JSON.parse(qrConfig);
      }

      if (typeof address === "string") {
        address = JSON.parse(address);
      }

      qrConfig.backgroundImage = images[0];

      const newQr = new QrCode({ qrConfig, address });
      await newQr.save();

      user.qr = true;
      await user.save();

      res.status(200).json({ message: "QR sent successfully", id: newQr._id });
    } catch (err) {
      console.error("Failed to save QR data:", err);
      res.status(500).json({ error: "Failed to save QR data" });
    }
  });

module.exports = { postQr };
