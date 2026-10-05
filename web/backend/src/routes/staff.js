const express = require('express');
const router = express.Router();
const { pool } = require('../db');

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * GET /api/staff
 * Retrieves all staff members with joined department names and section counts.
 * Supports ?search= query parameter.
 */
router.get('/', async (req, res) => {
  try {
    const { search } = req.query;
    let query = `
      SELECT 
        st.staff_id, 
        st.staff_name, 
        st.role, 
        st.department_id, 
        st.email, 
        d.department_name,
        (SELECT COUNT(*) FROM Section sec WHERE sec.staff_id = st.staff_id) AS section_count
      FROM Staff st
      LEFT JOIN Department d ON st.department_id = d.department_id
    `;
    const params = [];

    if (search && search.trim()) {
      const trimmed = search.trim();
      const searchTerm = `%${trimmed}%`;
      const searchNum = Number(trimmed);

      if (!isNaN(searchNum) && Number.isInteger(searchNum)) {
        query += ` WHERE (st.staff_id = ? OR st.staff_name LIKE ? OR st.role LIKE ? OR st.email LIKE ? OR d.department_name LIKE ?)`;
        params.push(searchNum, searchTerm, searchTerm, searchTerm, searchTerm);
      } else {
        query += ` WHERE (st.staff_name LIKE ? OR st.role LIKE ? OR st.email LIKE ? OR d.department_name LIKE ?)`;
        params.push(searchTerm, searchTerm, searchTerm, searchTerm);
      }
    }

    query += ` ORDER BY st.staff_id ASC`;

    const [staffList] = await pool.query(query, params);

    res.status(200).json({
      status: 'ok',
      count: staffList.length,
      staff: staffList
    });
  } catch (error) {
    console.error('Error fetching staff list:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to retrieve staff members.',
      error: error.message
    });
  }
});

/**
 * GET /api/staff/:id
 * Retrieves a single staff member by ID
 */
router.get('/:id', async (req, res) => {
  const staffId = Number(req.params.id);

  if (!Number.isInteger(staffId) || staffId <= 0) {
    return res.status(400).json({
      status: 'error',
      message: 'Invalid Staff ID provided. Must be a positive integer.'
    });
  }

  try {
    const [rows] = await pool.query(`
      SELECT 
        st.staff_id, 
        st.staff_name, 
        st.role, 
        st.department_id, 
        st.email, 
        d.department_name,
        (SELECT COUNT(*) FROM Section sec WHERE sec.staff_id = st.staff_id) AS section_count
      FROM Staff st
      LEFT JOIN Department d ON st.department_id = d.department_id
      WHERE st.staff_id = ?
    `, [staffId]);

    if (rows.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: `Staff member with ID ${staffId} was not found.`
      });
    }

    res.status(200).json({
      status: 'ok',
      staff: rows[0]
    });
  } catch (error) {
    console.error('Error fetching staff member:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to retrieve staff member details.',
      error: error.message
    });
  }
});

/**
 * POST /api/staff
 * Creates a new staff member record
 */
