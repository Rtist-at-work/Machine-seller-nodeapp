const express = require("express");
const secureRoute = require("../middlewares/secureRoute");
const {addWishlist,getWishlist} = require('../controllers/Client/wishList')

const router = express.Router();
console.log("jbjjnjn")
router.get("/", secureRoute, getWishlist);
router.patch("/add", secureRoute, addWishlist);




module.exports = router;
