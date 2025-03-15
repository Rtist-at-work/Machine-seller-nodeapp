const express = require('express')
const router = express.Router();
const CategoryService = require("../../services/categoryService");


router.get('/', async(req,res)=>{
    const {industry} = req.query
    try{
        const categories = await CategoryService.getCategories(industry)
        res.status(200).json({categories : categories})
    }
    catch(err){
       res.status(500).json({message:err.message || "Internal server error"})
    }
})

module.exports = router