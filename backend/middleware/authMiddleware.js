const jwt = require('jsonwebtoken');
const config = require('../config/config');
const UserModel = require('../models/userModel');

const verifyToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'] || req.headers['Authorization'];

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'Access denied. No authentication token provided.'
    });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, config.jwtSecret);

    // Fetch user from DB to ensure they still exist and check status
    const user = await UserModel.findById(decoded.id);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication failed. User account no longer exists.'
      });
    }

    if (user.status !== 'active') {
      return res.status(403).json({
        success: false,
        message: 'Account is deactivated. Please contact a system administrator.'
      });
    }

    // Attach permissions
    const permissions = await UserModel.getUserPermissions(user.id);

    req.user = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role_name,
      role_display: user.role_display_name,
      role_id: user.role_id,
      status: user.status,
      department: user.department,
      phone: user.phone,
      permissions
    };

    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Authentication token has expired. Please log in again.'
      });
    }
    return res.status(401).json({
      success: false,
      message: 'Invalid authentication token.'
    });
  }
};

module.exports = {
  verifyToken
};

