const express = require( "express");
const {productDetails} = require('../controllers/Client/productListPage')

const router = express.Router();
router.get("/:id", productDetails);


module.exports = router;