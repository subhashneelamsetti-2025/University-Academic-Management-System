const express = require('express');
const router = express.Router();
const { pool } = require('../db');

/**
 * GET /api/departments
 * Retrieves all departments with counts of staff, courses, and students.
 * Supports ?search= query parameter.
 */
router.get('/', async (req, res) => {
  try {
    const { search } = req.query;
    let query = `
      SELECT 
        d.department_id, 
        d.department_name, 
        d.office,
        (SELECT COUNT(*) FROM Staff st WHERE st.department_id = d.department_id) AS staff_count,
        (SELECT COUNT(*) FROM Course c WHERE c.department_id = d.department_id) AS course_count,
        (SELECT COUNT(*) FROM Student s WHERE s.major_id = d.department_id) AS student_count
      FROM Department d
    `;
    const params = [];

    if (search && search.trim()) {
      const trimmed = search.trim();
      const searchTerm = `%${trimmed}%`;
      const searchNum = Number(trimmed);

      if (!isNaN(searchNum) && Number.isInteger(searchNum)) {
        query += ` WHERE (d.department_id = ? OR d.department_name LIKE ? OR d.office LIKE ?)`;
        params.push(searchNum, searchTerm, searchTerm);
      } else {
        query += ` WHERE (d.department_name LIKE ? OR d.office LIKE ?)`;
        params.push(searchTerm, searchTerm);
      }
    }

    query += ` ORDER BY d.department_id ASC`;

    const [departments] = await pool.query(query, params);

    res.status(200).json({
      status: 'ok',
      count: departments.length,
      departments
    });
  } catch (error) {
    console.error('Error fetching departments:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to retrieve departments.',
      error: error.message
    });
  }
});

/**
 * GET /api/departments/:id
 * Retrieves a single department by ID with relationship counts
 */
router.get('/:id', async (req, res) => {
  const departmentId = Number(req.params.id);

  if (!Number.isInteger(departmentId) || departmentId <= 0) {
    return res.status(400).json({
      status: 'error',
      message: 'Invalid Department ID provided. Must be a positive integer.'
    });
  }

  try {
    const [rows] = await pool.query(`
      SELECT 
        d.department_id, 
        d.department_name, 
        d.office,
        (SELECT COUNT(*) FROM Staff st WHERE st.department_id = d.department_id) AS staff_count,
        (SELECT COUNT(*) FROM Course c WHERE c.department_id = d.department_id) AS course_count,
        (SELECT COUNT(*) FROM Student s WHERE s.major_id = d.department_id) AS student_count
      FROM Department d
      WHERE d.department_id = ?
    `, [departmentId]);

    if (rows.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: `Department with ID ${departmentId} was not found.`
      });
    }

    res.status(200).json({
      status: 'ok',
      department: rows[0]
    });
  } catch (error) {
    console.error('Error fetching department details:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to retrieve department details.',
      error: error.message
    });
  }
});

/**
 * POST /api/departments
 * Creates a new department
 */
router.post('/', async (req, res) => {
  const { department_id, department_name, office } = req.body;

  const idNum = Number(department_id);
  if (!Number.isInteger(idNum) || idNum <= 0) {
    return res.status(400).json({
      status: 'error',
      message: 'Department ID is required and must be a positive integer.'
    });
  }

  if (!department_name || typeof department_name !== 'string' || !department_name.trim()) {
    return res.status(400).json({
      status: 'error',
      message: 'Department Name is required.'
    });
  }

  const trimmedName = department_name.trim();
  if (trimmedName.length > 100) {
    return res.status(400).json({
      status: 'error',
      message: 'Department Name cannot exceed 100 characters.'
    });
  }

  const trimmedOffice = office && typeof office === 'string' ? office.trim() : null;
  if (trimmedOffice && trimmedOffice.length > 100) {
    return res.status(400).json({
      status: 'error',
      message: 'Office location cannot exceed 100 characters.'
    });
  }

  try {
    // Check for duplicate ID
    const [existing] = await pool.query(
      'SELECT department_id FROM Department WHERE department_id = ?',
      [idNum]
    );

    if (existing.length > 0) {
      return res.status(409).json({
        status: 'error',
        message: `Department ID ${idNum} already exists in the system.`
      });
    }

    // Insert Department
    await pool.query(
      'INSERT INTO Department (department_id, department_name, office) VALUES (?, ?, ?)',
      [idNum, trimmedName, trimmedOffice]
    );

    res.status(201).json({
      status: 'ok',
      message: 'Department created successfully.',
      department: {
        department_id: idNum,
        department_name: trimmedName,
        office: trimmedOffice
      }
    });
  } catch (error) {
    console.error('Error creating department:', error);

    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({
        status: 'error',
        message: `Department ID ${idNum} already exists.`,
        error: error.message
      });
    }

    res.status(500).json({
      status: 'error',
      message: 'Failed to create department.',
      error: error.message
    });
  }
});

