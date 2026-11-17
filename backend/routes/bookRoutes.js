
import express from 'express';

import {
  getBooks,
  getBookById,
  addBook,
  updateBook,
  deleteBook
} from '../controllers/bookController.js';

import {
  verifyToken,
  authorizeRoles
} from '../middleware/authMiddleware.js';

const router = express.Router();

// Viewing books is available without logging in
router.get('/', getBooks);
router.get('/:id', getBookById);

// Only administrators and librarians can manage books
router.post(
  '/',
  verifyToken,
  authorizeRoles('admin', 'librarian'),
  addBook
);

router.put(
  '/:id',
  verifyToken,
  authorizeRoles('admin', 'librarian'),
  updateBook
);

router.delete(
  '/:id',
  verifyToken,
  authorizeRoles('admin', 'librarian'),
  deleteBook
);

export default router;
