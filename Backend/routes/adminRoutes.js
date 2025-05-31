const express = require('express');
const adminController = require('../controllers/adminController');
const { authenticateJWT, authorizeRole } = require('../middleware/auth');

const router = express.Router();

router.use(authenticateJWT, authorizeRole(['admin']));


router.get('/users', adminController.getAllUsers);
router.get('/users/:id', adminController.getUserById);
router.put('/users/:id', adminController.updateUser);
router.delete('/users/:id', adminController.deleteUser);


router.get('/stats', adminController.getSystemStats);

module.exports = router;