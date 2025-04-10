const express = require('express')
const router = express.Router()
const {getPendingProduct,updateAdminApprovalProduct} = require('../controllers/Admin/AdminProduct')
const secureRoute = require('../middlewares/secureRoute')

router.get('/getPendingProducts/:status',getPendingProduct)
router.patch('/updateAdminApproval',updateAdminApprovalProduct)


module.exports = router