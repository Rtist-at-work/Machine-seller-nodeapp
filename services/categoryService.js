const CategoryRepository = require("../repositories/categoryReposiroty");
const MachineCategory = require("../models/categoryCreation");
const categoryReposiroty = require("../repositories/categoryReposiroty");
const machineRepository = require("../repositories/machinerepository");

const CategoryService = {
  getIndustries: async (limit) => {
    const categories = await CategoryRepository.getIndustries(limit);
    return categories;
  },
  getCategories: async (industry, page) => {
    try {
      if (!industry) {
        throw new Error("Industry value is needed");
      }
      const categories = await CategoryRepository.getCategories(industry);
      if (page === "sell") {
        return categories;
      } else {
        console.log(page, industry);
        const categoryProducts = await machineRepository.getCategories({
          categories,
        });
        return categoryProducts;
      }
    } catch (err) {
      throw new Error(err.message);
    }
  },
  machinesCount: async ({ industries }) => {
    const totalCount = await Promise.all(
      industries.map(async (cat) => {
        const result = await categoryReposiroty.machinesCount(cat);
        return result;
      })
    );
    return totalCount;
  },
  getRecomments: async (searchterms) => {
    try {
      const result = await machineRepository.getProducts(searchterms); // Added 'await'
      return result;
    } catch (err) {
      throw new Error(err.message); // Throwing the error for route handling
    }
  },
};

module.exports = CategoryService;
