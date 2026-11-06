const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('../config/config');
const UserModel = require('../models/userModel');
const ActivityLogModel = require('../models/activityLogModel');

class AuthController {
  static async login(req, res, next) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({
          success: false,
          message: 'Both email and password are required.'
        });
      }

      // Find user
      const user = await UserModel.findByEmail(email);

      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password.'
        });
      }

      // Check account status
      if (user.status !== 'active') {
        return res.status(403).json({
          success: false,
          message: 'This account has been deactivated. Please contact your system administrator.'
        });
      }

      // Compare password
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password.'
        });
      }

      // Get permissions
      const permissions = await UserModel.getUserPermissions(user.id);

      // Sign JWT token
      const token = jwt.sign(
        {
          id: user.id,
          email: user.email,
          role: user.role_name
        },
        config.jwtSecret,
        { expiresIn: config.jwtExpiresIn }
      );

      // Update last login timestamp
      await UserModel.updateLastLogin(user.id);

      // Log login event
      const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';
      await ActivityLogModel.log({
        userId: user.id,
        userEmail: user.email,
        action: 'USER_LOGIN',
        details: `Successful login as ${user.role_name}`,
        ip: clientIp
      });

      return res.status(200).json({
        success: true,
        message: 'Login successful.',
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role_name,
          role_display: user.role_display_name,
          status: user.status,
          phone: user.phone,
          department: user.department,
          last_login: new Date().toISOString(),
          permissions
        }
      });
    } catch (error) {
      next(error);
    }
  }

  static async getMe(req, res, next) {
    try {
      const user = await UserModel.findById(req.user.id);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found.'
        });
      }

      const permissions = await UserModel.getUserPermissions(user.id);

      return res.status(200).json({
        success: true,
        user: {
          ...user,
          role: user.role_name,
          role_display: user.role_display_name,
          permissions
        }
      });
    } catch (error) {
      next(error);
    }
  }

  static async changePassword(req, res, next) {
    try {
      const { currentPassword, newPassword } = req.body;

      if (!currentPassword || !newPassword) {
        return res.status(400).json({
          success: false,
          message: 'Both current password and new password are required.'
        });
      }

      if (newPassword.length < 6) {
        return res.status(400).json({
          success: false,
          message: 'New password must be at least 6 characters in length.'
        });
      }

      // Fetch user with password hash
      const user = await UserModel.findByEmail(req.user.email);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User account not found.'
        });
      }

      // Verify current password
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        return res.status(400).json({
          success: false,
          message: 'Current password provided is incorrect.'
        });
      }

      // Hash and update
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      await UserModel.updatePassword(req.user.id, hashedPassword);

      const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';
      await ActivityLogModel.log({
        userId: req.user.id,
        userEmail: req.user.email,
        action: 'PASSWORD_CHANGE',
        details: 'User updated their password.',
        ip: clientIp
      });

      return res.status(200).json({
        success: true,
        message: 'Password changed successfully.'
      });
    } catch (error) {
      next(error);
    }
  }

  static async logout(req, res, next) {
    try {
      if (req.user) {
        const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';
        await ActivityLogModel.log({
          userId: req.user.id,
          userEmail: req.user.email,
          action: 'USER_LOGOUT',
          details: 'User logged out of session.',
          ip: clientIp
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Logged out successfully.'
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = AuthController;