/**
 * PUT /api/departments/:id
 * Updates an existing department's name and office. Primary key remains unchanged.
 */
router.put('/:id', async (req, res) => {
  const departmentId = Number(req.params.id);

  if (!Number.isInteger(departmentId) || departmentId <= 0) {
    return res.status(400).json({
      status: 'error',
      message: 'Invalid Department ID provided.'
    });
  }

  const { department_name, office } = req.body;

  if (!department_name || typeof department_name !== 'string' || !department_name.trim()) {
    return res.status(400).json({
      status: 'error',
      message: 'Department Name is required.'
    });
  }

  const trimmedName = department_name.trim();
  if (trimmedName.length > 100) {
    return res.status(400).json({
      status: 'error',
      message: 'Department Name cannot exceed 100 characters.'
    });
  }

  const trimmedOffice = office && typeof office === 'string' ? office.trim() : null;
  if (trimmedOffice && trimmedOffice.length > 100) {
    return res.status(400).json({
      status: 'error',
      message: 'Office location cannot exceed 100 characters.'
    });
  }

  try {
    const [existing] = await pool.query(
      'SELECT department_id FROM Department WHERE department_id = ?',
      [departmentId]
    );

    if (existing.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: `Department with ID ${departmentId} does not exist.`
      });
    }

    await pool.query(
      'UPDATE Department SET department_name = ?, office = ? WHERE department_id = ?',
      [trimmedName, trimmedOffice, departmentId]
    );

    res.status(200).json({
      status: 'ok',
      message: 'Department updated successfully.',
      department: {
        department_id: departmentId,
        department_name: trimmedName,
        office: trimmedOffice
      }
    });
  } catch (error) {
    console.error('Error updating department:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to update department.',
      error: error.message
    });
  }
});

/**
 * DELETE /api/departments/:id
 * Deletes a department if no dependent records (Students, Staff, Courses) exist
 */
router.delete('/:id', async (req, res) => {
  const departmentId = Number(req.params.id);

  if (!Number.isInteger(departmentId) || departmentId <= 0) {
    return res.status(400).json({
      status: 'error',
      message: 'Invalid Department ID provided.'
    });
  }

  try {
    const [deptRows] = await pool.query(
      'SELECT department_id, department_name FROM Department WHERE department_id = ?',
      [departmentId]
    );

    if (deptRows.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: `Department with ID ${departmentId} does not exist.`
      });
    }

    // Check dependent records in Student, Staff, and Course
    const [studentCount] = await pool.query('SELECT COUNT(*) as count FROM Student WHERE major_id = ?', [departmentId]);
    const [staffCount] = await pool.query('SELECT COUNT(*) as count FROM Staff WHERE department_id = ?', [departmentId]);
    const [courseCount] = await pool.query('SELECT COUNT(*) as count FROM Course WHERE department_id = ?', [departmentId]);

    const students = studentCount[0]?.count || 0;
    const staff = staffCount[0]?.count || 0;
    const courses = courseCount[0]?.count || 0;

    if (students > 0 || staff > 0 || courses > 0) {
      const details = [];
      if (students > 0) details.push(`${students} student(s)`);
      if (staff > 0) details.push(`${staff} staff member(s)`);
      if (courses > 0) details.push(`${courses} course(s)`);

      return res.status(409).json({
        status: 'error',
        code: 'ER_ROW_IS_REFERENCED_2',
        message: 'This department cannot be deleted because related student, staff, or course records exist.',
        details: `Active dependencies: ${details.join(', ')}. Reassign or remove these records first.`
      });
    }

    await pool.query('DELETE FROM Department WHERE department_id = ?', [departmentId]);

    res.status(200).json({
      status: 'ok',
      message: `Department "${deptRows[0].department_name}" (ID: ${departmentId}) was deleted successfully.`
    });
  } catch (error) {
    console.error('Error deleting department:', error);

    if (error.code === 'ER_ROW_IS_REFERENCED_2' || error.errno === 1451) {
      return res.status(409).json({
        status: 'error',
        code: 'ER_ROW_IS_REFERENCED_2',
        message: 'This department cannot be deleted because related student, staff, or course records exist.',
        error: error.message
      });
    }

    res.status(500).json({
      status: 'error',
      message: 'Failed to delete department.',
      error: error.message
    });
  }
});

module.exports = router;
