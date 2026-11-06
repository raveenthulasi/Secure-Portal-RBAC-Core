const bcrypt = require('bcryptjs');
const UserModel = require('../models/userModel');
const RoleModel = require('../models/roleModel');
const ActivityLogModel = require('../models/activityLogModel');

class UserController {
  static async getUsers(req, res, next) {
    try {
      const { search = '', role = '', status = '', page = 1, limit = 10 } = req.query;

      const pageNum = Math.max(1, parseInt(page, 10));
      const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));
      const offset = (pageNum - 1) * limitNum;

      const [users, total] = await Promise.all([
        UserModel.findAll({ search, role, status, limit: limitNum, offset }),
        UserModel.count({ search, role, status })
      ]);

      const totalPages = Math.ceil(total / limitNum);

      return res.status(200).json({
        success: true,
        data: users,
        pagination: {
          total,
          page: pageNum,
          limit: limitNum,
          totalPages
        }
      });
    } catch (error) {
      next(error);
    }
  }

  static async getUserById(req, res, next) {
    try {
      const { id } = req.params;

      // Regular users can only access their own profile
      if (req.user.role !== 'admin' && parseInt(id, 10) !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: 'Access forbidden: You cannot view other user profiles.'
        });
      }

      const user = await UserModel.findById(id);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found.'
        });
      }

      const permissions = await UserModel.getUserPermissions(user.id);

      return res.status(200).json({
        success: true,
        data: {
          ...user,
          permissions
        }
      });
    } catch (error) {
      next(error);
    }
  }

  static async createUser(req, res, next) {
    try {
      const { name, email, password, role_id, status = 'active', phone = '', department = 'General' } = req.body;

      if (!name || !email || !password || !role_id) {
        return res.status(400).json({
          success: false,
          message: 'Name, email, password, and role are required.'
        });
      }

      if (password.length < 6) {
        return res.status(400).json({
          success: false,
          message: 'Password must be at least 6 characters long.'
        });
      }

      // Check if email already exists
      const existingUser = await UserModel.findByEmail(email);
      if (existingUser) {
        return res.status(409).json({
          success: false,
          message: 'A user with this email address already exists.'
        });
      }

      // Check role exists
      const role = await RoleModel.findById(role_id);
      if (!role) {
        return res.status(400).json({
          success: false,
          message: 'Invalid role specified.'
        });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const newUserId = await UserModel.create({
        role_id,
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password: hashedPassword,
        status,
        phone: phone ? phone.trim() : null,
        department: department ? department.trim() : 'General'
      });

      const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';
      await ActivityLogModel.log({
        userId: req.user.id,
        userEmail: req.user.email,
        action: 'USER_CREATED',
        details: `Created new user ${email} (Role: ${role.name})`,
        ip: clientIp
      });

      const createdUser = await UserModel.findById(newUserId);

      return res.status(201).json({
        success: true,
        message: 'User created successfully.',
        data: createdUser
      });
    } catch (error) {
      next(error);
    }
  }

  static async updateUser(req, res, next) {
    try {
      const { id } = req.params;
      const { name, email, role_id, status, phone, department, password } = req.body;

      const user = await UserModel.findById(id);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found.'
        });
      }

      // If email is changing, verify no collision
      if (email && email.toLowerCase().trim() !== user.email.toLowerCase()) {
        const existingEmail = await UserModel.findByEmail(email);
        if (existingEmail && existingEmail.id !== parseInt(id, 10)) {
          return res.status(409).json({
            success: false,
            message: 'Email address is already in use by another account.'
          });
        }
      }

      // If role is changing, verify role exists
      if (role_id && role_id !== user.role_id) {
        const role = await RoleModel.findById(role_id);
        if (!role) {
          return res.status(400).json({
            success: false,
            message: 'Invalid role specified.'
          });
        }
      }

      // Update fields
      await UserModel.update(id, {
        name,
        email,
        role_id,
        status,
        phone,
        department
      });

      // Update password if provided
      if (password && password.trim().length >= 6) {
        const hashed = await bcrypt.hash(password.trim(), 10);
        await UserModel.updatePassword(id, hashed);
      }

      const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';
      await ActivityLogModel.log({
        userId: req.user.id,
        userEmail: req.user.email,
        action: 'USER_UPDATED',
        details: `Updated user details for ${user.email} (ID: ${id})`,
        ip: clientIp
      });

      const updatedUser = await UserModel.findById(id);

      return res.status(200).json({
        success: true,
        message: 'User updated successfully.',
        data: updatedUser
      });
    } catch (error) {
      next(error);
    }
  }

  static async deleteUser(req, res, next) {
    try {
      const { id } = req.params;
      const targetUserId = parseInt(id, 10);

      // Prevent self-deletion
      if (req.user.id === targetUserId) {
        return res.status(400).json({
          success: false,
          message: 'Action rejected: You cannot delete your own administrative account.'
        });
      }

      const user = await UserModel.findById(targetUserId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found.'
        });
      }

      await UserModel.delete(targetUserId);

      const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';
      await ActivityLogModel.log({
        userId: req.user.id,
        userEmail: req.user.email,
        action: 'USER_DELETED',
        details: `Deleted user ${user.email} (ID: ${targetUserId})`,
        ip: clientIp
      });

      return res.status(200).json({
        success: true,
        message: `User '${user.name}' has been permanently deleted.`
      });
    } catch (error) {
      next(error);
    }
  }

  static async updateOwnProfile(req, res, next) {
    try {
      const { name, phone, department } = req.body;

      if (!name) {
        return res.status(400).json({
          success: false,
          message: 'Name is required.'
        });
      }

      await UserModel.update(req.user.id, {
        name: name.trim(),
        phone: phone ? phone.trim() : null,
        department: department ? department.trim() : 'General'
      });

      const updatedUser = await UserModel.findById(req.user.id);
      const permissions = await UserModel.getUserPermissions(req.user.id);

      return res.status(200).json({
        success: true,
        message: 'Profile updated successfully.',
        data: {
          ...updatedUser,
          permissions
        }
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = UserController;

