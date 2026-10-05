const express = require('express');
const router = express.Router();
const { pool } = require('../db');

// Email regex validation
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * GET /api/students
 * Retrieves list of students with joined Department names and optional search
 */
router.get('/', async (req, res) => {
  try {
    const { search } = req.query;
    let query = `
      SELECT 
        s.student_id, 
        s.student_name, 
        s.email, 
        s.major_id, 
        d.department_name,
        (SELECT COUNT(*) FROM Enrollment e WHERE e.student_id = s.student_id) AS enrollment_count
      FROM Student s
      LEFT JOIN Department d ON s.major_id = d.department_id
    `;
    const params = [];

    if (search && search.trim()) {
      const trimmed = search.trim();
      const searchTerm = `%${trimmed}%`;
      const searchNum = Number(trimmed);

      if (!isNaN(searchNum) && Number.isInteger(searchNum)) {
        query += ` WHERE (s.student_id = ? OR s.student_name LIKE ? OR s.email LIKE ? OR d.department_name LIKE ?)`;
        params.push(searchNum, searchTerm, searchTerm, searchTerm);
      } else {
        query += ` WHERE (s.student_name LIKE ? OR s.email LIKE ? OR d.department_name LIKE ?)`;
        params.push(searchTerm, searchTerm, searchTerm);
      }
    }

    query += ` ORDER BY s.student_id ASC`;

    const [students] = await pool.query(query, params);

    res.status(200).json({
      status: 'ok',
      count: students.length,
      students
    });
  } catch (error) {
    console.error('Error fetching students:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to retrieve students.',
      error: error.message
    });
  }
});

/**
 * GET /api/students/:id
 * Retrieves a single student by student_id
 */
router.get('/:id', async (req, res) => {
  const studentId = Number(req.params.id);

  if (!Number.isInteger(studentId) || studentId <= 0) {
    return res.status(400).json({
      status: 'error',
      message: 'Invalid Student ID provided. Must be a positive integer.'
    });
  }

  try {
    const [rows] = await pool.query(`
      SELECT 
        s.student_id, 
        s.student_name, 
        s.email, 
        s.major_id, 
        d.department_name,
        (SELECT COUNT(*) FROM Enrollment e WHERE e.student_id = s.student_id) AS enrollment_count
      FROM Student s
      LEFT JOIN Department d ON s.major_id = d.department_id
      WHERE s.student_id = ?
    `, [studentId]);

    if (rows.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: `Student with ID ${studentId} was not found.`
      });
    }

    res.status(200).json({
      status: 'ok',
      student: rows[0]
    });
  } catch (error) {
    console.error('Error fetching student:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to retrieve student details.',
      error: error.message
    });
  }
});

/**
 * POST /api/students
 * Creates a new student record
 */
