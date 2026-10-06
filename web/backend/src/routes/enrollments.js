const express = require('express');
const router = express.Router();
const { pool } = require('../db');

/**
 * GET /api/enrollments
 * Retrieves all enrollment records with joined student names and course titles.
 * Supports ?search=, ?course_code=, and ?grade= query parameters.
 */
router.get('/', async (req, res) => {
  try {
    const { search, course_code, grade } = req.query;
    let query = `
      SELECT 
        e.enrollment_id,
        e.student_id,
        s.student_name,
        e.course_code,
        c.title AS course_title,
        e.marks,
        e.grade,
        DATE_FORMAT(e.enroll_date, '%Y-%m-%d') AS enroll_date
      FROM Enrollment e
      LEFT JOIN Student s ON e.student_id = s.student_id
      LEFT JOIN Course c ON e.course_code = c.course_code
      WHERE 1=1
    `;
    const params = [];

    if (course_code && course_code.trim()) {
      query += ` AND e.course_code = ?`;
      params.push(course_code.trim().toUpperCase());
    }

    if (grade && grade.trim()) {
      if (grade.trim().toLowerCase() === 'ungraded' || grade.trim().toLowerCase() === 'null') {
        query += ` AND e.grade IS NULL`;
      } else {
        query += ` AND e.grade = ?`;
        params.push(grade.trim().toUpperCase());
      }
    }

    if (search && search.trim()) {
      const trimmed = search.trim();
      const searchTerm = `%${trimmed}%`;
      const searchNum = Number(trimmed);

      if (!isNaN(searchNum) && Number.isInteger(searchNum)) {
        query += ` AND (e.enrollment_id = ? OR e.student_id = ? OR s.student_name LIKE ? OR e.course_code LIKE ? OR c.title LIKE ? OR e.grade LIKE ?)`;
        params.push(searchNum, searchNum, searchTerm, searchTerm, searchTerm, searchTerm);
      } else {
        query += ` AND (s.student_name LIKE ? OR e.course_code LIKE ? OR c.title LIKE ? OR e.grade LIKE ?)`;
        params.push(searchTerm, searchTerm, searchTerm, searchTerm);
      }
    }

    query += ` ORDER BY e.enrollment_id ASC`;

    const [enrollmentsList] = await pool.query(query, params);

    res.status(200).json({
      status: 'ok',
      count: enrollmentsList.length,
      enrollments: enrollmentsList
    });
  } catch (error) {
    console.error('Error fetching enrollments:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to retrieve course enrollments.',
      error: error.message
    });
  }
});

/**
 * GET /api/enrollments/:id
 * Retrieves a single enrollment record by enrollment_id
 */
router.get('/:id', async (req, res) => {
  const enrollmentId = Number(req.params.id);

  if (!Number.isInteger(enrollmentId) || enrollmentId <= 0) {
    return res.status(400).json({
      status: 'error',
      message: 'Invalid Enrollment ID provided. Must be a positive integer.'
    });
  }

  try {
    const [rows] = await pool.query(`
      SELECT 
        e.enrollment_id,
        e.student_id,
        s.student_name,
        e.course_code,
        c.title AS course_title,
        e.marks,
        e.grade,
        DATE_FORMAT(e.enroll_date, '%Y-%m-%d') AS enroll_date
      FROM Enrollment e
      LEFT JOIN Student s ON e.student_id = s.student_id
      LEFT JOIN Course c ON e.course_code = c.course_code
      WHERE e.enrollment_id = ?
    `, [enrollmentId]);

    if (rows.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: `Enrollment record #${enrollmentId} was not found.`
      });
    }

    res.status(200).json({
      status: 'ok',
      enrollment: rows[0]
    });
  } catch (error) {
    console.error('Error fetching enrollment details:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to retrieve enrollment details.',
      error: error.message
    });
  }
});

/**
 * POST /api/enrollments
 * Creates a new enrollment record linking student and course
 */
