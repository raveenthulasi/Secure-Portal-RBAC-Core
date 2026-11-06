const { query } = require('../config/db');

class UserModel {
  static async findByEmail(email) {
    const sql = `
      SELECT u.*, r.name AS role_name, r.display_name AS role_display_name
      FROM users u
      JOIN roles r ON u.role_id = r.id
      WHERE u.email = ?
      LIMIT 1
    `;
    const rows = await query(sql, [email.toLowerCase().trim()]);
    return rows[0] || null;
  }

  static async findById(id) {
    const sql = `
      SELECT u.id, u.role_id, u.name, u.email, u.status, u.phone, u.department, u.avatar, u.last_login, u.created_at, u.updated_at,
             r.name AS role_name, r.display_name AS role_display_name
      FROM users u
      JOIN roles r ON u.role_id = r.id
      WHERE u.id = ?
      LIMIT 1
    `;
    const rows = await query(sql, [id]);
    return rows[0] || null;
  }

  static async getUserPermissions(userId) {
    const sql = `
      SELECT DISTINCT p.name
      FROM permissions p
      JOIN role_permissions rp ON p.id = rp.permission_id
      JOIN users u ON rp.role_id = u.role_id
      WHERE u.id = ?
    `;
    const rows = await query(sql, [userId]);
    return rows.map(r => r.name);
  }

  static async findAll({ search = '', role = '', status = '', limit = 10, offset = 0 } = {}) {
    let sql = `
      SELECT u.id, u.role_id, u.name, u.email, u.status, u.phone, u.department, u.avatar, u.last_login, u.created_at, u.updated_at,
             r.name AS role_name, r.display_name AS role_display_name
      FROM users u
      JOIN roles r ON u.role_id = r.id
      WHERE 1=1
    `;
    const params = [];

    if (search) {
      sql += ` AND (u.name LIKE ? OR u.email LIKE ? OR u.department LIKE ?)`;
      const term = `%${search}%`;
      params.push(term, term, term);
    }

    if (role) {
      sql += ` AND r.name = ?`;
      params.push(role);
    }

    if (status) {
      sql += ` AND u.status = ?`;
      params.push(status);
    }

    sql += ` ORDER BY u.created_at DESC LIMIT ? OFFSET ?`;
    params.push(parseInt(limit, 10), parseInt(offset, 10));

    const rows = await query(sql, params);
    return rows;
  }

  static async count({ search = '', role = '', status = '' } = {}) {
    let sql = `
      SELECT COUNT(*) AS total
      FROM users u
      JOIN roles r ON u.role_id = r.id
      WHERE 1=1
    `;
    const params = [];

    if (search) {
      sql += ` AND (u.name LIKE ? OR u.email LIKE ? OR u.department LIKE ?)`;
      const term = `%${search}%`;
      params.push(term, term, term);
    }

    if (role) {
      sql += ` AND r.name = ?`;
      params.push(role);
    }

    if (status) {
      sql += ` AND u.status = ?`;
      params.push(status);
    }

    const rows = await query(sql, params);
    return rows[0].total;
  }

  static async create({ role_id, name, email, password, status = 'active', phone = null, department = 'General' }) {
    const sql = `
      INSERT INTO users (role_id, name, email, password, status, phone, department)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    const result = await query(sql, [role_id, name, email.toLowerCase().trim(), password, status, phone, department]);
    return result.insertId;
  }

  static async update(id, { role_id, name, email, status, phone, department }) {
    const fields = [];
    const params = [];

    if (role_id !== undefined) {
      fields.push('role_id = ?');
      params.push(role_id);
    }
    if (name !== undefined) {
      fields.push('name = ?');
      params.push(name);
    }
    if (email !== undefined) {
      fields.push('email = ?');
      params.push(email.toLowerCase().trim());
    }
    if (status !== undefined) {
      fields.push('status = ?');
      params.push(status);
    }
    if (phone !== undefined) {
      fields.push('phone = ?');
      params.push(phone);
    }
    if (department !== undefined) {
      fields.push('department = ?');
      params.push(department);
    }

    if (fields.length === 0) return 0;

    const sql = `UPDATE users SET ${fields.join(', ')} WHERE id = ?`;
    params.push(id);

    const result = await query(sql, params);
    return result.affectedRows;
  }

  static async updatePassword(id, hashedPassword) {
    const sql = `UPDATE users SET password = ? WHERE id = ?`;
    const result = await query(sql, [hashedPassword, id]);
    return result.affectedRows;
  }

  static async updateLastLogin(id) {
    const sql = `UPDATE users SET last_login = NOW() WHERE id = ?`;
    await query(sql, [id]);
  }

  static async delete(id) {
    const sql = `DELETE FROM users WHERE id = ?`;
    const result = await query(sql, [id]);
    return result.affectedRows;
  }

  static async getStats() {
    const totalUsersSql = `SELECT COUNT(*) AS total FROM users`;
    const activeUsersSql = `SELECT COUNT(*) AS active FROM users WHERE status = 'active'`;
    const inactiveUsersSql = `SELECT COUNT(*) AS inactive FROM users WHERE status = 'inactive'`;
    const rolesSql = `SELECT COUNT(*) AS roles_count FROM roles`;
    const permsSql = `SELECT COUNT(*) AS perms_count FROM permissions`;

    const [[{ total }], [{ active }], [{ inactive }], [{ roles_count }], [{ perms_count }]] = await Promise.all([
      query(totalUsersSql),
      query(activeUsersSql),
      query(inactiveUsersSql),
      query(rolesSql),
      query(permsSql)
    ]);

    return {
      totalUsers: total,
      activeUsers: active,
      inactiveUsers: inactive,
      totalRoles: roles_count,
      totalPermissions: perms_count
    };
  }
}

module.exports = UserModel;

