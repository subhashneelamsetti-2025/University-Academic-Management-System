const express = require('express');
const router = express.Router();
const { pool } = require('../db');

/**
 * GET /api/reports/overview
 * Returns an aggregated executive summary of all reports in a single payload.
 */
router.get('/overview', async (req, res) => {
  try {
    const { department_id, term } = req.query;

    // 1. Overall Metrics
    const [countsResult] = await pool.query(`
      SELECT 
        (SELECT COUNT(*) FROM Student) AS totalStudents,
        (SELECT COUNT(*) FROM Department) AS totalDepartments,
        (SELECT COUNT(*) FROM Staff) AS totalStaff,
        (SELECT COUNT(*) FROM Course) AS totalCourses,
        (SELECT COUNT(*) FROM Section) AS totalSections,
        (SELECT COUNT(*) FROM Enrollment) AS totalEnrollments
    `);

    // 2. Student Statistics by Department
    const [studentsByDept] = await pool.query(`
      SELECT 
        d.department_id,
        d.department_name,
        COUNT(s.student_id) AS student_count,
        ROUND((COUNT(s.student_id) * 100.0) / (SELECT GREATEST(COUNT(*), 1) FROM Student), 1) AS percentage
      FROM Department d
      LEFT JOIN Student s ON d.department_id = s.major_id
      GROUP BY d.department_id, d.department_name
      ORDER BY student_count DESC, d.department_name ASC
    `);

    // 3. Course Statistics by Department
    const [coursesByDept] = await pool.query(`
      SELECT 
        d.department_id,
        d.department_name,
        COUNT(c.course_code) AS course_count,
        COALESCE(SUM(c.credits), 0) AS total_credits,
        COALESCE(ROUND(AVG(c.credits), 1), 0) AS avg_credits
      FROM Department d
      LEFT JOIN Course c ON d.department_id = c.department_id
      GROUP BY d.department_id, d.department_name
      ORDER BY course_count DESC, d.department_name ASC
    `);

    // 4. Enrollment Statistics by Course
    const [enrollmentsByCourse] = await pool.query(`
      SELECT 
        c.course_code,
        c.title AS course_title,
        d.department_name,
        c.credits,
        COUNT(e.enrollment_id) AS enrollment_count,
        ROUND((COUNT(e.enrollment_id) * 100.0) / (SELECT GREATEST(COUNT(*), 1) FROM Enrollment), 1) AS percentage
      FROM Course c
      LEFT JOIN Department d ON c.department_id = d.department_id
      LEFT JOIN Enrollment e ON c.course_code = e.course_code
      GROUP BY c.course_code, c.title, d.department_name, c.credits
      ORDER BY enrollment_count DESC, c.course_code ASC
    `);

    // 5. Enrollment Statistics by Department
    const [enrollmentsByDept] = await pool.query(`
      SELECT 
        d.department_id,
        d.department_name,
        COUNT(e.enrollment_id) AS enrollment_count,
        ROUND((COUNT(e.enrollment_id) * 100.0) / (SELECT GREATEST(COUNT(*), 1) FROM Enrollment), 1) AS percentage
      FROM Department d
      LEFT JOIN Course c ON d.department_id = c.department_id
      LEFT JOIN Enrollment e ON c.course_code = e.course_code
      GROUP BY d.department_id, d.department_name
      ORDER BY enrollment_count DESC, d.department_name ASC
    `);

    // 6. Grade Distribution
    const [gradeDistribution] = await pool.query(`
      SELECT 
        COALESCE(grade, 'Ungraded') AS grade,
        COUNT(*) AS count,
        ROUND((COUNT(*) * 100.0) / (SELECT GREATEST(COUNT(*), 1) FROM Enrollment), 1) AS percentage
      FROM Enrollment
      GROUP BY grade
      ORDER BY 
        CASE 
          WHEN grade = 'A' THEN 1
          WHEN grade = 'A-' THEN 2
          WHEN grade = 'B+' THEN 3
          WHEN grade = 'B' THEN 4
          WHEN grade = 'B-' THEN 5
          WHEN grade = 'C+' THEN 6
          WHEN grade = 'C' THEN 7
          WHEN grade = 'F' THEN 8
          ELSE 9
        END,
        grade ASC
    `);

    // 6b. Marks Statistics
    const [marksStatistics] = await pool.query(`
      SELECT 
        COUNT(marks) AS evaluated_count,
        COALESCE(ROUND(AVG(marks), 1), NULL) AS avg_marks,
        MIN(marks) AS min_marks,
        MAX(marks) AS max_marks
      FROM Enrollment
    `);

    // 7. Staff Statistics by Department and Role
    const [staffByDept] = await pool.query(`
      SELECT 
        d.department_id,
        d.department_name,
        COUNT(st.staff_id) AS staff_count
      FROM Department d
      LEFT JOIN Staff st ON d.department_id = st.department_id
      GROUP BY d.department_id, d.department_name
      ORDER BY staff_count DESC, d.department_name ASC
    `);

    const [staffByRole] = await pool.query(`
      SELECT 
        COALESCE(role, 'Unassigned') AS role,
        COUNT(staff_id) AS count,
        ROUND((COUNT(staff_id) * 100.0) / (SELECT GREATEST(COUNT(*), 1) FROM Staff), 1) AS percentage
      FROM Staff
      GROUP BY role
      ORDER BY count DESC, role ASC
    `);

    // 8. Section Statistics by Term
    const [sectionsByTerm] = await pool.query(`
      SELECT 
        COALESCE(term, 'Unassigned') AS term,
        COUNT(section_id) AS section_count
      FROM Section
      GROUP BY term
      ORDER BY term ASC
    `);

    // 9. Sections with Enrollment and Staff
    const [sectionsRoster] = await pool.query(`
      SELECT 
        sec.section_id,
        sec.course_code,
        c.title AS course_title,
        sec.term,
        sec.section_number,
        sec.room,
        st.staff_name,
        (SELECT COUNT(*) FROM Enrollment e WHERE e.course_code = sec.course_code) AS enrollment_count
      FROM Section sec
      LEFT JOIN Course c ON sec.course_code = c.course_code
      LEFT JOIN Staff st ON sec.staff_id = st.staff_id
      ORDER BY sec.section_id ASC
    `);

    res.status(200).json({
      status: 'ok',
      counts: countsResult[0] || {},
      studentsByDepartment: studentsByDept,
      coursesByDepartment: coursesByDept,
      enrollmentsByCourse,
      enrollmentsByDepartment: enrollmentsByDept,
      gradeDistribution,
      marksStatistics: marksStatistics[0] || {},
      staffByDepartment: staffByDept,
      staffByRole,
      sectionsByTerm,
      sectionsRoster,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching reports overview:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to generate reports overview.',
      error: error.message
    });
  }
});

