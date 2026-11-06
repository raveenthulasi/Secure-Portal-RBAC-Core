const express = require('express');
const router = express.Router();
const UserController = require('../controllers/userController');
const { verifyToken } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');
const { authorizePermissions } = require('../middleware/permissionMiddleware');

// Regular user or admin updating their own profile
router.put('/profile/me', verifyToken, authorizePermissions('profile:update'), UserController.updateOwnProfile);

// Admin-only endpoints
router.get('/', verifyToken, authorizeRoles('admin'), authorizePermissions('users:read'), UserController.getUsers);
router.post('/', verifyToken, authorizeRoles('admin'), authorizePermissions('users:create'), UserController.createUser);
router.get('/:id', verifyToken, UserController.getUserById);
router.put('/:id', verifyToken, authorizeRoles('admin'), authorizePermissions('users:update'), UserController.updateUser);
router.delete('/:id', verifyToken, authorizeRoles('admin'), authorizePermissions('users:delete'), UserController.deleteUser);

module.exports = router;

