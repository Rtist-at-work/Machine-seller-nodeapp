const AdminProductRepository = require("../repositories/AdminProductRepository");
const machineRepository = require("../repositories/machinerepository");
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

      const result = await Promise.all(
        updated.map(async (mechanic) => {
          const productWithFiles = await mechanicRepository.getProductFiles(
            mechanic.bannerImages
          );

          return {
            ...mechanic,
            bannerImages: productWithFiles,
          };
        })
      );
      console.log(result);

      return result;
    } catch (err) {
      console.error("Error in getbanners:", err);
      throw err;
    }
  },
  getQr: async () => {
    try {
      const updated = await AdminProductRepository.getQr();

      const result = await Promise.all(
        updated.map(async (qr) => {
          const productWithFiles = await mechanicRepository.getProductFiles(
            qr.qrConfig.backgroundImage
          );

          return {
            ...qr,
            qrConfig: {
              ...qr.qrConfig,
              backgroundImage: productWithFiles,
            },
          };
        })
      );

      return result;
    } catch (err) {
      console.error("Error in getQr:", err);
      throw err;
    }
  },
};

module.exports = AdminProductService;
