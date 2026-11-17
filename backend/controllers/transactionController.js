
import db from '../config/db.js';

// GET: View all transactions
export const getTransactions = async (req, res) => {
  try {
    const [transactions] = await db.query(`
      SELECT
        t.id,
        t.book_id,
        b.title AS book_title,
        t.user_id,
        u.name AS user_name,
        u.membership_id,
        t.transaction_type,
        t.quantity,
        t.transaction_date,
        t.notes
      FROM transactions t
      INNER JOIN books b ON t.book_id = b.id
      INNER JOIN users u ON t.user_id = u.id
      ORDER BY t.transaction_date DESC
    `);

    res.status(200).json({
      success: true,
      count: transactions.length,
      transactions
    });
  } catch (error) {
    console.error('Get transactions error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve transactions.'
    });
  }
};

// POST: Borrow a book
export const borrowBook = async (req, res) => {
  const { bookId, userId, quantity, notes } = req.body;

  if (!bookId || !userId || quantity === undefined) {
    return res.status(400).json({
      success: false,
      message: 'Book, user and quantity are required.'
    });
  }

  const amount = Number(quantity);

  if (!Number.isInteger(amount) || amount <= 0) {
    return res.status(400).json({
      success: false,
      message: 'Quantity must be a positive whole number.'
    });
  }

  let connection;

  try {
    connection = await db.getConnection();
    await connection.beginTransaction();

    const [books] = await connection.query(
      'SELECT id, available_quantity FROM books WHERE id = ? FOR UPDATE',
      [bookId]
    );

    if (books.length === 0) {
      await connection.rollback();
      return res.status(404).json({
        success: false,
        message: 'Book not found.'
      });
    }

    const [users] = await connection.query(
      'SELECT id FROM users WHERE id = ?',
      [userId]
    );

    if (users.length === 0) {
      await connection.rollback();
      return res.status(404).json({
        success: false,
        message: 'User not found.'
      });
    }

    if (books[0].available_quantity < amount) {
      await connection.rollback();
      return res.status(400).json({
        success: false,
        message: 'Not enough available stock.'
      });
    }

    await connection.query(
      `UPDATE books
       SET available_quantity = available_quantity - ?
       WHERE id = ?`,
      [amount, bookId]
    );

    await connection.query(
      `INSERT INTO transactions
       (book_id, user_id, transaction_type, quantity, notes)
       VALUES (?, ?, 'BORROW', ?, ?)`,
      [bookId, userId, amount, notes || null]
    );

    await connection.commit();

    res.status(201).json({
      success: true,
      message: 'Book borrowed successfully.'
    });
  } catch (error) {
    if (connection) await connection.rollback();

    console.error('Borrow book error:', error.message);

    res.status(500).json({
      success: false,
      message: 'Failed to borrow book.'
    });
  } finally {
    if (connection) connection.release();
  }
};

// POST: Return a borrowed book
export const returnBook = async (req, res) => {
  const { bookId, userId, quantity, notes } = req.body;

  if (!bookId || !userId || quantity === undefined) {
    return res.status(400).json({
      success: false,
      message: 'Book, user and quantity are required.'
    });
  }

  const amount = Number(quantity);

  if (!Number.isInteger(amount) || amount <= 0) {
    return res.status(400).json({
      success: false,
      message: 'Quantity must be a positive whole number.'
    });
  }

  let connection;

  try {
    connection = await db.getConnection();
    await connection.beginTransaction();

    const [books] = await connection.query(
      'SELECT id, quantity, available_quantity FROM books WHERE id = ? FOR UPDATE',
      [bookId]
    );

    if (books.length === 0) {
      await connection.rollback();
      return res.status(404).json({
        success: false,
        message: 'Book not found.'
      });
    }

    const [users] = await connection.query(
      'SELECT id FROM users WHERE id = ?',
      [userId]
    );

    if (users.length === 0) {
      await connection.rollback();
      return res.status(404).json({
        success: false,
        message: 'User not found.'
      });
    }

    // Calculate how many copies this user currently has borrowed.
    const [borrowedRows] = await connection.query(
      `SELECT
         COALESCE(SUM(CASE
           WHEN transaction_type = 'BORROW' THEN quantity
           WHEN transaction_type = 'RETURN' THEN -quantity
           ELSE 0
         END), 0) AS borrowed
       FROM transactions
       WHERE book_id = ? AND user_id = ?`,
      [bookId, userId]
    );

    const borrowed = Number(borrowedRows[0].borrowed);

    if (borrowed < amount) {
      await connection.rollback();
      return res.status(400).json({
        success: false,
        message: 'Return quantity exceeds the amount borrowed by this user.'
      });
    }

    if (books[0].available_quantity + amount > books[0].quantity) {
      await connection.rollback();
      return res.status(400).json({
        success: false,
        message: 'Return would exceed total book stock.'
      });
    }

    await connection.query(
      `UPDATE books
       SET available_quantity = available_quantity + ?
       WHERE id = ?`,
      [amount, bookId]
    );

    await connection.query(
      `INSERT INTO transactions
       (book_id, user_id, transaction_type, quantity, notes)
       VALUES (?, ?, 'RETURN', ?, ?)`,
      [bookId, userId, amount, notes || null]
    );

    await connection.commit();

    res.status(201).json({
      success: true,
      message: 'Book returned successfully.'
    });
  } catch (error) {
    if (connection) await connection.rollback();

    console.error('Return book error:', error.message);

    res.status(500).json({
      success: false,
      message: 'Failed to return book.'
    });
  } finally {
    if (connection) connection.release();
  }
};

