const express = require('express');
const productController = require('../controllers/productController');
const { authenticateJWT, authorizeRole } = require('../middleware/auth');

const router = express.Router();


router.get('/', authenticateJWT, productController.getAllProducts);
router.get('/:id', authenticateJWT, productController.getProductById);


router.post('/', authenticateJWT, authorizeRole(['admin', 'manager']), productController.createProduct);
router.put('/:id', authenticateJWT, authorizeRole(['admin', 'manager']), productController.updateProduct);


router.delete('/:id', authenticateJWT, authorizeRole(['admin']), productController.deleteProduct);

module.exports = router;