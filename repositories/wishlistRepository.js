const User = require("../models/userSIgnUp");
const machineRepository = require("./machinerepository");
const productModel = require("../models/productUpload");

const wishlistRepository = {
  add: async (userId, productId) => {
    try {
      console.log(userId, productId);

      const user = await User.findById(userId).lean();
      if (!user) {
        throw new Error("User not found");
      }

      // Check if product already exists in the wishlist
      const alreadyExists = user.favourites.includes(productId);

      let updatedWishlist;
      if (alreadyExists) {
        // Remove from wishlist
        updatedWishlist = await User.findByIdAndUpdate(
          userId,
          { $pull: { favourites: productId } },
          { new: true, lean: true }
        );
      } else {
        // Add to wishlist
        updatedWishlist = await User.findByIdAndUpdate(
          userId,
          { $push: { favourites: productId } },
          { new: true, lean: true }
        );
      }

      console.log("Updated Wishlist:", updatedWishlist);
      return updatedWishlist;
    } catch (err) {
      console.error("Error updating wishlist:", err);
    }
  },
  getWishlist: async (userId) => {
    try {
      // Fetch the wishlist, including the 'favourites' field
      const wishlist = await User.findById(userId)
        .select("favourites -_id")
        .lean();
  
      if (!wishlist) {
        throw new Error("User not found");
      }
  
      console.log("repo reached:", wishlist);
  
      // Check if there are items in 'favourites'
      if (wishlist.favourites && wishlist.favourites.length > 0) {
        // Query products based on the 'favourites' array
        const products = await productModel.find({
          _id: { $in: wishlist.favourites },
        }).lean();
  
        // Get product files if products are found
        const productsWithFiles = await machineRepository.getProductFiles(products);
        return productsWithFiles; // Return products with files
      } else {
        return []; // Return an empty array if no products in 'favourites'
      }
    } catch (err) {
      console.error("Error fetching wishlist:", err);
      return { error: err.message || "An error occurred while fetching the wishlist" }; // Return error message
    }
  },
  
};

module.exports = wishlistRepository;
