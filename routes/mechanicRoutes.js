const express = require("express");
const {
  getMechanics,
  postmedia,
  getPosts,
  postLikes,
  postReviews,
  getReviews,
  postComment,
  getComments,
  editProfile,
  deletemedia,
} = require("../controllers/Client/mechanicController");
const secureRoute = require("../middlewares/secureRoute");
const mediaUpload = require("../middlewares/productUpload");

const router = express.Router();
router.get("/",secureRoute, getMechanics);
router.get("/getReviews/:selectedMech", getReviews);
router.post("/postMedia", secureRoute, mediaUpload, postmedia);
router.delete("/deletePosts", secureRoute, deletemedia);
router.post("/postLikes", secureRoute, postLikes);
router.post("/postComment", secureRoute, postComment);
router.get("/getComments/:postId", secureRoute, getComments);
router.post("/postReview", secureRoute, postReviews);
router.patch("/editProfile", secureRoute, editProfile);
router.get("/getposts/?:MechId", secureRoute, getPosts);

module.exports = router;
