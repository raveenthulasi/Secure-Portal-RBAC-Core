const mysql = require('mysql2/promise');
const config = require('./config');

const pool = mysql.createPool(config.db);

// Helper query function
const query = async (sql, params = []) => {
  const [results] = await pool.query(sql, params);
  return results;
};

// Test connection
const testConnection = async () => {
  try {
    const connection = await pool.getConnection();
    connection.release();
    return true;
  } catch (error) {
    console.error('MySQL Connection Error:', error.message);
    throw error;
  }
};

module.exports = {
  pool,
  query,
  testConnection
};

