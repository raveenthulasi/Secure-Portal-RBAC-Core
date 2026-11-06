const { query } = require('../config/db');

class ActivityLogModel {
  static async log({ userId = null, userEmail = 'system', action, details = '', ip = '127.0.0.1' }) {
    try {
      const sql = `
        INSERT INTO activity_logs (user_id, user_email, action, details, ip_address)
        VALUES (?, ?, ?, ?, ?)
      `;
      await query(sql, [userId, userEmail, action, details, ip]);
    } catch (err) {
      console.error('Failed to write activity log:', err.message);
    }
  }

  static async getRecent(limit = 10, userId = null) {
    let sql = `
      SELECT id, user_id, user_email, action, details, ip_address, created_at
      FROM activity_logs
    `;
    const params = [];
    if (userId) {
      sql += ` WHERE user_id = ?`;
      params.push(userId);
    }
    sql += ` ORDER BY id DESC LIMIT ?`;
    params.push(parseInt(limit, 10));

    return await query(sql, params);
  }
}

module.exports = ActivityLogModel;