/**
 * GET /api/reports/student-statistics
 * Student population metrics and department breakdowns.
 */
router.get('/student-statistics', async (req, res) => {
  try {
    const [totalResult] = await pool.query(`SELECT COUNT(*) AS total_students FROM Student`);
    const totalStudents = totalResult[0]?.total_students || 0;

    const [byDept] = await pool.query(`
      SELECT 
        d.department_id,
        d.department_name,
        COUNT(s.student_id) AS student_count,
        ROUND((COUNT(s.student_id) * 100.0) / (SELECT GREATEST(COUNT(*), 1) FROM Student), 1) AS percentage
      FROM Department d
      LEFT JOIN Student s ON d.department_id = s.major_id
      GROUP BY d.department_id, d.department_name
      ORDER BY student_count DESC, d.department_name ASC
    `);

    const [students] = await pool.query(`
      SELECT 
        s.student_id,
        s.student_name,
        s.email,
        s.major_id,
        d.department_name
      FROM Student s
      LEFT JOIN Department d ON s.major_id = d.department_id
      ORDER BY s.student_id ASC
    `);

    res.status(200).json({
      status: 'ok',
      totalStudents,
      byDepartment: byDept,
      students
    });
  } catch (error) {
    console.error('Error in student-statistics report:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to generate student statistics report.',
      error: error.message
    });
  }
});

/**
 * GET /api/reports/course-statistics
 * Course offering metrics, credits, and department distribution.
 */
