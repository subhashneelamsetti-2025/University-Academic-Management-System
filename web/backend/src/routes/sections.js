const express = require('express');
const router = express.Router();
const { pool } = require('../db');

/**
 * GET /api/sections
 * Retrieves all course sections with joined Course titles, Staff names, and enrollment counts.
 * Supports ?search=, ?term=, and ?course_code= filters.
 */
router.get('/', async (req, res) => {
  try {
    const { search, term, course_code } = req.query;
    let query = `
      SELECT 
        sec.section_id,
        sec.course_code,
        c.title AS course_title,
        sec.staff_id,
        st.staff_name,
        sec.term,
        sec.section_number,
        sec.room,
        (SELECT COUNT(*) FROM Enrollment e WHERE e.course_code = sec.course_code) AS enrollment_count
      FROM Section sec
      LEFT JOIN Course c ON sec.course_code = c.course_code
      LEFT JOIN Staff st ON sec.staff_id = st.staff_id
      WHERE 1=1
    `;
    const params = [];

    if (term && term.trim()) {
      query += ` AND sec.term = ?`;
      params.push(term.trim());
    }

    if (course_code && course_code.trim()) {
      query += ` AND sec.course_code = ?`;
      params.push(course_code.trim().toUpperCase());
    }

    if (search && search.trim()) {
      const trimmed = search.trim();
      const searchTerm = `%${trimmed}%`;
      const searchNum = Number(trimmed);

      if (!isNaN(searchNum) && Number.isInteger(searchNum)) {
        query += ` AND (sec.section_id = ? OR sec.course_code LIKE ? OR c.title LIKE ? OR st.staff_name LIKE ? OR sec.term LIKE ? OR sec.room LIKE ? OR sec.section_number LIKE ?)`;
        params.push(searchNum, searchTerm, searchTerm, searchTerm, searchTerm, searchTerm, searchTerm);
      } else {
        query += ` AND (sec.course_code LIKE ? OR c.title LIKE ? OR st.staff_name LIKE ? OR sec.term LIKE ? OR sec.room LIKE ? OR sec.section_number LIKE ?)`;
        params.push(searchTerm, searchTerm, searchTerm, searchTerm, searchTerm, searchTerm);
      }
    }

    query += ` ORDER BY sec.section_id ASC`;

    const [sectionsList] = await pool.query(query, params);

    res.status(200).json({
      status: 'ok',
      count: sectionsList.length,
      sections: sectionsList
    });
  } catch (error) {
    console.error('Error fetching sections:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to retrieve course sections.',
      error: error.message
    });
  }
});

/**
 * GET /api/sections/:id
 * Retrieves a single section by section_id
 */
router.get('/:id', async (req, res) => {
  const sectionId = Number(req.params.id);

  if (!Number.isInteger(sectionId) || sectionId <= 0) {
    return res.status(400).json({
      status: 'error',
      message: 'Invalid Section ID provided. Must be a positive integer.'
    });
  }

  try {
    const [rows] = await pool.query(`
      SELECT 
        sec.section_id,
        sec.course_code,
        c.title AS course_title,
        sec.staff_id,
        st.staff_name,
        sec.term,
        sec.section_number,
        sec.room,
        (SELECT COUNT(*) FROM Enrollment e WHERE e.course_code = sec.course_code) AS enrollment_count
      FROM Section sec
      LEFT JOIN Course c ON sec.course_code = c.course_code
      LEFT JOIN Staff st ON sec.staff_id = st.staff_id
      WHERE sec.section_id = ?
    `, [sectionId]);

    if (rows.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: `Section with ID ${sectionId} was not found.`
      });
    }

    res.status(200).json({
      status: 'ok',
      section: rows[0]
    });
  } catch (error) {
    console.error('Error fetching section details:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to retrieve section details.',
      error: error.message
    });
  }
});

/**
 * POST /api/sections
 * Creates a new section record
 */
