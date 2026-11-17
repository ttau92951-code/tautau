
import db from '../config/db.js';

// GET: Retrieve all books
export const getBooks = async (req, res) => {
  try {
    const [books] = await db.query(
      'SELECT * FROM books ORDER BY created_at DESC'
    );

    res.status(200).json({
      success: true,
      count: books.length,
      books
    });
  } catch (error) {
    console.error('Get books error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve books.'
    });
  }
};

// GET: Retrieve one book
export const getBookById = async (req, res) => {
  try {
    const [books] = await db.query(
      'SELECT * FROM books WHERE id = ?',
      [req.params.id]
    );

    if (books.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Book not found.'
      });
    }

    res.status(200).json({
      success: true,
      book: books[0]
    });
  } catch (error) {
    console.error('Get book error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve book.'
    });
  }
};

// POST: Add a new book
export const addBook = async (req, res) => {
  try {
    const { title, author, genre, isbn, quantity } = req.body;

    if (!title || !author || !genre || !isbn ||
        quantity === undefined || quantity === '') {
      return res.status(400).json({
        success: false,
        message: 'Please provide all book details.'
      });
    }

    const stock = Number(quantity);

    if (!Number.isInteger(stock) || stock < 0) {
      return res.status(400).json({
        success: false,
        message: 'Quantity must be a non-negative whole number.'
      });
    }

    const [result] = await db.query(
      `INSERT INTO books
       (title, author, genre, isbn, quantity, available_quantity)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [title.trim(), author.trim(), genre.trim(), isbn.trim(), stock, stock]
    );

    res.status(201).json({
      success: true,
      message: 'Book added successfully.',
      bookId: result.insertId
    });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({
        success: false,
        message: 'A book with this ISBN already exists.'
      });
    }

    console.error('Add book error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to add book.'
    });
  }
};

// PUT: Update book details
export const updateBook = async (req, res) => {
  try {
    const { title, author, genre, isbn, quantity } = req.body;

    if (!title || !author || !genre || !isbn ||
        quantity === undefined || quantity === '') {
      return res.status(400).json({
        success: false,
        message: 'Please provide all book details.'
      });
    }

    const newQuantity = Number(quantity);

    if (!Number.isInteger(newQuantity) || newQuantity < 0) {
      return res.status(400).json({
        success: false,
        message: 'Quantity must be a non-negative whole number.'
      });
    }

    const [existing] = await db.query(
      'SELECT quantity, available_quantity FROM books WHERE id = ?',
      [req.params.id]
    );

    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Book not found.'
      });
    }

    const borrowed = existing[0].quantity -
                     existing[0].available_quantity;

    if (newQuantity < borrowed) {
      return res.status(400).json({
        success: false,
        message: `Quantity cannot be less than borrowed stock (${borrowed}).`
      });
    }

    const newAvailable = newQuantity - borrowed;

    await db.query(
      `UPDATE books
       SET title = ?, author = ?, genre = ?, isbn = ?,
           quantity = ?, available_quantity = ?
       WHERE id = ?`,
      [
        title.trim(),
        author.trim(),
        genre.trim(),
        isbn.trim(),
        newQuantity,
        newAvailable,
        req.params.id
      ]
    );

    res.status(200).json({
      success: true,
      message: 'Book updated successfully.'
    });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({
        success: false,
        message: 'Another book already uses this ISBN.'
      });
    }

    console.error('Update book error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to update book.'
    });
  }
};

// DELETE: Remove a book
export const deleteBook = async (req, res) => {
  try {
    const [existing] = await db.query(
      'SELECT id FROM books WHERE id = ?',
      [req.params.id]
    );

    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Book not found.'
      });
    }

    await db.query(
      'DELETE FROM books WHERE id = ?',
      [req.params.id]
    );

    res.status(200).json({
      success: true,
      message: 'Book deleted successfully.'
    });
  } catch (error) {
    if (error.code === 'ER_ROW_IS_REFERENCED_2') {
      return res.status(409).json({
        success: false,
        message: 'This book has transaction history and cannot be deleted.'
      });
    }

    console.error('Delete book error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to delete book.'
    });
  }
};
