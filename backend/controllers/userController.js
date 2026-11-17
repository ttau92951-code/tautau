
import db from '../config/db.js';
import bcrypt from 'bcryptjs';

// GET: Retrieve all users
export const getUsers = async (req, res) => {
  try {
    const [users] = await db.query(`
      SELECT id, name, membership_id, role, created_at
      FROM users
      ORDER BY created_at DESC
    `);

    res.status(200).json({
      success: true,
      count: users.length,
      users
    });
  } catch (error) {
    console.error('Get users error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve users.'
    });
  }
};

// GET: Retrieve one user
export const getUserById = async (req, res) => {
  try {
    const [users] = await db.query(
      `SELECT id, name, membership_id, role, created_at
       FROM users WHERE id = ?`,
      [req.params.id]
    );

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found.'
      });
    }

    res.status(200).json({
      success: true,
      user: users[0]
    });
  } catch (error) {
    console.error('Get user error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve user.'
    });
  }
};

// POST: Add a new user
export const addUser = async (req, res) => {
  try {
    const { name, membershipId, password, role } = req.body;

    if (!name || !membershipId || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, membership ID and password are required.'
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'Password must contain at least 8 characters.'
      });
    }

    const allowedRoles = ['admin', 'librarian', 'member'];
    const selectedRole = role || 'member';

    if (!allowedRoles.includes(selectedRole)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user role.'
      });
    }

    const [existing] = await db.query(
      'SELECT id FROM users WHERE membership_id = ?',
      [membershipId]
    );

    if (existing.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'Membership ID already exists.'
      });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const [result] = await db.query(
      `INSERT INTO users
       (name, membership_id, password_hash, role)
       VALUES (?, ?, ?, ?)`,
      [name.trim(), membershipId.trim(), passwordHash, selectedRole]
    );

    res.status(201).json({
      success: true,
      message: 'User added successfully.',
      userId: result.insertId
    });
  } catch (error) {
    console.error('Add user error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to add user.'
    });
  }
};

// PUT: Update a user's details
export const updateUser = async (req, res) => {
  try {
    const { name, membershipId, role, password } = req.body;

    if (!name || !membershipId || !role) {
      return res.status(400).json({
        success: false,
        message: 'Name, membership ID and role are required.'
      });
    }

    const allowedRoles = ['admin', 'librarian', 'member'];

    if (!allowedRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user role.'
      });
    }

    const [existing] = await db.query(
      'SELECT id FROM users WHERE id = ?',
      [req.params.id]
    );

    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found.'
      });
    }

    const [duplicate] = await db.query(
      'SELECT id FROM users WHERE membership_id = ? AND id != ?',
      [membershipId, req.params.id]
    );

    if (duplicate.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'Membership ID is already used by another user.'
      });
    }

    if (password && password.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'New password must contain at least 8 characters.'
      });
    }

    if (password) {
      const passwordHash = await bcrypt.hash(password, 12);

      await db.query(
        `UPDATE users
         SET name = ?, membership_id = ?, role = ?, password_hash = ?
         WHERE id = ?`,
        [name.trim(), membershipId.trim(), role, passwordHash, req.params.id]
      );
    } else {
      await db.query(
        `UPDATE users
         SET name = ?, membership_id = ?, role = ?
         WHERE id = ?`,
        [name.trim(), membershipId.trim(), role, req.params.id]
      );
    }

    res.status(200).json({
      success: true,
      message: 'User updated successfully.'
    });
  } catch (error) {
    console.error('Update user error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to update user.'
    });
  }
};

// DELETE: Delete a user
export const deleteUser = async (req, res) => {
  try {
    const [existing] = await db.query(
      'SELECT id FROM users WHERE id = ?',
      [req.params.id]
    );

    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found.'
      });
    }

    await db.query(
      'DELETE FROM users WHERE id = ?',
      [req.params.id]
    );

    res.status(200).json({
      success: true,
      message: 'User deleted successfully.'
    });
  } catch (error) {
    if (error.code === 'ER_ROW_IS_REFERENCED_2') {
      return res.status(409).json({
        success: false,
        message: 'This user has transaction history and cannot be deleted.'
      });
    }

    console.error('Delete user error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to delete user.'
    });
  }
};
