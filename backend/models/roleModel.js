const { query, pool } = require('../config/db');

class RoleModel {
  static async findAll() {
    const sql = `
      SELECT r.id, r.name, r.display_name, r.description, r.created_at,
             COUNT(DISTINCT u.id) AS user_count,
             COUNT(DISTINCT rp.permission_id) AS permission_count
      FROM roles r
      LEFT JOIN users u ON r.id = u.role_id
      LEFT JOIN role_permissions rp ON r.id = rp.role_id
      GROUP BY r.id
      ORDER BY r.id ASC
    `;
    return await query(sql);
  }

  static async findById(id) {
    const sql = `SELECT * FROM roles WHERE id = ? LIMIT 1`;
    const rows = await query(sql, [id]);
    return rows[0] || null;
  }

  static async findByName(name) {
    const sql = `SELECT * FROM roles WHERE name = ? LIMIT 1`;
    const rows = await query(sql, [name]);
    return rows[0] || null;
  }

  static async getRolePermissions(roleId) {
    const sql = `
      SELECT p.id, p.name, p.display_name, p.module, p.description
      FROM permissions p
      JOIN role_permissions rp ON p.id = rp.permission_id
      WHERE rp.role_id = ?
      ORDER BY p.module, p.name
    `;
    return await query(sql, [roleId]);
  }

  static async updateRolePermissions(roleId, permissionIds) {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      // Clear existing
      await connection.query('DELETE FROM role_permissions WHERE role_id = ?', [roleId]);

      // Insert new
      if (Array.isArray(permissionIds) && permissionIds.length > 0) {
        const values = permissionIds.map(permId => [roleId, permId]);
        await connection.query('INSERT INTO role_permissions (role_id, permission_id) VALUES ?', [values]);
      }

      await connection.commit();
      return true;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }
}

module.exports = RoleModel;

