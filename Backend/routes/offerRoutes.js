const express = require('express');
const offerController = require('../controllers/offerController');
const { authenticateJWT, authorizeRole } = require('../middleware/auth');

const router = express.Router();


router.get('/', authenticateJWT, offerController.getAllOffers);
router.get('/:id', authenticateJWT, offerController.getOfferById);


router.post('/', authenticateJWT, authorizeRole(['admin', 'manager']), offerController.createOffer);
router.put('/:id', authenticateJWT, authorizeRole(['admin', 'manager']), offerController.updateOffer);


router.delete('/:id', authenticateJWT, authorizeRole(['admin']), offerController.deleteOffer);

module.exports = router;