router.get('/course-statistics', async (req, res) => {
  try {
    const [totalsResult] = await pool.query(`
      SELECT 
        COUNT(*) AS total_courses,
        COALESCE(SUM(credits), 0) AS total_credits,
        COALESCE(ROUND(AVG(credits), 1), 0) AS avg_credits
      FROM Course
    `);

    const [byDept] = await pool.query(`
      SELECT 
        d.department_id,
        d.department_name,
        COUNT(c.course_code) AS course_count,
        COALESCE(SUM(c.credits), 0) AS total_credits,
        COALESCE(ROUND(AVG(c.credits), 1), 0) AS avg_credits
      FROM Department d
      LEFT JOIN Course c ON d.department_id = c.department_id
      GROUP BY d.department_id, d.department_name
      ORDER BY course_count DESC, d.department_name ASC
    `);

    const [courses] = await pool.query(`
      SELECT 
        c.course_code,
        c.title,
        c.credits,
        c.department_id,
        d.department_name,
        (SELECT COUNT(*) FROM Section sec WHERE sec.course_code = c.course_code) AS section_count,
        (SELECT COUNT(*) FROM Enrollment e WHERE e.course_code = c.course_code) AS enrollment_count
      FROM Course c
      LEFT JOIN Department d ON c.department_id = d.department_id
      ORDER BY c.course_code ASC
    `);

    res.status(200).json({
      status: 'ok',
      totals: totalsResult[0] || {},
      byDepartment: byDept,
      courses
    });
  } catch (error) {
    console.error('Error in course-statistics report:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to generate course statistics report.',
      error: error.message
    });
  }
});

/**
 * GET /api/reports/enrollment-statistics
 * Enrollment metrics, course enrollments, and grade breakdown.
 */
router.get('/enrollment-statistics', async (req, res) => {
  try {
    const [totalsResult] = await pool.query(`SELECT COUNT(*) AS total_enrollments FROM Enrollment`);
    const totalEnrollments = totalsResult[0]?.total_enrollments || 0;

    const [byCourse] = await pool.query(`
      SELECT 
        c.course_code,
        c.title AS course_title,
        d.department_name,
        COUNT(e.enrollment_id) AS enrollment_count,
        ROUND((COUNT(e.enrollment_id) * 100.0) / (SELECT GREATEST(COUNT(*), 1) FROM Enrollment), 1) AS percentage
      FROM Course c
      LEFT JOIN Department d ON c.department_id = d.department_id
      LEFT JOIN Enrollment e ON c.course_code = e.course_code
      GROUP BY c.course_code, c.title, d.department_name
      ORDER BY enrollment_count DESC, c.course_code ASC
    `);

    const [byDept] = await pool.query(`
      SELECT 
        d.department_id,
        d.department_name,
        COUNT(e.enrollment_id) AS enrollment_count,
        ROUND((COUNT(e.enrollment_id) * 100.0) / (SELECT GREATEST(COUNT(*), 1) FROM Enrollment), 1) AS percentage
      FROM Department d
      LEFT JOIN Course c ON d.department_id = c.department_id
      LEFT JOIN Enrollment e ON c.course_code = e.course_code
      GROUP BY d.department_id, d.department_name
      ORDER BY enrollment_count DESC, d.department_name ASC
    `);

    const [gradeDist] = await pool.query(`
      SELECT 
        COALESCE(grade, 'Ungraded') AS grade,
        COUNT(*) AS count,
        ROUND((COUNT(*) * 100.0) / (SELECT GREATEST(COUNT(*), 1) FROM Enrollment), 1) AS percentage
      FROM Enrollment
      GROUP BY grade
      ORDER BY 
        CASE 
          WHEN grade = 'A' THEN 1
          WHEN grade = 'A-' THEN 2
          WHEN grade = 'B+' THEN 3
          WHEN grade = 'B' THEN 4
          WHEN grade = 'B-' THEN 5
          WHEN grade = 'C+' THEN 6
          WHEN grade = 'C' THEN 7
          WHEN grade = 'F' THEN 8
          ELSE 9
        END,
        grade ASC
    `);

    const [marksStatsResult] = await pool.query(`
      SELECT 
        COUNT(marks) AS evaluated_count,
        COALESCE(ROUND(AVG(marks), 1), NULL) AS avg_marks,
        MIN(marks) AS min_marks,
        MAX(marks) AS max_marks
      FROM Enrollment
    `);

    res.status(200).json({
      status: 'ok',
      totalEnrollments,
      byCourse,
      byDepartment: byDept,
      gradeDistribution: gradeDist,
      marksStatistics: marksStatsResult[0] || {}
    });
  } catch (error) {
    console.error('Error in enrollment-statistics report:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to generate enrollment statistics report.',
      error: error.message
    });
  }
});

