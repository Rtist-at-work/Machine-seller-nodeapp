const CategoryModel = require("../models/categoryCreation");
const machines = require("../models/productUpload");
const mongoose = require("mongoose");
const { ObjectId } = require("mongodb");

const CategoryRepository = {
  getIndustries: async () => {
    try {
      const db = mongoose.connection.db;
      const states = await db.collection("states").find({
        _id: { $in: [new ObjectId("67ece8bf67eee96c1d1c9a68"), new ObjectId("67ece90167eee96c1d1c9a6a")] }
      }).toArray();
      
      const industries = await CategoryModel.distinct("industry");
      return({states : states, industries : industries})
    } catch (error) {
      console.error("Error fetching industries:", error);
      throw error; // Rethrow the error to handle it where the function is called
    }
  },
  
  getCategories : async(industry)=>{
    try{
      if(!industry) {
         throw new Error("Industry value is needed")
      }
      const categories = await CategoryModel.findOne({industry :industry}, {"data":1},{"industry" : 0},{"_id":0}).then(docs => docs.data.map((doc)=>doc.category))
      return categories
    }
    catch(err){
       throw new Error(err.message)
    }
  },

  getMakes: async (category) => {
    try {  
      if (typeof category !== 'string') {
        throw new Error('Category must be a valid string');
      }
  
      const categoryPattern = new RegExp(`^${category.trim()}$`, 'i');
  
      const makes = await CategoryModel.findOne(
        { 
          "data.category": categoryPattern 
        },
        { 
          "data.$": 1,  // Fetches only the matched category object
          "_id": 0 
        }
      );
  
      if (!makes || !makes.data || makes.data.length === 0) {
        throw new Error('No matching category found in the database');
      }
  
      return makes.data[0].brands; // Return only the brands array
    } catch (err) {
      console.error('Error fetching makes:', err.message);
      throw err;
    }
  },
  
  
  machinesCount: async (industry) => {
    const count = await machines.countDocuments({ industry }); // Query filter corrected
    return { [industry]: count }; // Return the count associated with the industry name
  },

};

module.exports = CategoryRepository;