// POST: Add new stock
export const addStock = async (req, res) => {
  const { bookId, userId, quantity, notes } = req.body;

  if (!bookId || !userId || quantity === undefined) {
    return res.status(400).json({
      success: false,
      message: 'Book, user and quantity are required.'
    });
  }

  const amount = Number(quantity);

  if (!Number.isInteger(amount) || amount <= 0) {
    return res.status(400).json({
      success: false,
      message: 'Quantity must be a positive whole number.'
    });
  }

  let connection;

  try {
    connection = await db.getConnection();
    await connection.beginTransaction();

    const [books] = await connection.query(
      'SELECT id FROM books WHERE id = ? FOR UPDATE',
      [bookId]
    );

    if (books.length === 0) {
      await connection.rollback();
      return res.status(404).json({
        success: false,
        message: 'Book not found.'
      });
    }

    const [users] = await connection.query(
      'SELECT id FROM users WHERE id = ?',
      [userId]
    );

    if (users.length === 0) {
      await connection.rollback();
      return res.status(404).json({
        success: false,
        message: 'User not found.'
      });
    }

    await connection.query(
      `UPDATE books
       SET quantity = quantity + ?,
           available_quantity = available_quantity + ?
       WHERE id = ?`,
      [amount, amount, bookId]
    );

    await connection.query(
      `INSERT INTO transactions
       (book_id, user_id, transaction_type, quantity, notes)
       VALUES (?, ?, 'STOCK_IN', ?, ?)`,
      [bookId, userId, amount, notes || 'Additional stock received']
    );

    await connection.commit();

    res.status(201).json({
      success: true,
      message: 'New stock added successfully.'
    });
  } catch (error) {
    if (connection) await connection.rollback();

    console.error('Add stock error:', error.message);

    res.status(500).json({
      success: false,
      message: 'Failed to add stock.'
    });
  } finally {
    if (connection) connection.release();
  }
};
// GET: View only the logged-in member's transactions
export const getMyTransactions = async (req, res) => {
  try {
    const [transactions] = await db.query(
      `SELECT
         t.id,
         t.book_id,
         b.title AS book_title,
         t.user_id,
         t.transaction_type,
         t.quantity,
         t.transaction_date,
         t.notes
       FROM transactions t
       INNER JOIN books b ON t.book_id = b.id
       WHERE t.user_id = ?
       ORDER BY t.transaction_date DESC`,
      [req.user.id]
    );

    res.status(200).json({
      success: true,
      count: transactions.length,
      transactions
    });
  } catch (error) {
    console.error('Get member transactions error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve your transactions.'
    });
  }
};

// POST: Allow a member to borrow a book for themselves
export const memberBorrowBook = async (req, res) => {
  const { bookId, quantity, notes } = req.body;

  if (!bookId || quantity === undefined) {
    return res.status(400).json({
      success: false,
      message: 'Book and quantity are required.'
    });
  }

  const amount = Number(quantity);

  if (!Number.isInteger(amount) || amount <= 0) {
    return res.status(400).json({
      success: false,
      message: 'Quantity must be a positive whole number.'
    });
  }

  let connection;

  try {
    connection = await db.getConnection();
    await connection.beginTransaction();

    const [books] = await connection.query(
      'SELECT id, available_quantity FROM books WHERE id = ? FOR UPDATE',
      [bookId]
    );

    if (books.length === 0) {
      await connection.rollback();
      return res.status(404).json({
        success: false,
        message: 'Book not found.'
      });
    }

    if (books[0].available_quantity < amount) {
      await connection.rollback();
      return res.status(400).json({
        success: false,
        message: 'Not enough available stock.'
      });
    }

    await connection.query(
      `UPDATE books
       SET available_quantity = available_quantity - ?
       WHERE id = ?`,
      [amount, bookId]
    );

    await connection.query(
      `INSERT INTO transactions
       (book_id, user_id, transaction_type, quantity, notes)
       VALUES (?, ?, 'BORROW', ?, ?)`,
      [bookId, req.user.id, amount, notes || null]
    );

    await connection.commit();

    res.status(201).json({
      success: true,
      message: 'Book borrowed successfully.'
    });
  } catch (error) {
    if (connection) await connection.rollback();

    console.error('Member borrow error:', error.message);

    res.status(500).json({
      success: false,
      message: 'Failed to borrow book.'
    });
  } finally {
    if (connection) connection.release();
  }
};