/**
 * GET /api/reports/staff-statistics
 * Faculty and staff metrics by department and academic rank.
 */
router.get('/staff-statistics', async (req, res) => {
  try {
    const [totalsResult] = await pool.query(`SELECT COUNT(*) AS total_staff FROM Staff`);
    const totalStaff = totalsResult[0]?.total_staff || 0;

    const [byDept] = await pool.query(`
      SELECT 
        d.department_id,
        d.department_name,
        COUNT(st.staff_id) AS staff_count,
        ROUND((COUNT(st.staff_id) * 100.0) / (SELECT GREATEST(COUNT(*), 1) FROM Staff), 1) AS percentage
      FROM Department d
      LEFT JOIN Staff st ON d.department_id = st.department_id
      GROUP BY d.department_id, d.department_name
      ORDER BY staff_count DESC, d.department_name ASC
    `);

    const [byRole] = await pool.query(`
      SELECT 
        COALESCE(role, 'Unassigned') AS role,
        COUNT(staff_id) AS count,
        ROUND((COUNT(staff_id) * 100.0) / (SELECT GREATEST(COUNT(*), 1) FROM Staff), 1) AS percentage
      FROM Staff
      GROUP BY role
      ORDER BY count DESC, role ASC
    `);

    const [staff] = await pool.query(`
      SELECT 
        st.staff_id,
        st.staff_name,
        st.email,
        st.role,
        st.department_id,
        d.department_name
      FROM Staff st
      LEFT JOIN Department d ON st.department_id = d.department_id
      ORDER BY st.staff_id ASC
    `);

    res.status(200).json({
      status: 'ok',
      totalStaff,
      byDepartment: byDept,
      byRole,
      staff
    });
  } catch (error) {
    console.error('Error in staff-statistics report:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to generate staff statistics report.',
      error: error.message
    });
  }
});

/**
 * GET /api/reports/section-statistics
 * Section allocations, terms, and capacity status.
 */
router.get('/section-statistics', async (req, res) => {
  try {
    const [totalsResult] = await pool.query(`SELECT COUNT(*) AS total_sections FROM Section`);
    const totalSections = totalsResult[0]?.total_sections || 0;

    const [byTerm] = await pool.query(`
      SELECT 
        COALESCE(term, 'Unassigned') AS term,
        COUNT(section_id) AS section_count,
        ROUND((COUNT(section_id) * 100.0) / (SELECT GREATEST(COUNT(*), 1) FROM Section), 1) AS percentage
      FROM Section
      GROUP BY term
      ORDER BY term ASC
    `);

    const [byCourse] = await pool.query(`
      SELECT 
        c.course_code,
        c.title AS course_title,
        COUNT(sec.section_id) AS section_count
      FROM Course c
      LEFT JOIN Section sec ON c.course_code = sec.course_code
      GROUP BY c.course_code, c.title
      ORDER BY section_count DESC, c.course_code ASC
    `);

    const [sections] = await pool.query(`
      SELECT 
        sec.section_id,
        sec.course_code,
        c.title AS course_title,
        sec.term,
        sec.section_number,
        sec.room,
        st.staff_name,
        (SELECT COUNT(*) FROM Enrollment e WHERE e.course_code = sec.course_code) AS enrollment_count
      FROM Section sec
      LEFT JOIN Course c ON sec.course_code = c.course_code
      LEFT JOIN Staff st ON sec.staff_id = st.staff_id
      ORDER BY sec.section_id ASC
    `);

    res.status(200).json({
      status: 'ok',
      totalSections,
      byTerm,
      byCourse,
      sections
    });
  } catch (error) {
    console.error('Error in section-statistics report:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to generate section statistics report.',
      error: error.message
    });
  }
});

module.exports = router;
