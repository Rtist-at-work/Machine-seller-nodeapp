const product = require("../models/productUpload");
const machineRepository = require("./machinerepository");

const AdminProductRepository = {
  getPendingProduct: async (status) => {
    try {
      const pendingProducts = await product.find({ adminApproval: status }).lean(); // Removed `i`
      const productWithFiles =
        machineRepository.getProductFiles(pendingProducts);

      return productWithFiles;
    } catch (err) {
      console.error("Error fetching pending products:", err);
    }
  },

  updateAdminApprovalProduct: async (productId, status) => {
    try {
      const updated = await product
        .findByIdAndUpdate(productId, {
          adminApproval: status,
        })
        .lean();
      const productWithFiles = machineRepository.getProductFiles(updated);
      return productWithFiles;
    } catch (err) {}
  },
};

module.exports = AdminProductRepository;
