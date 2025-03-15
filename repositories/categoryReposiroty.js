const Category = require("../models/categoryCreation");
const machines = require("../models/productUpload");

const CategoryRepository = {
  getIndustries: async (limit) => {
    return limit === 0
      ? await Category.distinct("industry") 
      :await Category.aggregate([
        { $match: { industry: { $exists: true } } },
        { $sample: { size: limit } },                
        { $project: { _id: 0, industry: 1 } }       
      ]).then(docs => docs.map(doc => doc.industry));
  },

  getCategories : async(industry)=>{
    try{
      if(!industry) {
         throw new Error("Industry value is needed")
      }
      const categories = await Category.findOne({industry :industry}, {"data":1},{"industry" : 0},{"_id":0}).then(docs => docs.data.map((doc)=>doc.category))
      return categories
    }
    catch(err){
       throw new Error(err.message)
    }
  },
  
  machinesCount: async (industry) => {
    const count = await machines.countDocuments({ industry }); // Query filter corrected
    return { [industry]: count }; // Return the count associated with the industry name
  },

};

module.exports = CategoryRepository;
