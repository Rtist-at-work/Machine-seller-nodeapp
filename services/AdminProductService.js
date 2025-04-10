const AdminProductRepository = require('../repositories/AdminProductRepository')

const AdminProductService = {
    getPendingProduct : async(status)=>{
        try{
            const PendingProducts = await AdminProductRepository.getPendingProduct(status);
            return PendingProducts
        }
        catch(err){

        }
    },
    updateAdminApprovalProduct : async(productId,status)=>{
        try{
            const updated = await AdminProductRepository.updateAdminApprovalProduct(productId,status);
            return updated
        }
        catch(err){

        }
    }
}

module.exports = AdminProductService;