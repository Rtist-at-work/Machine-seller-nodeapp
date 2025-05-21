const express = require( "express");
const {productListPage} = require('../controllers/Client/productListPage')

const router = express.Router();
router.get("/", productListPage);


module.exports = router;