const express = require( "express");
const {categoryPage,getIndustries,subcategoryPage,getMakes} =  require("../controllers/Client/categoryPage");

const router = express.Router();
router.get('/',getIndustries)
router.get("/:industry/:page", categoryPage);
router.get("/subCategoryPage/:category/:page", subcategoryPage);
router.get('/:subcategory',getMakes)


module.exports = router;