
import { useEffect, useState } from 'react';
import { apiRequest } from '../services/api';

export default function MemberDashboard() {
  const [books, setBooks] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const [bookData, transactionData] = await Promise.all([
          apiRequest('/books'),
          apiRequest('/transactions/my')
        ]);

        setBooks(bookData.books || []);
        setTransactions(transactionData.transactions || []);
      } catch (err) {
        setError(err.message || 'Could not load your dashboard.');
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  const activeBorrowings = transactions
    .filter(item => item.transaction_type === 'BORROW')
    .reduce((total, item) => total + Number(item.quantity), 0)
    -
    transactions
      .filter(item => item.transaction_type === 'RETURN')
      .reduce((total, item) => total + Number(item.quantity), 0);

  const availableBooks = books.reduce(
    (total, book) => total + Number(book.available_quantity),
    0
  );

  if (loading) return <div className="page-container"><p>Loading dashboard...</p></div>;

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <p className="page-eyebrow">MEMBER PORTAL</p>
          <h1>My Dashboard</h1>
          <p>Welcome to your personal library space.</p>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-content">
            <p>Available Copies</p>
            <h2>{availableBooks}</h2>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-content">
            <p>My Active Borrowings</p>
            <h2>{Math.max(0, activeBorrowings)}</h2>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-content">
            <p>My Transactions</p>
            <h2>{transactions.length}</h2>
          </div>
        </div>
      </div>

      <div className="content-card">
        <div className="section-header">
          <div>
            <h2>Recent Activity</h2>
            <p>Your latest borrowing and return records.</p>
          </div>
        </div>

        {transactions.length === 0 ? (
          <p className="empty-state">You haven't borrowed any books yet.</p>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Book</th>
                  <th>Activity</th>
                  <th>Quantity</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {transactions.slice(0, 5).map(transaction => (
                  <tr key={transaction.id}>
                    <td>{transaction.book_title}</td>
                    <td>{transaction.transaction_type}</td>
                    <td>{transaction.quantity}</td>
                    <td>
                      {new Date(transaction.transaction_date).toLocaleDateString()}
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
