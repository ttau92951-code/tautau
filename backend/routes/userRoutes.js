
import express from 'express';

import {
  getUsers,
  getUserById,
  addUser,
  updateUser,
  deleteUser
} from '../controllers/userController.js';

import {
  verifyToken,
  authorizeRoles
} from '../middleware/authMiddleware.js';

const router = express.Router();

// All routes require authentication
router.use(verifyToken);

// Administrators and librarians can view users
router.get(
  '/',
  authorizeRoles('admin', 'librarian'),
  getUsers
);

router.get(
  '/:id',
  authorizeRoles('admin', 'librarian'),
  getUserById
);

// Only administrators can manage user accounts
router.post(
  '/',
  authorizeRoles('admin'),
  addUser
);

router.put(
  '/:id',
  authorizeRoles('admin'),
  updateUser
);

router.delete(
  '/:id',
  authorizeRoles('admin'),
  deleteUser
);

export default router;
