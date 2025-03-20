const searchRepository = require("../repositories/searchRepository");
const machines = require("../models/searchTerms");
const machineRepository = require('../repositories/machinerepository')


const searchService = {
  postSearchTerms: async (id, searchTerms) => {
    try {
     const result = searchRepository.postSearchTerms(id, searchTerms);
      return result;
    } catch (err) {
      throw new Error(err.message)
    }
  },
  getSearchResults : async({searchTerms,limit,industry,category,_id})=> {
    try{
    const machines = await machineRepository.getProducts(searchTerms ? {searchTerms,limit} : _id ? {_id} :  {industry,category} );
    return machines;

    }
    catch(err){
      throw new Error(err.message)
    }
  }
 // "There was an human with ther locked clock and it has been lcoked in  there"
  
};

module.exports = searchService
