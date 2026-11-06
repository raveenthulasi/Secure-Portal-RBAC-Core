const express = require('express');
const router = express.Router();
const RoleController = require('../controllers/roleController');
const { verifyToken } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');
const { authorizePermissions } = require('../middleware/permissionMiddleware');

// Roles & Permissions endpoints are administrative
router.get('/', verifyToken, authorizeRoles('admin'), authorizePermissions('roles:read'), RoleController.getRoles);
router.get('/permissions', verifyToken, authorizeRoles('admin'), authorizePermissions('roles:read'), RoleController.getPermissions);
router.get('/:id/permissions', verifyToken, authorizeRoles('admin'), authorizePermissions('roles:read'), RoleController.getRolePermissions);
router.put('/:id/permissions', verifyToken, authorizeRoles('admin'), authorizePermissions('roles:manage'), RoleController.updateRolePermissions);

module.exports = router;

