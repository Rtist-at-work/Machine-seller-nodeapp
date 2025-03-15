const machines = require("../models/productUpload"); // Adjust the path to your machines model

const getProducts = async (req, res, next) => {
  try {
    const { terms, limit, fetchType } = req.body; // Get the filter terms, limit, and fetch type
    let queries;

    if (!terms || terms.length === 0) {
      return res
        .status(400)
        .json({ message: "No terms provided for fetching products" });
    }

    if (terms) {
      queries = terms.map((term) => ({
        $or: [{ industry: term }, { category: term }, { make: term }],
      }));
    }
    let products = [];

    if (fetchType === "all") {
      // Fetch all products matching the terms
      products = await machines.find({ $or: queries.flat() });
    } else {
      // Fetch with a limit
      products = await Promise.all(
        queries.map((query) => machines.find(query).limit(limit))
      );
      products = products.flat(); // Flatten the nested arrays
    }

    req.products = products; // Attach products to request object
    next(); // Proceed to the next middleware or route handler
  } catch (error) {
    next(error); // Pass error to error-handling middleware
  }
};

module.exports = getProducts;
