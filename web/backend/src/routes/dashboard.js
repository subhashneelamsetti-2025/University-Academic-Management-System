const express = require('express');
const router = express.Router();
const { pool } = require('../db');

/**
 * GET /api/dashboard/stats
 * Retrieves live statistics and summary metrics from the database
 */
router.get('/stats', async (req, res) => {
  try {
    // 1. Table Counts
    const [countsResult] = await pool.query(`
      SELECT 
        (SELECT COUNT(*) FROM Student) AS totalStudents,
        (SELECT COUNT(*) FROM Department) AS totalDepartments,
        (SELECT COUNT(*) FROM Staff) AS totalStaff,
        (SELECT COUNT(*) FROM Course) AS totalCourses,
        (SELECT COUNT(*) FROM Section) AS totalSections,
        (SELECT COUNT(*) FROM Enrollment) AS totalEnrollments
    `);

    // 2. Students Grouped by Department
    const [deptDistribution] = await pool.query(`
      SELECT 
        d.department_id, 
        d.department_name, 
        COUNT(s.student_id) AS student_count
      FROM Department d
      LEFT JOIN Student s ON d.department_id = s.major_id
      GROUP BY d.department_id, d.department_name
      ORDER BY student_count DESC, d.department_name ASC
    `);

    // 3. Recent Student Records
    const [recentStudents] = await pool.query(`
      SELECT 
        s.student_id, 
        s.student_name, 
        s.email, 
        s.major_id, 
        d.department_name
      FROM Student s
      LEFT JOIN Department d ON s.major_id = d.department_id
      ORDER BY s.student_id DESC
      LIMIT 5
    `);

    // 4. Course Enrollment Highlights
    const [courseEnrollments] = await pool.query(`
      SELECT 
        c.course_code, 
        c.title, 
        c.credits,
        COUNT(e.enrollment_id) AS enrolled_count
      FROM Course c
      LEFT JOIN Enrollment e ON c.course_code = e.course_code
      GROUP BY c.course_code, c.title, c.credits
      ORDER BY enrolled_count DESC, c.course_code ASC
      LIMIT 5
    `);

    res.status(200).json({
      status: 'ok',
      counts: countsResult[0] || {
        totalStudents: 0,
        totalDepartments: 0,
        totalStaff: 0,
        totalCourses: 0,
        totalSections: 0,
        totalEnrollments: 0
      },
      studentsByDepartment: deptDistribution,
      recentStudents,
      courseEnrollments,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to retrieve dashboard statistics from database.',
      error: error.message
    });
  }
});

module.exports = router;
