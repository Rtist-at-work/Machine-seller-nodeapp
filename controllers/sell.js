const express = require("express");
const router = express.Router();
const uploadImages = require('../middlewares/productUpload')
const bufferConverter = require('../middlewares/bufferConverter')


router.post("/",[bufferConverter,uploadImages], async (req, res, next) => {
try{
    if(!req.images){
        return res.status(400).json({message:"images not uploaded"})
    }

}
catch(err){

}
});

module.exports = router;
