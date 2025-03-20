const express = require("express");
const CategoryService = require("../../services/categoryService");
const machineService = require("../../services/machineService");
const searchService = require("../../services/searchService");
const Auth = require("../../middlewares/authMiddleware");
const categoryModel = require("../../models/categoryCreation");
const machine = require("../../models/productUpload");
const machineRepository = require("../../repositories/machinerepository");
const searchRepository = require("../../repositories/searchRepository");
const router = express.Router();

//get home page elements
router.get("/", async (req, res) => {
  try {
    const { searchTerms } = req.query;

    let recommentations;
    let machinesCount;

    const categoryProducts = await machineRepository.getIndustries();

    if (categoryProducts.length === 0) {
      return res.status(200).json({ message: "No Proucts available" });
    } else {
      machinesCount = await CategoryService.machinesCount({
        industries: categoryProducts.shuffledIndustries,
      });
    }
    if (searchTerms) {
      recommentations = await machineRepository.getSearchTermProducts({
        searchTerms : searchTerms, page : "homePage"
      });
    } else {
      recommentations = await machineRepository.getSearchTermProducts({
        searchTerms: categoryProducts.shuffledIndustries, page : "homePage"
      });
    }
    const updatedCategoryProducts = categoryProducts.productsWithFiles.map(
      (cp) => {
        for (let i = 0; i < machinesCount.length; i++) {
          const key = Object.keys(machinesCount[i])[0];

          if (key.toLowerCase().trim() === cp.industry.toLowerCase().trim()) {
            return {
              ...cp,
              count: Object.values(machinesCount[i])[0] || 0,
            };
          }
        }
        return cp;
      }
    );

    return res.status(200).json({
      category: updatedCategoryProducts,
      recommentedProducts: recommentations,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error", err: err });
  }
});

//get search results
router.get("/searchResult", async (req, res) => {
  try {
    const { searchTerms, industry, category, _id } = req.query;
    const searchArray = Array.isArray(searchTerms)
      ? searchTerms
      : [searchTerms];
    const limit = 0;
    const machines = await searchService.getSearchResults(
      searchTerms
        ? { searchTerms: searchArray, limit }
        : _id
        ? { _id }
        : { industry, category }
    );
    return res.status(200).json({ machines });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error", err: err });
  }
});

// get search suggestions
router.get("/search/:searchBar", async (req, res) => {
  try {
    const { searchBar } = req.params;

    if (!searchBar) {
      return res.status(400).json({ message: "Search term is required" });
    }

    const result = await Promise.all(
      ["industry", "data.category", "data.brands"].map(async (field) => {
        const query = {};
        if (field === "industry") {
          query[field] = { $regex: `^${searchBar}`, $options: "i" };
        } else if (field === "data.category") {
          query["data.category"] = { $regex: `^${searchBar}`, $options: "i" };
        } else if (field === "data.brands") {
          query["data.brands"] = { $regex: `^${searchBar}`, $options: "i" };
        }

        const projection = { [field]: 1, _id: 0 };
        const response = await categoryModel.find(query, projection).lean();

        let updated;

        if (field === "industry") {
          updated = response.map((item) => item.industry);
        } else if (field === "data.category") {
          updated = response.flatMap(
            (item) =>
              item.data
                ?.filter((subItem) => subItem.category?.startsWith(searchBar))
                .map((subItem) => subItem.category) || []
          );
        } else if (field === "data.brands") {
          updated = response.flatMap(
            (item) =>
              item.data?.flatMap((subItem) =>
                subItem.brands?.filter((brand) => brand.startsWith(searchBar))
              ) || []
          );
        }

        return updated;
      })
    );

    const structuredResult = result.flat();
    return res.json({ structuredResult });
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