router.post('/', async (req, res) => {
  const { section_id, course_code, staff_id, term, section_number, room } = req.body;

  const idNum = Number(section_id);
  if (!Number.isInteger(idNum) || idNum <= 0) {
    return res.status(400).json({
      status: 'error',
      message: 'Section ID is required and must be a positive integer.'
    });
  }

  if (!course_code || typeof course_code !== 'string' || !course_code.trim()) {
    return res.status(400).json({
      status: 'error',
      message: 'Course Code is required and must be selected.'
    });
  }

  const trimmedCode = course_code.trim().toUpperCase();

  if (!term || typeof term !== 'string' || !term.trim()) {
    return res.status(400).json({
      status: 'error',
      message: 'Academic Term is required (e.g., 2026-Fall).'
    });
  }

  const trimmedTerm = term.trim();
  if (trimmedTerm.length > 20) {
    return res.status(400).json({
      status: 'error',
      message: 'Term cannot exceed 20 characters.'
    });
  }

  const trimmedSecNum = section_number && typeof section_number === 'string' ? section_number.trim() : null;
  if (trimmedSecNum && trimmedSecNum.length > 10) {
    return res.status(400).json({
      status: 'error',
      message: 'Section Number cannot exceed 10 characters.'
    });
  }

  const trimmedRoom = room && typeof room === 'string' ? room.trim() : null;
  if (trimmedRoom && trimmedRoom.length > 20) {
    return res.status(400).json({
      status: 'error',
      message: 'Room location cannot exceed 20 characters.'
    });
  }

  let staffNum = null;
  if (staff_id !== undefined && staff_id !== null && staff_id !== '') {
    staffNum = Number(staff_id);
    if (!Number.isInteger(staffNum) || staffNum <= 0) {
      return res.status(400).json({
        status: 'error',
        message: 'Staff ID must be a positive integer if provided.'
      });
    }
  }

  try {
    // 1. Verify Course exists
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

    // 2. Verify Staff exists if provided
    let staffName = null;
    if (staffNum !== null) {
      const [staffRows] = await pool.query(
        'SELECT staff_id, staff_name FROM Staff WHERE staff_id = ?',
        [staffNum]
      );

      if (staffRows.length === 0) {
        return res.status(400).json({
          status: 'error',
          message: `Staff member with ID ${staffNum} does not exist.`
        });
      }
      staffName = staffRows[0].staff_name;
    }

    // 3. Check duplicate section_id
    const [idCheck] = await pool.query(
      'SELECT section_id FROM Section WHERE section_id = ?',
      [idNum]
    );

    if (idCheck.length > 0) {
      return res.status(409).json({
        status: 'error',
        message: `Section ID ${idNum} already exists in the system.`
      });
    }

    // 4. Insert Section
    await pool.query(
      'INSERT INTO Section (section_id, course_code, staff_id, term, section_number, room) VALUES (?, ?, ?, ?, ?, ?)',
      [idNum, trimmedCode, staffNum, trimmedTerm, trimmedSecNum, trimmedRoom]
    );

    res.status(201).json({
      status: 'ok',
      message: 'Section created successfully.',
      section: {
        section_id: idNum,
        course_code: trimmedCode,
        course_title: courseRows[0].title,
        staff_id: staffNum,
        staff_name: staffName,
        term: trimmedTerm,
        section_number: trimmedSecNum,
        room: trimmedRoom
      }
    });
  } catch (error) {
    console.error('Error creating section:', error);

    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({
        status: 'error',
        message: `Section ID ${idNum} already exists.`,
        error: error.message
      });
    }

    if (error.code === 'ER_NO_REFERENCED_ROW_2') {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid foreign key: Selected course or staff record does not exist.',
        error: error.message
      });
    }

    res.status(500).json({
      status: 'error',
      message: 'Failed to create section.',
      error: error.message
    });
  }
});

/**
 * PUT /api/sections/:id
 * Updates section details (course_code, staff_id, term, section_number, room). ID protected.
 */
