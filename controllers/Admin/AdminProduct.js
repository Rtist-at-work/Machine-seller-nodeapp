const AdminProductService = require("../../services/AdminProductService");

const getPendingProduct = async (req, res) => {
  try {
    const status = req.params.status;

    const pendingProducts = await AdminProductService.getPendingProduct(status);
    res.status(200).json(pendingProducts);
  } catch (err) {}
};

const updateAdminApprovalProduct = async (req, res) => {
  try {
    const { productId, status } = req.body;
    const updated = await AdminProductService.updateAdminApprovalProduct(
      productId,
      status
    );
    res.status(200).json({ updated });
  } catch (err) {}
};

const bannerupload = async (req, res) => {
  try {
    const userId = req.user.id;

    if (!req.files || (!req.files.images && !req.files.videos)) {
      return res.status(300).json({ message: "No images or videos uploaded" });
    }
    const images = req.files.images
      ? req.files.images.map((image) => image.id)
      : [];

    const result = await AdminProductService.bannerupload(images);

    res.status(200).json({ message: "Banner uploaded successfully" });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};
const getbanners = async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await AdminProductService.getbanners();

    res.status(200).json({ message: "Banner uploaded successfully", result });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};
const deleteBanner = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.body;

    const result = await AdminProductService.deleteBanner(id);
    console.log(result);

    res.status(200).json({ message: "Banner deleted successfully", result });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

module.exports = {
  getPendingProduct,
  updateAdminApprovalProduct,
  bannerupload,
  getbanners,
  deleteBanner,
};
