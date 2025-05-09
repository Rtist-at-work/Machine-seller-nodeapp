const express = require("express");
const {
  updateProfile,
  profilePage,
  passwordReset,
  updateProfileImage,
  updateBannerImage
} = require("../controllers/Client/profilePage");
const secureRoute = require("../middlewares/secureRoute");
const upload = require('../middlewares/productUpload')
const router = express.Router();
console.log("kcknvjknxjn");
router.get("/", secureRoute, profilePage);
router.post("/update", secureRoute, updateProfile);
router.post("/updateProfileImage/:imagetype", secureRoute, upload, updateProfileImage);
// router.post("/updateBannerImage", secureRoute, upload, updateBannerImage);
router.post("/passwordReset", secureRoute,  passwordReset);

module.exports = router;
