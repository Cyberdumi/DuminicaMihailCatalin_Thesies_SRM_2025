const express = require('express');
const authController = require('../controllers/authController');
const { authenticateJWT } = require('../middleware/auth');

const router = express.Router();

router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/me', authenticateJWT, authController.getCurrentUser);

module.exports = router;