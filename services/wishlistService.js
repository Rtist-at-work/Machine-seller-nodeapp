const wishlistRepository = require("../repositories/wishlistRepository");

const wishlistService = {
  add: async (userId, productId) => {
    console.log(userId, productId);
    try {
      const userProfile = await wishlistRepository.add(userId, productId);

      return userProfile;
    } catch (err) {
      throw new Error(err.message);
    }
  },
};

module.exports = wishlistService;