router.post('/', async (req, res) => {
  const { student_id, student_name, email, major_id } = req.body;

  // 1. Validation
  const idNum = Number(student_id);
  if (!Number.isInteger(idNum) || idNum <= 0) {
    return res.status(400).json({
      status: 'error',
      message: 'Student ID is required and must be a positive integer.'
    });
  }

  if (!student_name || typeof student_name !== 'string' || !student_name.trim()) {
    return res.status(400).json({
      status: 'error',
      message: 'Student Name is required.'
    });
  }

  const trimmedName = student_name.trim();
  if (trimmedName.length > 100) {
    return res.status(400).json({
      status: 'error',
      message: 'Student Name cannot exceed 100 characters.'
    });
  }

  if (!email || typeof email !== 'string' || !EMAIL_REGEX.test(email.trim())) {
    return res.status(400).json({
      status: 'error',
      message: 'A valid email address is required (e.g., student@example.edu).'
    });
  }

  const trimmedEmail = email.trim();
  if (trimmedEmail.length > 100) {
    return res.status(400).json({
      status: 'error',
      message: 'Email address cannot exceed 100 characters.'
    });
  }

  const majorNum = Number(major_id);
  if (!Number.isInteger(majorNum) || majorNum <= 0) {
    return res.status(400).json({
      status: 'error',
      message: 'Major / Department is required and must be selected.'
    });
  }

  try {
    // 2. Validate Department existence
    const [deptRows] = await pool.query(
      'SELECT department_id, department_name FROM Department WHERE department_id = ?',
      [majorNum]
    );

    if (deptRows.length === 0) {
      return res.status(400).json({
        status: 'error',
        message: `Department ID ${majorNum} does not exist.`
      });
    }

    // 3. Check for Duplicate Student ID
    const [idCheck] = await pool.query(
      'SELECT student_id FROM Student WHERE student_id = ?',
      [idNum]
    );

    if (idCheck.length > 0) {
      return res.status(409).json({
        status: 'error',
        message: `Student ID ${idNum} already exists in the system. Please use a unique ID.`
      });
    }

    // 4. Check for Duplicate Email
    const [emailCheck] = await pool.query(
      'SELECT student_id FROM Student WHERE email = ?',
      [trimmedEmail]
    );

    if (emailCheck.length > 0) {
      return res.status(409).json({
        status: 'error',
        message: `Email '${trimmedEmail}' is already registered to student ID ${emailCheck[0].student_id}.`
      });
    }

    // 5. Insert Student
    await pool.query(
      'INSERT INTO Student (student_id, student_name, email, major_id) VALUES (?, ?, ?, ?)',
      [idNum, trimmedName, trimmedEmail, majorNum]
    );

    res.status(201).json({
      status: 'ok',
      message: 'Student registered successfully.',
      student: {
        student_id: idNum,
        student_name: trimmedName,
        email: trimmedEmail,
        major_id: majorNum,
        department_name: deptRows[0].department_name
      }
    });
  } catch (error) {
    console.error('Error creating student:', error);

    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({
        status: 'error',
        message: 'A duplicate record was detected (Student ID or Email already exists).',
        error: error.message
      });
    }

    if (error.code === 'ER_NO_REFERENCED_ROW_2') {
      return res.status(400).json({
        status: 'error',
        message: 'The selected Department does not exist.',
        error: error.message
      });
    }

    res.status(500).json({
      status: 'error',
      message: 'Failed to create student record.',
      error: error.message
    });
  }
});

/**
 * PUT /api/students/:id
 * Updates student details (name, email, major_id). Does not modify primary key.
 */
