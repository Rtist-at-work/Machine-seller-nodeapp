const express = require( "express");
const {categoryPage,getIndustries,getMakes} =  require("../controllers/Client/categoryPage");

const router = express.Router();
router.get('/',getIndustries)
router.get("/:industry/:page", categoryPage);
router.get('/:category',getMakes)


module.exports = router;