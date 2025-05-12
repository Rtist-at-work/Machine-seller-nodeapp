const AdminProductRepository = require("../repositories/AdminProductRepository");
const mechanicRepository = require("../repositories/mechanicRepository");

const AdminProductService = {
  getPendingProduct: async (status) => {
    try {
      const PendingProducts = await AdminProductRepository.getPendingProduct(
        status
      );
      return PendingProducts;
    } catch (err) {}
  },
  updateAdminApprovalProduct: async (productId, status) => {
    try {
      const updated = await AdminProductRepository.updateAdminApprovalProduct(
        productId,
        status
      );
      return updated;
    } catch (err) {}
  },
  bannerupload: async (images) => {
    try {
      const updated = await AdminProductRepository.bannerupload(images);
      return updated;
    } catch (err) {}
  },
  deleteBanner: async (id) => {
    try {
      const updated = await AdminProductRepository.deleteBanner(id);
      return updated;
    } catch (err) {}
  },
 getbanners: async () => {
  try {
    const updated = await AdminProductRepository.getbanners();

    // Use `Promise.all` to handle asynchronous operations in the map
    const result = await Promise.all(
      updated.map(async (mechanic) => {
        // Fetch the profile image for each mechanic (no need to use `toObject()`)
        const bannerImage = await mechanicRepository.getProductFiles(mechanic.bannerImages);

        return {
          ...mechanic, // Spread the plain object as it is
          bannerImages: bannerImage, // Add the fetched banner images
        };
      })
    );

    return result;
  } catch (err) {
    console.error("Error in getbanners:", err);
    throw err;
  }
},
}

module.exports = AdminProductService;
