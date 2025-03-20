const CategoryRepository = require("../../repositories/categoryReposiroty");
const categoryService = require("../../services/categoryService");

const categoryPage = async (req, res) => {
  try {
    const { industry,page } = req.params;  

    const categories = await categoryService.getCategories(industry,page);

    res.status(200).json(categories);
  } catch (err) {
    console.log(err);
  }
};

const getIndustries = async (req, res) => {
  try {
    const industries = await categoryService.getIndustries();
    res.status(200).json(industries);
  } catch (err) {
    console.log(err);
  }
};

const getMakes = async (req, res) => {
  try {
    const {category} = req.params;
    const makes = await CategoryRepository.getMakes(category);
    res.status(200).json(makes);
  } catch (err) {
    console.log(err);
  }
};

module.exports = { categoryPage, getIndustries,getMakes };