router.put('/:id', async (req, res) => {
  const studentId = Number(req.params.id);

  if (!Number.isInteger(studentId) || studentId <= 0) {
    return res.status(400).json({
      status: 'error',
      message: 'Invalid Student ID provided.'
    });
  }

  const { student_name, email, major_id } = req.body;

  if (!student_name || typeof student_name !== 'string' || !student_name.trim()) {
    return res.status(400).json({
      status: 'error',
      message: 'Student Name is required.'
    });
  }

  const trimmedName = student_name.trim();
  if (trimmedName.length > 100) {
    return res.status(400).json({
      status: 'error',
      message: 'Student Name cannot exceed 100 characters.'
    });
  }

  if (!email || typeof email !== 'string' || !EMAIL_REGEX.test(email.trim())) {
    return res.status(400).json({
      status: 'error',
      message: 'A valid email address is required.'
    });
  }

  const trimmedEmail = email.trim();
  if (trimmedEmail.length > 100) {
    return res.status(400).json({
      status: 'error',
      message: 'Email address cannot exceed 100 characters.'
    });
  }

  const majorNum = Number(major_id);
  if (!Number.isInteger(majorNum) || majorNum <= 0) {
    return res.status(400).json({
      status: 'error',
      message: 'Major / Department must be selected.'
    });
  }

  try {
    // 1. Verify student exists
    const [existingStudent] = await pool.query(
      'SELECT student_id FROM Student WHERE student_id = ?',
      [studentId]
    );

    if (existingStudent.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: `Student with ID ${studentId} does not exist.`
      });
    }

    // 2. Verify Department exists
    const [deptRows] = await pool.query(
      'SELECT department_id, department_name FROM Department WHERE department_id = ?',
      [majorNum]
    );

    if (deptRows.length === 0) {
      return res.status(400).json({
        status: 'error',
        message: `Department ID ${majorNum} does not exist.`
      });
    }

    // 3. Verify email uniqueness (excluding current student)
    const [emailCheck] = await pool.query(
      'SELECT student_id FROM Student WHERE email = ? AND student_id <> ?',
      [trimmedEmail, studentId]
    );

    if (emailCheck.length > 0) {
      return res.status(409).json({
        status: 'error',
        message: `Email '${trimmedEmail}' is already used by another student (ID: ${emailCheck[0].student_id}).`
      });
    }

    // 4. Update Student
    await pool.query(
      'UPDATE Student SET student_name = ?, email = ?, major_id = ? WHERE student_id = ?',
      [trimmedName, trimmedEmail, majorNum, studentId]
    );

    res.status(200).json({
      status: 'ok',
      message: 'Student profile updated successfully.',
      student: {
        student_id: studentId,
        student_name: trimmedName,
        email: trimmedEmail,
        major_id: majorNum,
        department_name: deptRows[0].department_name
      }
    });
  } catch (error) {
    console.error('Error updating student:', error);

    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({
        status: 'error',
        message: 'Email address is already in use by another student.',
        error: error.message
      });
    }

    res.status(500).json({
      status: 'error',
      message: 'Failed to update student profile.',
      error: error.message
    });
  }
});

/**
 * DELETE /api/students/:id
 * Deletes student record with foreign key check on Enrollment
 */
router.delete('/:id', async (req, res) => {
  const studentId = Number(req.params.id);

  if (!Number.isInteger(studentId) || studentId <= 0) {
    return res.status(400).json({
      status: 'error',
      message: 'Invalid Student ID provided.'
    });
  }

  try {
    // 1. Verify student exists
    const [existingStudent] = await pool.query(
      'SELECT student_id, student_name FROM Student WHERE student_id = ?',
      [studentId]
    );

    if (existingStudent.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: `Student with ID ${studentId} does not exist.`
      });
    }

    // 2. Check foreign-key dependency in Enrollment
    const [enrollmentRows] = await pool.query(
      'SELECT COUNT(*) AS total_enrollments FROM Enrollment WHERE student_id = ?',
      [studentId]
    );

    const totalEnrollments = enrollmentRows[0]?.total_enrollments || 0;
    if (totalEnrollments > 0) {
      return res.status(409).json({
        status: 'error',
        code: 'ER_ROW_IS_REFERENCED_2',
        message: 'This student cannot be deleted because enrollment records exist.',
        details: `Student has ${totalEnrollments} active course enrollment record(s). Delete or unenroll the courses first.`
      });
    }

    // 3. Attempt Delete
    await pool.query('DELETE FROM Student WHERE student_id = ?', [studentId]);

    res.status(200).json({
      status: 'ok',
      message: `Student "${existingStudent[0].student_name}" (ID: ${studentId}) was deleted successfully.`
    });
  } catch (error) {
    console.error('Error deleting student:', error);

    // Secondary safety for MySQL FK error 1451
    if (error.code === 'ER_ROW_IS_REFERENCED_2' || error.errno === 1451) {
      return res.status(409).json({
        status: 'error',
        code: 'ER_ROW_IS_REFERENCED_2',
        message: 'This student cannot be deleted because enrollment records exist.',
        error: error.message
      });
    }

    res.status(500).json({
      status: 'error',
      message: 'Failed to delete student record.',
      error: error.message
    });
  }
});

module.exports = router;
