const RoleModel = require('../models/roleModel');
const PermissionModel = require('../models/permissionModel');
const ActivityLogModel = require('../models/activityLogModel');

class RoleController {
  static async getRoles(req, res, next) {
    try {
      const roles = await RoleModel.findAll();
      return res.status(200).json({
        success: true,
        data: roles
      });
    } catch (error) {
      next(error);
    }
  }

  static async getPermissions(req, res, next) {
    try {
      const permissions = await PermissionModel.findAll();
      return res.status(200).json({
        success: true,
        data: permissions
      });
    } catch (error) {
      next(error);
    }
  }

  static async getRolePermissions(req, res, next) {
    try {
      const { id } = req.params;
      const role = await RoleModel.findById(id);

      if (!role) {
        return res.status(404).json({
          success: false,
          message: 'Role not found.'
        });
      }

      const permissions = await RoleModel.getRolePermissions(id);

      return res.status(200).json({
        success: true,
        role,
        permissions
      });
    } catch (error) {
      next(error);
    }
  }

  static async updateRolePermissions(req, res, next) {
    try {
      const { id } = req.params;
      const { permission_ids } = req.body;

      const role = await RoleModel.findById(id);
      if (!role) {
        return res.status(404).json({
          success: false,
          message: 'Role not found.'
        });
      }

      if (!Array.isArray(permission_ids)) {
        return res.status(400).json({
          success: false,
          message: 'permission_ids must be an array of permission IDs.'
        });
      }

      await RoleModel.updateRolePermissions(id, permission_ids);

      const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';
      await ActivityLogModel.log({
        userId: req.user.id,
        userEmail: req.user.email,
        action: 'PERMISSIONS_UPDATED',
        details: `Updated permissions for role '${role.name}' (Total permissions: ${permission_ids.length})`,
        ip: clientIp
      });

      const updatedPermissions = await RoleModel.getRolePermissions(id);

      return res.status(200).json({
        success: true,
        message: `Permissions updated successfully for role '${role.display_name}'.`,
        permissions: updatedPermissions
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = RoleController;