router.post('/', async (req, res) => {
  const { enrollment_id, student_id, course_code, marks, grade, enroll_date } = req.body;

  const idNum = Number(enrollment_id);
  if (!Number.isInteger(idNum) || idNum <= 0) {
    return res.status(400).json({
      status: 'error',
      message: 'Enrollment ID is required and must be a positive integer.'
    });
  }

  // Validate marks: integer 0-100 or null/empty
  let marksVal = null;
  if (marks !== undefined && marks !== null && String(marks).trim() !== '') {
    const parsedMarks = Number(marks);
    if (!Number.isInteger(parsedMarks) || parsedMarks < 0 || parsedMarks > 100) {
      return res.status(400).json({
        status: 'error',
        message: 'Marks must be an integer between 0 and 100, or left blank.'
      });
    }
    marksVal = parsedMarks;
  }

  const studentNum = Number(student_id);
  if (!Number.isInteger(studentNum) || studentNum <= 0) {
    return res.status(400).json({
      status: 'error',
      message: 'Student must be selected.'
    });
  }

  if (!course_code || typeof course_code !== 'string' || !course_code.trim()) {
    return res.status(400).json({
      status: 'error',
      message: 'Course must be selected.'
    });
  }

  const trimmedCode = course_code.trim().toUpperCase();

  let trimmedGrade = null;
  if (grade !== undefined && grade !== null && grade !== '') {
    trimmedGrade = String(grade).trim().toUpperCase();
    if (trimmedGrade.length > 2) {
      return res.status(400).json({
        status: 'error',
        message: 'Grade cannot exceed 2 characters (e.g., A, B+, C-).'
      });
    }
  }

  const dateVal = enroll_date && typeof enroll_date === 'string' && enroll_date.trim()
    ? enroll_date.trim()
    : new Date().toISOString().split('T')[0];

  try {
    // 1. Verify Student exists
    const [studentRows] = await pool.query(
      'SELECT student_id, student_name FROM Student WHERE student_id = ?',
      [studentNum]
    );

    if (studentRows.length === 0) {
      return res.status(400).json({
        status: 'error',
        message: `Student with ID ${studentNum} does not exist.`
      });
    }

    // 2. Verify Course exists
    const [courseRows] = await pool.query(
      'SELECT course_code, title FROM Course WHERE course_code = ?',
      [trimmedCode]
    );

    if (courseRows.length === 0) {
      return res.status(400).json({
        status: 'error',
        message: `Course with code '${trimmedCode}' does not exist.`
      });
    }

    // 3. Check duplicate enrollment_id
    const [idCheck] = await pool.query(
      'SELECT enrollment_id FROM Enrollment WHERE enrollment_id = ?',
      [idNum]
    );

    if (idCheck.length > 0) {
      return res.status(409).json({
        status: 'error',
        message: `Enrollment ID ${idNum} already exists in the system.`
      });
    }

    // 4. Check duplicate student-course pairing (uq_student_course)
    const [dupPairCheck] = await pool.query(
      'SELECT enrollment_id FROM Enrollment WHERE student_id = ? AND course_code = ?',
      [studentNum, trimmedCode]
    );

    if (dupPairCheck.length > 0) {
      return res.status(409).json({
        status: 'error',
        code: 'ER_DUP_ENTRY',
        message: 'This student is already enrolled in this course.'
      });
    }

    // 5. Insert Enrollment
    await pool.query(
      'INSERT INTO Enrollment (enrollment_id, student_id, course_code, marks, grade, enroll_date) VALUES (?, ?, ?, ?, ?, ?)',
      [idNum, studentNum, trimmedCode, marksVal, trimmedGrade, dateVal]
    );

    res.status(201).json({
      status: 'ok',
      message: 'Student enrolled in course successfully.',
      enrollment: {
        enrollment_id: idNum,
        student_id: studentNum,
        student_name: studentRows[0].student_name,
        course_code: trimmedCode,
        course_title: courseRows[0].title,
        marks: marksVal,
        grade: trimmedGrade,
        enroll_date: dateVal
      }
    });
  } catch (error) {
    console.error('Error creating enrollment:', error);

    if (error.code === 'ER_DUP_ENTRY') {
      if (error.message.includes('uq_student_course')) {
        return res.status(409).json({
          status: 'error',
          code: 'ER_DUP_ENTRY',
          message: 'This student is already enrolled in this course.',
          error: error.message
        });
      }
      return res.status(409).json({
        status: 'error',
        message: `Enrollment ID ${idNum} already exists.`,
        error: error.message
      });
    }

    if (error.code === 'ER_NO_REFERENCED_ROW_2') {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid foreign key: Selected student or course record does not exist.',
        error: error.message
      });
    }

    res.status(500).json({
      status: 'error',
      message: 'Failed to create enrollment record.',
      error: error.message
    });
  }
});

/**
 * PUT /api/enrollments/:id
 * Updates enrollment details (student_id, course_code, grade, enroll_date). ID protected.
 */
