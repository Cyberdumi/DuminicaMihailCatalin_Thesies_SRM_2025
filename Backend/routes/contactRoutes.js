const express = require('express');
const contactController = require('../controllers/contactController');
const { authenticateJWT, authorizeRole } = require('../middleware/auth');

const router = express.Router();


router.get('/', authenticateJWT, contactController.getAllContacts);
router.get('/:id', authenticateJWT, contactController.getContactById);


router.post('/', authenticateJWT, authorizeRole(['admin', 'manager']), contactController.createContact);
router.put('/:id', authenticateJWT, authorizeRole(['admin', 'manager']), contactController.updateContact);


router.delete('/:id', authenticateJWT, authorizeRole(['admin']), contactController.deleteContact);

module.exports = router;