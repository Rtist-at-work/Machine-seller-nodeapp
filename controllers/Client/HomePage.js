const express = require("express");
const CategoryService = require("../../services/categoryService");
const machineService = require("../../services/machineService");
const searchService = require("../../services/searchService");
const Auth = require('../../middlewares/authMiddleware')
const categoryModel = require("../../models/categoryCreation");
const machine = require('../../models/productUpload')
const machineRepository = require("../../repositories/machinerepository");
const searchRepository = require("../../repositories/searchRepository");
const router = express.Router();

router.get("/", async (req, res) => {
  try {

    const {searchTerms}= req.query;

    // const categories = await CategoryService.getIndustries(limit=4);    

    const recommentations = await machineRepository.getProducts( {searchTerms});
    const categoryProducts = await machineRepository.getProducts();
    const machinesCount = await CategoryService.machinesCount(categoryProducts.shuffledIndustries);

    
    return res
      .status(200)
      .json({ category: categoryProducts.productsWithFiles, machinesCount: machinesCount, recommentedProducts : recommentations });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error", err: err });
  }
});

router.get("/searchResult", async (req, res) => {
  try {
    const {searchTerms,industry,category,_id} = req.query;
    const searchArray = Array.isArray(searchTerms) ? searchTerms : [searchTerms];
    const limit = 0 ;
    const machines =  await searchService.getSearchResults(searchTerms ? {searchTerms : searchArray,limit} : _id ? {_id} : {industry,category} )
    return res.status(200).json({ machines });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error", err: err });
  }
});

router.get("/search", async (req, res) => {
  try {
    const { search } = req.query;

    if (!search) {
      return res.status(400).json({ message: "Search term is required" });
    }
    const result = await Promise.all(
      ["industry", "data.category", "data.brands"].map(async (field) => {
        const query = {};
        query[field] = { $regex: `^${search}`, $options: "i" };

        const projection = { [field]: 1 };

        const response = await categoryModel.find(query, projection);
        return response;
      })
    );
    const structuredResult = {
      industry: result[0].map((item) => item.industry),
      category: result[1].flatMap((item) =>
        item.data.map((subItem) => subItem.category)
      ),
      brand: result[2].flatMap((item) =>
        item.data.flatMap((subItem) => subItem.brands)
      ),
    };

    return res.json({
      structuredResult,
    });
  } catch (err) {
    return res.status(500).json({ message: err.message, err: err });
  }
});

// router.post("/searchTerms", async (req, res) => {
//   try {
//     const { id, searchTerms } = req.body;
//     if (!id) {
//       return res.status(400).json({ message: "id is required" });
//     }
//     const response = await searchService.postSearchTerms(id, searchTerms);
//     return res.status(200).json({ response });
//   } catch (err) {
//     return res.status(500).json({ message: err.message, err: err });
//   }
// });
// router.get("/recommended", async (req, res) => {
//   try {
//     const { id } = req.body;
//     if (!id) {
//       return res.status(400).json({ message: "id is required" });
//     }

    
//     return res.status(200).json({ response });
//   } catch (err) {
//     return res.status(500).json({ message: err.message });
//   }
// });

module.exports = router;
