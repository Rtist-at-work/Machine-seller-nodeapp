const AdminProductService = require("../../services/AdminProductService");

const getPendingProduct = async (req, res) => {
  try {
    const status = req.params.status

    const pendingProducts = await AdminProductService.getPendingProduct(status);
    res.status(200).json(pendingProducts);
  } catch (err) {}
};

const updateAdminApprovalProduct = async (req,res) => {
  try {
    const {productId,status} = req.body;
    const updated = await AdminProductService.updateAdminApprovalProduct(productId,status);
    res.status(200).json({updated})
  } 
  catch (err) {

  }
};

module.exports = { getPendingProduct, updateAdminApprovalProduct };
