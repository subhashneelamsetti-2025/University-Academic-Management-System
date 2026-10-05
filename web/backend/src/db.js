const mysql = require('mysql2/promise');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables from web/backend/.env
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'UniversityDB_Demo',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  connectTimeout: 5000
};

// Create a connection pool
const pool = mysql.createPool(dbConfig);

/**
 * Tests the MySQL connection and returns diagnostics
 */
async function checkDbConnection() {
  const startTime = Date.now();
  try {
    const [rows] = await pool.query('SELECT DATABASE() AS current_db, NOW() AS server_time');
    const latencyMs = Date.now() - startTime;
    return {
      connected: true,
      database: rows[0]?.current_db || dbConfig.database,
      serverTime: rows[0]?.server_time,
      latencyMs
    };
  } catch (error) {
    return {
      connected: false,
      database: dbConfig.database,
      error: error.message,
      code: error.code || 'UNKNOWN_ERROR'
    };
  }
}

module.exports = {
  pool,
  dbConfig,
  checkDbConnection
};
