const express = require("express");
const {
  updateProfile,
  profilePage,
  passwordReset,
  updateProfileImage,
} = require("../controllers/Client/profilePage");
const secureRoute = require("../middlewares/secureRoute");
const upload = require('../middlewares/productUpload')
const router = express.Router();
console.log("kcknvjknxjn");
router.get("/", secureRoute, profilePage);
router.post("/update", secureRoute, updateProfile);
router.post("/updateProfileImage", secureRoute, upload, updateProfileImage);
router.post("/passwordReset", secureRoute,  passwordReset);

module.exports = router;
