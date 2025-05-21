const express = require("express");
const {
 postQr
} = require("../controllers/Client/QrController");
const secureRoute = require("../middlewares/secureRoute");
const uploadFiles = require("../middlewares/productUpload");
const router = express.Router();
router.post("/", secureRoute,uploadFiles, postQr);

module.exports = router;
