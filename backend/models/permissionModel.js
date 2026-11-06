const { query } = require('../config/db');

class PermissionModel {
  static async findAll() {
    const sql = `
      SELECT id, name, display_name, module, description, created_at
      FROM permissions
      ORDER BY module, name
    `;
    return await query(sql);
  }

  static async findByModule(module) {
    const sql = `SELECT * FROM permissions WHERE module = ? ORDER BY name`;
    return await query(sql, [module]);
  }
}

module.exports = PermissionModel;

