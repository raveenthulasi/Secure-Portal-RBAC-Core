const authorizePermissions = (...requiredPermissions) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required.'
      });
    }

    // Admins bypass granular checks if needed, but here we check permissions explicitly
    // Since admin role in DB has all permissions, this works uniformly!
    const userPermissions = req.user.permissions || [];
    
    // Check if user has all required permissions
    const hasAll = requiredPermissions.every(p => userPermissions.includes(p));

    if (!hasAll && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: `Forbidden: You do not possess the required permissions (${requiredPermissions.join(', ')}) for this operation.`
      });
    }

    next();
  };
};

module.exports = {
  authorizePermissions
};

