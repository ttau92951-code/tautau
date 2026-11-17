
import { useEffect, useState } from 'react';
import { apiRequest } from '../services/api';

export default function BrowseBooks() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [borrowingId, setBorrowingId] = useState(null);
  const [search, setSearch] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const loadBooks = async () => {
    try {
      const data = await apiRequest('/books');
      setBooks(data.books || []);
    } catch (err) {
      setError(err.message || 'Failed to load books.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBooks();
  }, []);

  const handleBorrow = async (bookId) => {
    setMessage('');
    setError('');
    setBorrowingId(bookId);

    try {
      const result = await apiRequest('/transactions/member-borrow', {
        method: 'POST',
        body: JSON.stringify({
          bookId,
          quantity: 1,
          notes: 'Borrowed through member portal'
        })
      });

      setMessage(result.message || 'Book borrowed successfully.');
      await loadBooks();
    } catch (err) {
      setError(err.message || 'Unable to borrow this book.');
    } finally {
      setBorrowingId(null);
    }
  };

  const filteredBooks = books.filter(book =>
    `${book.title} ${book.author} ${book.genre}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  if (loading) {
    return <div className="page-container"><p>Loading books...</p></div>;
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <p className="page-eyebrow">MEMBER PORTAL</p>
          <h1>Browse Books</h1>
          <p>Discover books and borrow available copies.</p>
        </div>
      </div>

      {message && <div className="success-message">{message}</div>}
      {error && <div className="error-message">{error}</div>}

      <div className="content-card">
        <div className="section-header">
          <div>
            <h2>Library Collection</h2>
            <p>{filteredBooks.length} books found</p>
          </div>

          <input
            type="text"
            className="search-input"
            placeholder="Search by title, author or genre..."
            value={search}
            onChange={event => setSearch(event.target.value)}
          />
        </div>

        {filteredBooks.length === 0 ? (
          <p className="empty-state">No books found.</p>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Author</th>
                  <th>Genre</th>
                  <th>Available</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {filteredBooks.map(book => (
                  <tr key={book.id}>
                    <td><strong>{book.title}</strong></td>
                    <td>{book.author}</td>
                    <td>{book.genre}</td>
                    <td>
                      {book.available_quantity > 0
                        ? `${book.available_quantity} copies`
                        : 'Unavailable'}
                    </td>
                    <td>
                      <button
                        className="primary-button"
                        disabled={
                          Number(book.available_quantity) < 1 ||
                          borrowingId === book.id
                        }
                        onClick={() => handleBorrow(book.id)}
                      >
                        {borrowingId === book.id ? 'Borrowing...' : 'Borrow Book'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
