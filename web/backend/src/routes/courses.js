const express = require('express');
const router = express.Router();
const { pool } = require('../db');

/**
 * GET /api/courses
 * Retrieves all courses with joined department names, section counts, and enrollment counts.
 * Supports ?search= query parameter.
 */
router.get('/', async (req, res) => {
  try {
    const { search } = req.query;
    let query = `
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
    `;
    const params = [];

    if (search && search.trim()) {
      const trimmed = search.trim();
      const searchTerm = `%${trimmed}%`;

      query += ` WHERE (c.course_code LIKE ? OR c.title LIKE ? OR d.department_name LIKE ?)`;
      params.push(searchTerm, searchTerm, searchTerm);
    }

    query += ` ORDER BY c.course_code ASC`;

    const [courseList] = await pool.query(query, params);

    res.status(200).json({
      status: 'ok',
      count: courseList.length,
      courses: courseList
    });
  } catch (error) {
    console.error('Error fetching courses:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to retrieve courses.',
      error: error.message
    });
  }
});

/**
 * GET /api/courses/:code
 * Retrieves a single course by course_code
 */
router.get('/:code', async (req, res) => {
  const courseCode = req.params.code ? req.params.code.trim().toUpperCase() : '';

  if (!courseCode) {
    return res.status(400).json({
      status: 'error',
      message: 'Course code is required.'
    });
  }

  try {
    const [rows] = await pool.query(`
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
      WHERE c.course_code = ?
    `, [courseCode]);

    if (rows.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: `Course with code '${courseCode}' was not found.`
      });
    }

    res.status(200).json({
      status: 'ok',
      course: rows[0]
    });
  } catch (error) {
    console.error('Error fetching course:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to retrieve course details.',
      error: error.message
    });
  }
});

/**
 * POST /api/courses
 * Creates a new course record
 */
router.post('/', async (req, res) => {
  const { course_code, title, credits, department_id } = req.body;

  if (!course_code || typeof course_code !== 'string' || !course_code.trim()) {
    return res.status(400).json({
      status: 'error',
      message: 'Course Code is required (e.g., CS101).'
    });
  }

  const trimmedCode = course_code.trim().toUpperCase();
  if (trimmedCode.length > 10) {
    return res.status(400).json({
      status: 'error',
      message: 'Course Code cannot exceed 10 characters.'
    });
  }

  if (!title || typeof title !== 'string' || !title.trim()) {
    return res.status(400).json({
      status: 'error',
      message: 'Course Title is required.'
    });
  }

  const trimmedTitle = title.trim();
  if (trimmedTitle.length > 150) {
    return res.status(400).json({
      status: 'error',
      message: 'Course Title cannot exceed 150 characters.'
    });
  }

  const creditsNum = Number(credits);
  if (!Number.isInteger(creditsNum) || creditsNum <= 0) {
    return res.status(400).json({
      status: 'error',
      message: 'Credits must be a positive integer greater than 0.'
    });
  }

  const deptNum = Number(department_id);
  if (!Number.isInteger(deptNum) || deptNum <= 0) {
    return res.status(400).json({
      status: 'error',
      message: 'Academic Department must be selected.'
    });
  }

  try {
    // 1. Verify Department exists
    const [deptRows] = await pool.query(
      'SELECT department_id, department_name FROM Department WHERE department_id = ?',
      [deptNum]
    );

    if (deptRows.length === 0) {
      return res.status(400).json({
        status: 'error',
        message: `Department ID ${deptNum} does not exist.`
      });
    }

    // 2. Check duplicate course_code
    const [codeCheck] = await pool.query(
      'SELECT course_code FROM Course WHERE course_code = ?',
      [trimmedCode]
    );

    if (codeCheck.length > 0) {
      return res.status(409).json({
        status: 'error',
        message: `Course Code '${trimmedCode}' already exists in the catalog.`
      });
    }

    // 3. Insert Course
    await pool.query(
      'INSERT INTO Course (course_code, title, credits, department_id) VALUES (?, ?, ?, ?)',
      [trimmedCode, trimmedTitle, creditsNum, deptNum]
    );

    res.status(201).json({
      status: 'ok',
      message: 'Course registered successfully.',
      course: {
        course_code: trimmedCode,
        title: trimmedTitle,
        credits: creditsNum,
        department_id: deptNum,
        department_name: deptRows[0].department_name
      }
    });
  } catch (error) {
    console.error('Error creating course:', error);

    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({
        status: 'error',
        message: `Course Code '${trimmedCode}' already exists.`,
        error: error.message
      });
    }

    res.status(500).json({
      status: 'error',
      message: 'Failed to create course record.',
      error: error.message
    });
  }
});

/**
 * PUT /api/courses/:code
 * Updates course details (title, credits, department_id). Code is protected.
 */
