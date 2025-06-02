const express = require('express');
const reportController = require('../controllers/reportController');
const { authenticateJWT, authorizeRole } = require('../middleware/auth');

const router = express.Router();

router.use(authenticateJWT);
router.get('/summary', reportController.getSummaryReport);
router.get('/offers', reportController.getOffersReport);
router.get('/supplier-performance', reportController.getSupplierPerformance);
router.get('/category-spend', reportController.getCategorySpend);

module.exports = router;