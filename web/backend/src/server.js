const express = require('express');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');
const { checkDbConnection, dbConfig } = require('./db');
const dashboardRoutes = require('./routes/dashboard');
const departmentRoutes = require('./routes/departments');
const studentRoutes = require('./routes/students');
const staffRoutes = require('./routes/staff');
const courseRoutes = require('./routes/courses');
const sectionRoutes = require('./routes/sections');
const enrollmentRoutes = require('./routes/enrollments');
const reportRoutes = require('./routes/reports');

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors());
app.use(express.json());

// Serve static frontend files
const frontendDir = path.resolve(__dirname, '../../frontend');
app.use(express.static(frontendDir));

// REST API Routes
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/staff', staffRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/sections', sectionRoutes);
app.use('/api/enrollments', enrollmentRoutes);
app.use('/api/reports', reportRoutes);


/**
 * GET /api/health
 * Verifies backend is running and tests MySQL connection reachability.
 */
app.get('/api/health', async (req, res) => {
  const dbHealth = await checkDbConnection();

  if (dbHealth.connected) {
    return res.status(200).json({
      status: 'ok',
      backend: 'connected',
      database: 'connected',
      databaseName: dbHealth.database,
      latencyMs: dbHealth.latencyMs,
      timestamp: new Date().toISOString()
    });
  } else {
    return res.status(200).json({
      status: 'ok',
      backend: 'connected',
      database: 'disconnected',
      databaseName: dbHealth.database,
      error: dbHealth.error,
      code: dbHealth.code,
      hint: 'Verify DB_PASSWORD, DB_USER, and MySQL service status in web/backend/.env',
      timestamp: new Date().toISOString()
    });
  }
});

// Fallback route for frontend single-page view
app.get('*', (req, res) => {
  res.sendFile(path.join(frontendDir, 'index.html'));
});

// Start listening
const server = app.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(` University Academic Management System - Backend`);
  console.log(` Server running on: http://localhost:${PORT}`);
  console.log(` Health Check URL:  http://localhost:${PORT}/api/health`);
  console.log(` Target Database:   ${dbConfig.database} on ${dbConfig.host}:${dbConfig.port}`);
  console.log(`====================================================`);
});

module.exports = { app, server };