router.post('/', async (req, res) => {
  const { staff_id, staff_name, role, department_id, email } = req.body;

  const idNum = Number(staff_id);
  if (!Number.isInteger(idNum) || idNum <= 0) {
    return res.status(400).json({
      status: 'error',
      message: 'Staff ID is required and must be a positive integer.'
    });
  }

  if (!staff_name || typeof staff_name !== 'string' || !staff_name.trim()) {
    return res.status(400).json({
      status: 'error',
      message: 'Staff Name is required.'
    });
  }

  const trimmedName = staff_name.trim();
  if (trimmedName.length > 100) {
    return res.status(400).json({
      status: 'error',
      message: 'Staff Name cannot exceed 100 characters.'
    });
  }

  const trimmedRole = role && typeof role === 'string' ? role.trim() : null;
  if (trimmedRole && trimmedRole.length > 50) {
    return res.status(400).json({
      status: 'error',
      message: 'Role cannot exceed 50 characters.'
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

  const deptNum = Number(department_id);
  if (!Number.isInteger(deptNum) || deptNum <= 0) {
    return res.status(400).json({
      status: 'error',
      message: 'Academic Department is required.'
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

    // 2. Check duplicate staff_id
    const [idCheck] = await pool.query(
      'SELECT staff_id FROM Staff WHERE staff_id = ?',
      [idNum]
    );

    if (idCheck.length > 0) {
      return res.status(409).json({
        status: 'error',
        message: `Staff ID ${idNum} already exists in the system.`
      });
    }

    // 3. Check duplicate email
    const [emailCheck] = await pool.query(
      'SELECT staff_id FROM Staff WHERE email = ?',
      [trimmedEmail]
    );

    if (emailCheck.length > 0) {
      return res.status(409).json({
        status: 'error',
        message: `Email '${trimmedEmail}' is already registered to staff ID ${emailCheck[0].staff_id}.`
      });
    }

    // 4. Insert Staff
    await pool.query(
      'INSERT INTO Staff (staff_id, staff_name, role, department_id, email) VALUES (?, ?, ?, ?, ?)',
      [idNum, trimmedName, trimmedRole, deptNum, trimmedEmail]
    );

    res.status(201).json({
      status: 'ok',
      message: 'Staff member registered successfully.',
      staff: {
        staff_id: idNum,
        staff_name: trimmedName,
        role: trimmedRole,
        department_id: deptNum,
        department_name: deptRows[0].department_name,
        email: trimmedEmail
      }
    });
  } catch (error) {
    console.error('Error creating staff member:', error);

    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({
        status: 'error',
        message: 'A duplicate record was detected (Staff ID or Email already exists).',
        error: error.message
      });
    }

    res.status(500).json({
      status: 'error',
      message: 'Failed to create staff member record.',
      error: error.message
    });
  }
});

/**
 * PUT /api/staff/:id
 * Updates staff member details (name, role, email, department). ID is protected.
 */
router.put('/:id', async (req, res) => {
  const staffId = Number(req.params.id);

  if (!Number.isInteger(staffId) || staffId <= 0) {
    return res.status(400).json({
      status: 'error',
      message: 'Invalid Staff ID provided.'
    });
  }

  const { staff_name, role, department_id, email } = req.body;

  if (!staff_name || typeof staff_name !== 'string' || !staff_name.trim()) {
    return res.status(400).json({
      status: 'error',
      message: 'Staff Name is required.'
    });
  }

  const trimmedName = staff_name.trim();
  if (trimmedName.length > 100) {
    return res.status(400).json({
      status: 'error',
      message: 'Staff Name cannot exceed 100 characters.'
    });
  }

  const trimmedRole = role && typeof role === 'string' ? role.trim() : null;
  if (trimmedRole && trimmedRole.length > 50) {
    return res.status(400).json({
      status: 'error',
      message: 'Role cannot exceed 50 characters.'
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

  const deptNum = Number(department_id);
  if (!Number.isInteger(deptNum) || deptNum <= 0) {
    return res.status(400).json({
      status: 'error',
      message: 'Academic Department must be selected.'
    });
  }

  try {
    // 1. Verify staff exists
    const [existing] = await pool.query(
      'SELECT staff_id FROM Staff WHERE staff_id = ?',
      [staffId]
    );

    if (existing.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: `Staff member with ID ${staffId} does not exist.`
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

    // 3. Verify email uniqueness (excluding current staff member)
    const [emailCheck] = await pool.query(
      'SELECT staff_id FROM Staff WHERE email = ? AND staff_id <> ?',
      [trimmedEmail, staffId]
    );

    if (emailCheck.length > 0) {
      return res.status(409).json({
        status: 'error',
        message: `Email '${trimmedEmail}' is already used by another staff member (ID: ${emailCheck[0].staff_id}).`
      });
    }

    // 4. Update Staff
    await pool.query(
      'UPDATE Staff SET staff_name = ?, role = ?, department_id = ?, email = ? WHERE staff_id = ?',
      [trimmedName, trimmedRole, deptNum, trimmedEmail, staffId]
    );

    res.status(200).json({
      status: 'ok',
      message: 'Staff member updated successfully.',
      staff: {
        staff_id: staffId,
        staff_name: trimmedName,
        role: trimmedRole,
        department_id: deptNum,
        department_name: deptRows[0].department_name,
        email: trimmedEmail
      }
    });
  } catch (error) {
    console.error('Error updating staff member:', error);

    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({
        status: 'error',
        message: 'Email address is already in use by another staff member.',
        error: error.message
      });
    }

    res.status(500).json({
      status: 'error',
      message: 'Failed to update staff member record.',
      error: error.message
    });
  }
});

/**
 * DELETE /api/staff/:id
 * Deletes a staff member if not referenced by Section records
 */
router.delete('/:id', async (req, res) => {
  const staffId = Number(req.params.id);

  if (!Number.isInteger(staffId) || staffId <= 0) {
    return res.status(400).json({
      status: 'error',
      message: 'Invalid Staff ID provided.'
    });
  }

  try {
    const [staffRows] = await pool.query(
      'SELECT staff_id, staff_name FROM Staff WHERE staff_id = ?',
      [staffId]
    );

    if (staffRows.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: `Staff member with ID ${staffId} does not exist.`
      });
    }

    // Check foreign key references in Section
    const [sectionRows] = await pool.query(
      'SELECT COUNT(*) AS total_sections FROM Section WHERE staff_id = ?',
      [staffId]
    );

    const totalSections = sectionRows[0]?.total_sections || 0;
    if (totalSections > 0) {
      return res.status(409).json({
        status: 'error',
        code: 'ER_ROW_IS_REFERENCED_2',
        message: 'This staff member cannot be deleted because assigned section records exist.',
        details: `Faculty member is assigned as instructor for ${totalSections} section(s). Reassign these sections first.`
      });
    }

    await pool.query('DELETE FROM Staff WHERE staff_id = ?', [staffId]);

    res.status(200).json({
      status: 'ok',
      message: `Staff member "${staffRows[0].staff_name}" (ID: ${staffId}) was deleted successfully.`
    });
  } catch (error) {
    console.error('Error deleting staff member:', error);

    if (error.code === 'ER_ROW_IS_REFERENCED_2' || error.errno === 1451) {
      return res.status(409).json({
        status: 'error',
        code: 'ER_ROW_IS_REFERENCED_2',
        message: 'This staff member cannot be deleted because assigned section records exist.',
        error: error.message
      });
    }

    res.status(500).json({
      status: 'error',
      message: 'Failed to delete staff member.',
      error: error.message
    });
  }
});

module.exports = router;
