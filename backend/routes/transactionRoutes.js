import express from 'express';

import {
  getTransactions,
  borrowBook,
  returnBook,
  addStock,
  getMyTransactions,
  memberBorrowBook
} from '../controllers/transactionController.js';

import {
  verifyToken,
  authorizeRoles
} from '../middleware/authMiddleware.js';

const router = express.Router();

// MEMBER ROUTES
router.get(
  '/my',
  verifyToken,
  authorizeRoles('member'),
  getMyTransactions
);

router.post(
  '/member-borrow',
  verifyToken,
  authorizeRoles('member'),
  memberBorrowBook
);

// ADMINISTRATOR AND LIBRARIAN ROUTES
router.get(
  '/',
  verifyToken,
  authorizeRoles('admin', 'librarian'),
  getTransactions
);

router.post(
  '/borrow',
  verifyToken,
  authorizeRoles('admin', 'librarian'),
  borrowBook
);

router.post(
  '/return',
  verifyToken,
  authorizeRoles('admin', 'librarian'),
  returnBook
);

router.post(
  '/stock',
  verifyToken,
  authorizeRoles('admin', 'librarian'),
  addStock
);

export default router;