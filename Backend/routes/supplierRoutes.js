const express = require('express');
const supplierController = require('../controllers/supplierController');
const { authenticateJWT, authorizeRole } = require('../middleware/auth');

const router = express.Router();
router.get('/', authenticateJWT, supplierController.getAllSuppliers);
router.get('/:id', authenticateJWT, supplierController.getSupplierById);


router.post('/', authenticateJWT, authorizeRole(['admin', 'manager']), supplierController.createSupplier);
router.put('/:id', authenticateJWT, authorizeRole(['admin', 'manager']), supplierController.updateSupplier);

router.delete('/:id', authenticateJWT, authorizeRole(['admin']), supplierController.deleteSupplier);

module.exports = router;