router.put('/:code', async (req, res) => {
  const courseCode = req.params.code ? req.params.code.trim().toUpperCase() : '';

  if (!courseCode) {
    return res.status(400).json({
      status: 'error',
      message: 'Course code is required.'
    });
  }

  const { title, credits, department_id } = req.body;

  if (!title || typeof title !== 'string' || !title.trim()) {
    return res.status(400).json({
      status: 'error',
      message: 'Course Title is required.'
    });
  }

  const trimmedTitle = title.trim();
  if (trimmedTitle.length > 150) {
    return res.status(400).json({
      status: 'error',
      message: 'Course Title cannot exceed 150 characters.'
    });
  }

  const creditsNum = Number(credits);
  if (!Number.isInteger(creditsNum) || creditsNum <= 0) {
    return res.status(400).json({
      status: 'error',
      message: 'Credits must be a positive integer greater than 0.'
    });
  }

  const deptNum = Number(department_id);
  if (!Number.isInteger(deptNum) || deptNum <= 0) {
    return res.status(400).json({
      status: 'error',
      message: 'Academic Department must be selected.'
    });
  }

  try {
    // 1. Verify course exists
    const [existing] = await pool.query(
      'SELECT course_code FROM Course WHERE course_code = ?',
      [courseCode]
    );

    if (existing.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: `Course with code '${courseCode}' does not exist.`
      });
    }

    // 2. Verify Department exists
    const [deptRows] = await pool.query(
      'SELECT department_id, department_name FROM Department WHERE department_id = ?',
      [deptNum]
    );

    if (deptRows.length === 0) {
      return res.status(400).json({
        status: 'error',
        message: `Department ID ${deptNum} does not exist.`
      });
    }

    // 3. Update Course
    await pool.query(
      'UPDATE Course SET title = ?, credits = ?, department_id = ? WHERE course_code = ?',
      [trimmedTitle, creditsNum, deptNum, courseCode]
    );

    res.status(200).json({
      status: 'ok',
      message: 'Course updated successfully.',
      course: {
        course_code: courseCode,
        title: trimmedTitle,
        credits: creditsNum,
        department_id: deptNum,
        department_name: deptRows[0].department_name
      }
    });
  } catch (error) {
    console.error('Error updating course:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to update course record.',
      error: error.message
    });
  }
});

/**
 * DELETE /api/courses/:code
 * Deletes a course if not referenced by Section or Enrollment records
 */
router.delete('/:code', async (req, res) => {
  const courseCode = req.params.code ? req.params.code.trim().toUpperCase() : '';

  if (!courseCode) {
    return res.status(400).json({
      status: 'error',
      message: 'Course code is required.'
    });
  }

  try {
    const [courseRows] = await pool.query(
      'SELECT course_code, title FROM Course WHERE course_code = ?',
      [courseCode]
    );

    if (courseRows.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: `Course with code '${courseCode}' does not exist.`
      });
    }

    // Check foreign key references in Section and Enrollment
    const [sectionRows] = await pool.query(
      'SELECT COUNT(*) AS total_sections FROM Section WHERE course_code = ?',
      [courseCode]
    );
    const [enrollmentRows] = await pool.query(
      'SELECT COUNT(*) AS total_enrollments FROM Enrollment WHERE course_code = ?',
      [courseCode]
    );

    const sections = sectionRows[0]?.total_sections || 0;
    const enrollments = enrollmentRows[0]?.total_enrollments || 0;

    if (sections > 0 || enrollments > 0) {
      const details = [];
      if (sections > 0) details.push(`${sections} section(s)`);
      if (enrollments > 0) details.push(`${enrollments} enrollment(s)`);

      return res.status(409).json({
        status: 'error',
        code: 'ER_ROW_IS_REFERENCED_2',
        message: 'This course cannot be deleted because related section or enrollment records exist.',
        details: `Active dependencies: ${details.join(', ')}. Remove sections and unenroll students first.`
      });
    }

    await pool.query('DELETE FROM Course WHERE course_code = ?', [courseCode]);

    res.status(200).json({
      status: 'ok',
      message: `Course "${courseRows[0].title}" (${courseCode}) was deleted successfully.`
    });
  } catch (error) {
    console.error('Error deleting course:', error);

    if (error.code === 'ER_ROW_IS_REFERENCED_2' || error.errno === 1451) {
      return res.status(409).json({
        status: 'error',
        code: 'ER_ROW_IS_REFERENCED_2',
        message: 'This course cannot be deleted because related section or enrollment records exist.',
        error: error.message
      });
    }

    res.status(500).json({
      status: 'error',
      message: 'Failed to delete course record.',
      error: error.message
    });
  }
});

module.exports = router;
