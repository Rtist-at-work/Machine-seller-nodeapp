const AdminProductService = require("../../services/AdminProductService");
const qr = require("../../models/QrModel");

const getQr = async (req, res) => {
  try {
    
    // const qrCodes = await qr.find();
    const qrCodes = await AdminProductService.getQr()
    if (qrCodes) {
      res.status(200).json({ qrCodes });
    }
  } catch (err) {
    res.status(500).json({ message: err.mesage });
  }
};

module.exports = {
  getQr,
};
