
import { useEffect, useState } from 'react';
import { apiRequest } from '../services/api';

export default function MyHistory() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadHistory = async () => {
      try {
        const data = await apiRequest('/transactions/my');
        setTransactions(data.transactions || []);
      } catch (err) {
        setError(err.message || 'Could not load your history.');
      } finally {
        setLoading(false);
      }
    };

    loadHistory();
  }, []);

  if (loading) {
    return <div className="page-container"><p>Loading your history...</p></div>;
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <p className="page-eyebrow">MEMBER PORTAL</p>
          <h1>My History</h1>
          <p>Review your previous borrowing and return activity.</p>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="content-card">
        <div className="section-header">
          <div>
            <h2>Transaction History</h2>
            <p>{transactions.length} recorded transactions</p>
          </div>
        </div>

        {transactions.length === 0 ? (
          <p className="empty-state">
            Your transaction history will appear here.
          </p>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Book</th>
                  <th>Activity</th>
                  <th>Quantity</th>
                  <th>Date</th>
                  <th>Notes</th>
                </tr>
              </thead>

              <tbody>
                {transactions.map(transaction => (
                  <tr key={transaction.id}>
                    <td><strong>{transaction.book_title}</strong></td>
                    <td>{transaction.transaction_type}</td>
                    <td>{transaction.quantity}</td>
                    <td>
                      {new Date(
                        transaction.transaction_date
                      ).toLocaleDateString()}
                    </td>
                    <td>{transaction.notes || '—'}</td>
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