router.put('/:id', async (req, res) => {
  const sectionId = Number(req.params.id);

  if (!Number.isInteger(sectionId) || sectionId <= 0) {
    return res.status(400).json({
      status: 'error',
      message: 'Invalid Section ID provided.'
    });
  }

  const { course_code, staff_id, term, section_number, room } = req.body;

  if (!course_code || typeof course_code !== 'string' || !course_code.trim()) {
    return res.status(400).json({
      status: 'error',
      message: 'Course Code is required.'
    });
  }

  const trimmedCode = course_code.trim().toUpperCase();

  if (!term || typeof term !== 'string' || !term.trim()) {
    return res.status(400).json({
      status: 'error',
      message: 'Academic Term is required.'
    });
  }

  const trimmedTerm = term.trim();
  if (trimmedTerm.length > 20) {
    return res.status(400).json({
      status: 'error',
      message: 'Term cannot exceed 20 characters.'
    });
  }

  const trimmedSecNum = section_number && typeof section_number === 'string' ? section_number.trim() : null;
  if (trimmedSecNum && trimmedSecNum.length > 10) {
    return res.status(400).json({
      status: 'error',
      message: 'Section Number cannot exceed 10 characters.'
    });
  }

  const trimmedRoom = room && typeof room === 'string' ? room.trim() : null;
  if (trimmedRoom && trimmedRoom.length > 20) {
    return res.status(400).json({
      status: 'error',
      message: 'Room location cannot exceed 20 characters.'
    });
  }

  let staffNum = null;
  if (staff_id !== undefined && staff_id !== null && staff_id !== '') {
    staffNum = Number(staff_id);
    if (!Number.isInteger(staffNum) || staffNum <= 0) {
      return res.status(400).json({
        status: 'error',
        message: 'Staff ID must be a positive integer.'
      });
    }
  }

  try {
    // 1. Verify section exists
    const [existing] = await pool.query(
      'SELECT section_id FROM Section WHERE section_id = ?',
      [sectionId]
    );

    if (existing.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: `Section with ID ${sectionId} does not exist.`
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

    // 3. Verify Staff exists if provided
    let staffName = null;
    if (staffNum !== null) {
      const [staffRows] = await pool.query(
        'SELECT staff_id, staff_name FROM Staff WHERE staff_id = ?',
        [staffNum]
      );

      if (staffRows.length === 0) {
        return res.status(400).json({
          status: 'error',
          message: `Staff member with ID ${staffNum} does not exist.`
        });
      }
      staffName = staffRows[0].staff_name;
    }

    // 4. Update Section
    await pool.query(
      'UPDATE Section SET course_code = ?, staff_id = ?, term = ?, section_number = ?, room = ? WHERE section_id = ?',
      [trimmedCode, staffNum, trimmedTerm, trimmedSecNum, trimmedRoom, sectionId]
    );

    res.status(200).json({
      status: 'ok',
      message: 'Section updated successfully.',
      section: {
        section_id: sectionId,
        course_code: trimmedCode,
        course_title: courseRows[0].title,
        staff_id: staffNum,
        staff_name: staffName,
        term: trimmedTerm,
        section_number: trimmedSecNum,
        room: trimmedRoom
      }
    });
  } catch (error) {
    console.error('Error updating section:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to update section.',
      error: error.message
    });
  }
});

/**
 * DELETE /api/sections/:id
 * Deletes a section record
 */
router.delete('/:id', async (req, res) => {
  const sectionId = Number(req.params.id);

  if (!Number.isInteger(sectionId) || sectionId <= 0) {
    return res.status(400).json({
      status: 'error',
      message: 'Invalid Section ID provided.'
    });
  }

  try {
    const [sectionRows] = await pool.query(
      'SELECT section_id, course_code, term, section_number FROM Section WHERE section_id = ?',
      [sectionId]
    );

    if (sectionRows.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: `Section with ID ${sectionId} does not exist.`
      });
    }

    await pool.query('DELETE FROM Section WHERE section_id = ?', [sectionId]);

    res.status(200).json({
      status: 'ok',
      message: `Section #${sectionId} (${sectionRows[0].course_code} - ${sectionRows[0].term}) was deleted successfully.`
    });
  } catch (error) {
    console.error('Error deleting section:', error);

    if (error.code === 'ER_ROW_IS_REFERENCED_2' || error.errno === 1451) {
      return res.status(409).json({
        status: 'error',
        code: 'ER_ROW_IS_REFERENCED_2',
        message: 'This section cannot be deleted because dependent records exist.',
        error: error.message
      });
    }

    res.status(500).json({
      status: 'error',
      message: 'Failed to delete section.',
      error: error.message
    });
  }
});

module.exports = router;
