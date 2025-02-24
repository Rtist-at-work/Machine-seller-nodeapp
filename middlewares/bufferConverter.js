const express = require("express");

const bufferConverter = (req, res, next) => {
  try {
    req.images = [];

    const isBase64 = (data) => {
      const base64Regex = /^data:image\/(jpeg|jpg|png);base64,[A-Za-z0-9+/=]+$/;
      return base64Regex.test(data);
    };

    if (!req.body.base64 || !Array.isArray(req.body.base64)) {
      return res.status(400).json({ message: "Invalid or missing base64 data" });
    }

    if (req.body.base64.every(isBase64)) {
      for (let i of req.body.base64) {
        const base64String = i.split(";base64,").pop();
        const buffer = Buffer.from(base64String, "base64");
        req.images.push(buffer);
      }
      next();
    } else {
      return res.status(400).json({ message: "Data is not valid base64" });
    }

  } catch (err) {
    return res.status(400).json({ message: "Error occurred", error: err.message });
  }
};

module.exports = bufferConverter;
