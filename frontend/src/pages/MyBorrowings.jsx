
import { useEffect, useState } from 'react';
import { apiRequest } from '../services/api';

export default function MyBorrowings() {
  const [borrowings, setBorrowings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadBorrowings = async () => {
      try {
        const data = await apiRequest('/transactions/my');
        const transactions = data.transactions || [];

        const balances = {};

        transactions.forEach(transaction => {
          const id = transaction.book_id;

          if (!balances[id]) {
            balances[id] = {
              book_id: id,
              book_title: transaction.book_title,
              quantity: 0
            };
          }

          if (transaction.transaction_type === 'BORROW') {
            balances[id].quantity += Number(transaction.quantity);
          }

          if (transaction.transaction_type === 'RETURN') {
            balances[id].quantity -= Number(transaction.quantity);
          }
        });

        setBorrowings(
          Object.values(balances).filter(book => book.quantity > 0)
        );
      } catch (err) {
        setError(err.message || 'Could not load your borrowings.');
      } finally {
        setLoading(false);
      }
    };

    loadBorrowings();
  }, []);

  if (loading) {
    return <div className="page-container"><p>Loading your borrowings...</p></div>;
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <p className="page-eyebrow">MEMBER PORTAL</p>
          <h1>My Borrowings</h1>
          <p>Books currently checked out under your membership.</p>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="content-card">
        <div className="section-header">
          <div>
            <h2>Currently Borrowed Books</h2>
            <p>Only books with outstanding borrowed copies appear here.</p>
          </div>
        </div>

        {borrowings.length === 0 ? (
          <p className="empty-state">
            You currently have no borrowed books.
          </p>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Book Title</th>
                  <th>Outstanding Copies</th>
                </tr>
              </thead>

              <tbody>
                {borrowings.map(book => (
                  <tr key={book.book_id}>
                    <td><strong>{book.book_title}</strong></td>
                    <td>{book.quantity}</td>
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
