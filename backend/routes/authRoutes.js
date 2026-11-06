const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/authController');
const { verifyToken } = require('../middleware/authMiddleware');

router.post('/login', AuthController.login);
router.post('/logout', verifyToken, AuthController.logout);
router.get('/me', verifyToken, AuthController.getMe);
router.post('/change-password', verifyToken, AuthController.changePassword);

module.exports = router;

