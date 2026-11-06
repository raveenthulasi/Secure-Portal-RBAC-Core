const UserModel = require('../models/userModel');
const ActivityLogModel = require('../models/activityLogModel');
const { query } = require('../config/db');

class DashboardController {
  static async getAdminStats(req, res, next) {
    try {
      const stats = await UserModel.getStats();

      // Recent 5 registered users
      const recentUsersSql = `
        SELECT u.id, u.name, u.email, u.status, u.created_at, r.name AS role_name, r.display_name AS role_display_name
        FROM users u
        JOIN roles r ON u.role_id = r.id
        ORDER BY u.created_at DESC
        LIMIT 5
      `;
      const recentUsers = await query(recentUsersSql);

      // Recent 8 audit logs
      const recentLogs = await ActivityLogModel.getRecent(8);

      return res.status(200).json({
        success: true,
        data: {
          metrics: stats,
          recentUsers,
          recentLogs
        }
      });
    } catch (error) {
      next(error);
    }
  }

  static async getUserStats(req, res, next) {
    try {
      const user = await UserModel.findById(req.user.id);
      const permissions = await UserModel.getUserPermissions(req.user.id);

      // User's own recent activity
      const recentActivity = await ActivityLogModel.getRecent(5, req.user.id);

      return res.status(200).json({
        success: true,
        data: {
          profile: {
            ...user,
            role: user.role_name,
            role_display: user.role_display_name
          },
          permissions,
          recentActivity,
          securityStatus: {
            twoFactorEnabled: false,
            passwordLastUpdated: user.updated_at,
            lastLoginTime: user.last_login || user.created_at,
            accountStatus: user.status
          }
        }
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = DashboardController;

