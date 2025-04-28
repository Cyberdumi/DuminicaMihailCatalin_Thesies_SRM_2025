const express = require('express');
const supplierController = require('../controllers/supplierController');

const router = express.Router();


router.get('/', supplierController.getAllSuppliers);        
router.post('/', supplierController.createSupplier);        
router.get('/:id', supplierController.getSupplierById);      
router.put('/:id', supplierController.updateSupplier);       
router.delete('/:id', supplierController.deleteSupplier);    

module.exports = router;