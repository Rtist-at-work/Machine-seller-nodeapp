const mongoose = require("mongoose");

const searchTermsSchema = new mongoose.Schema({
  id: {
    type: String,
    unique: true,
  },
  terms: {
    type: [String], 
  },
});


searchTermsSchema.index({ id: 1 });

const SearchTerms = mongoose.model("SearchTerms", searchTermsSchema);
module.exports = SearchTerms;
