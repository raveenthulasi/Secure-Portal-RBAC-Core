const express = require('express');
const router = express.Router();
const DashboardController = require('../controllers/dashboardController');
const { verifyToken } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');
const { authorizePermissions } = require('../middleware/permissionMiddleware');

// Admin Dashboard stats
router.get('/admin', verifyToken, authorizeRoles('admin'), authorizePermissions('dashboard:admin'), DashboardController.getAdminStats);

// User Dashboard stats
router.get('/user', verifyToken, authorizePermissions('dashboard:user'), DashboardController.getUserStats);

module.exports = router;

