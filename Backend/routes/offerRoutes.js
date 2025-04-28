const express = require('express');
const offerController = require('../controllers/offerController');
const router = express.Router();

router.get('/', offerController.getAllOffers);        
router.post('/', offerController.createOffer);        
router.get('/:id', offerController.getOfferById);      
router.put('/:id', offerController.updateOffer);       
router.delete('/:id', offerController.deleteOffer);    

module.exports = router;