router.put('/:id', async (req, res) => {
  const enrollmentId = Number(req.params.id);

  if (!Number.isInteger(enrollmentId) || enrollmentId <= 0) {
    return res.status(400).json({
      status: 'error',
      message: 'Invalid Enrollment ID provided.'
    });
  }

  const { student_id, course_code, marks, grade, enroll_date } = req.body;

  const studentNum = Number(student_id);
  if (!Number.isInteger(studentNum) || studentNum <= 0) {
    return res.status(400).json({
      status: 'error',
      message: 'Student must be selected.'
    });
  }

  // Validate marks: integer 0-100 or null/empty
  let marksVal = null;
  if (marks !== undefined && marks !== null && String(marks).trim() !== '') {
    const parsedMarks = Number(marks);
    if (!Number.isInteger(parsedMarks) || parsedMarks < 0 || parsedMarks > 100) {
      return res.status(400).json({
        status: 'error',
        message: 'Marks must be an integer between 0 and 100, or left blank.'
      });
    }
    marksVal = parsedMarks;
  }

  if (!course_code || typeof course_code !== 'string' || !course_code.trim()) {
    return res.status(400).json({
      status: 'error',
      message: 'Course must be selected.'
    });
  }

  const trimmedCode = course_code.trim().toUpperCase();

  let trimmedGrade = null;
  if (grade !== undefined && grade !== null && grade !== '') {
    trimmedGrade = String(grade).trim().toUpperCase();
    if (trimmedGrade.length > 2) {
      return res.status(400).json({
        status: 'error',
        message: 'Grade cannot exceed 2 characters.'
      });
    }
  }

  const dateVal = enroll_date && typeof enroll_date === 'string' && enroll_date.trim()
    ? enroll_date.trim()
    : new Date().toISOString().split('T')[0];

  try {
    // 1. Verify Enrollment exists
    const [existing] = await pool.query(
      'SELECT enrollment_id FROM Enrollment WHERE enrollment_id = ?',
      [enrollmentId]
    );

    if (existing.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: `Enrollment record #${enrollmentId} does not exist.`
      });
    }

    // 2. Verify Student exists
    const [studentRows] = await pool.query(
      'SELECT student_id, student_name FROM Student WHERE student_id = ?',
      [studentNum]
    );

    if (studentRows.length === 0) {
      return res.status(400).json({
        status: 'error',
        message: `Student with ID ${studentNum} does not exist.`
      });
    }

    // 3. Verify Course exists
    const [courseRows] = await pool.query(
      'SELECT course_code, title FROM Course WHERE course_code = ?',
      [trimmedCode]
    );

    if (courseRows.length === 0) {
      return res.status(400).json({
        status: 'error',
        message: `Course with code '${trimmedCode}' does not exist.`
      });
    }

    // 4. Check duplicate student-course pairing (excluding current enrollment)
    const [pairCheck] = await pool.query(
      'SELECT enrollment_id FROM Enrollment WHERE student_id = ? AND course_code = ? AND enrollment_id <> ?',
      [studentNum, trimmedCode, enrollmentId]
    );

    if (pairCheck.length > 0) {
      return res.status(409).json({
        status: 'error',
        code: 'ER_DUP_ENTRY',
        message: 'This student is already enrolled in this course.'
      });
    }

    // 5. Update Enrollment
    await pool.query(
      'UPDATE Enrollment SET student_id = ?, course_code = ?, marks = ?, grade = ?, enroll_date = ? WHERE enrollment_id = ?',
      [studentNum, trimmedCode, marksVal, trimmedGrade, dateVal, enrollmentId]
    );

    res.status(200).json({
      status: 'ok',
      message: 'Enrollment record updated successfully.',
      enrollment: {
        enrollment_id: enrollmentId,
        student_id: studentNum,
        student_name: studentRows[0].student_name,
        course_code: trimmedCode,
        course_title: courseRows[0].title,
        marks: marksVal,
        grade: trimmedGrade,
        enroll_date: dateVal
      }
    });
  } catch (error) {
    console.error('Error updating enrollment:', error);

    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({
        status: 'error',
        message: 'This student is already enrolled in this course.',
        error: error.message
      });
    }

    res.status(500).json({
      status: 'error',
      message: 'Failed to update enrollment record.',
      error: error.message
    });
  }
});

/**
 * DELETE /api/enrollments/:id
 * Deletes an enrollment record
 */
router.delete('/:id', async (req, res) => {
  const enrollmentId = Number(req.params.id);

  if (!Number.isInteger(enrollmentId) || enrollmentId <= 0) {
    return res.status(400).json({
      status: 'error',
      message: 'Invalid Enrollment ID provided.'
    });
  }

  try {
    const [enrollmentRows] = await pool.query(`
      SELECT 
        e.enrollment_id,
        s.student_name,
        e.course_code
      FROM Enrollment e
      LEFT JOIN Student s ON e.student_id = s.student_id
      WHERE e.enrollment_id = ?
    `, [enrollmentId]);

    if (enrollmentRows.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: `Enrollment record #${enrollmentId} does not exist.`
      });
    }

    await pool.query('DELETE FROM Enrollment WHERE enrollment_id = ?', [enrollmentId]);

    res.status(200).json({
      status: 'ok',
      message: `Enrollment #${enrollmentId} (${enrollmentRows[0].student_name} - ${enrollmentRows[0].course_code}) was deleted successfully.`
    });
  } catch (error) {
    console.error('Error deleting enrollment:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to delete enrollment record.',
      error: error.message
    });
  }
});

module.exports = router;
