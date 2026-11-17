
import { useEffect, useState } from 'react';
import {
  ArrowDownToLine,
  ArrowUpFromLine,
  PackagePlus,
  RefreshCw,
  History,
} from 'lucide-react';
import { apiRequest } from '../services/api';

export default function Transactions() {
  const [transactions, setTransactions] = useState([]);
  const [books, setBooks] = useState([]);
  const [users, setUsers] = useState([]);

  const [type, setType] = useState('BORROW');
  const [form, setForm] = useState({
    bookId: '',
    userId: '',
    quantity: 1,
    notes: '',
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const loadData = async () => {
    setLoading(true);
    setError('');

    try {
      const [transactionData, bookData, userData] = await Promise.all([
        apiRequest('/transactions'),
        apiRequest('/books'),
        apiRequest('/users'),
      ]);

      setTransactions(Array.isArray(transactionData)
        ? transactionData
        : transactionData.transactions || []);

      setBooks(Array.isArray(bookData) ? bookData : bookData.books || []);

      setUsers(Array.isArray(userData)
        ? userData
        : userData.users || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSaving(true);

    const endpoints = {
      BORROW: '/transactions/borrow',
      RETURN: '/transactions/return',
      STOCK_IN: '/transactions/stock',
    };

    try {
      const data = await apiRequest(endpoints[type], {
        method: 'POST',
        body: JSON.stringify({
          ...form,
          quantity: Number(form.quantity),
          bookId: Number(form.bookId),
          userId: Number(form.userId),
        }),
      });

      setSuccess(data.message || 'Transaction completed successfully.');

      setForm({
        bookId: '',
        userId: '',
        quantity: 1,
        notes: '',
      });

      await loadData();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const transactionLabel = {
    BORROW: 'Borrow Book',
    RETURN: 'Return Book',
    STOCK_IN: 'Add Stock',
  };

  const getTypeLabel = (value) => {
    const labels = {
      BORROW: 'Borrowed',
      RETURN: 'Returned',
      STOCK_IN: 'Stock Added',
    };

    return labels[value] || value;
  };

  return (
    <div className="page-content">
      <div className="page-header">
        <div>
          <span className="page-eyebrow">LIBRARY OPERATIONS</span>
          <h1>Transactions</h1>
          <p>Manage borrowing, returns and stock additions.</p>
        </div>

        <button className="refresh-button" onClick={loadData}>
          <RefreshCw size={17} /> Refresh
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      <section className="content-card">
        <div className="card-heading">
          <div>
            <h2>New Transaction</h2>
            <p>Select an operation and complete the transaction details.</p>
          </div>
        </div>

        <div className="transaction-tabs">
          <button
            className={type === 'BORROW' ? 'transaction-tab active' : 'transaction-tab'}
            onClick={() => setType('BORROW')}
          >
            <ArrowDownToLine size={18} /> Borrow
          </button>

          <button
            className={type === 'RETURN' ? 'transaction-tab active' : 'transaction-tab'}
            onClick={() => setType('RETURN')}
          >
            <ArrowUpFromLine size={18} /> Return
          </button>

          <button
            className={type === 'STOCK_IN' ? 'transaction-tab active' : 'transaction-tab'}
            onClick={() => setType('STOCK_IN')}
          >
            <PackagePlus size={18} /> Add Stock
          </button>
        </div>

        <form onSubmit={handleSubmit} className="book-form">
          <div className="form-grid">
            <div className="field-group">
              <label>Select Book</label>
              <select
                name="bookId"
                value={form.bookId}
                onChange={handleChange}
                required
              >
                <option value="">Choose a book</option>
                {books.map((book) => (
                  <option key={book.id} value={book.id}>
                    {book.title} (Available: {book.available_quantity})
                  </option>
                ))}
              </select>
            </div>

            <div className="field-group">
              <label>Select Member</label>
              <select
                name="userId"
                value={form.userId}
                onChange={handleChange}
                required
              >
                <option value="">Choose a member</option>
                {users.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.name} ({user.membership_id})
                  </option>
                ))}
              </select>
            </div>

            <div className="field-group">
              <label>Quantity</label>
              <input
                type="number"
                name="quantity"
                min="1"
                value={form.quantity}
                onChange={handleChange}
                required
              />
            </div>

            <div className="field-group">
              <label>Notes (Optional)</label>
              <input
                type="text"
                name="notes"
                placeholder="Enter transaction notes"
                value={form.notes}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-actions">
            <button type="submit" className="primary-button" disabled={saving}>
              {saving ? 'Processing...' : transactionLabel[type]}
            </button>
          </div>
        </form>
      </section>

      <section className="content-card">
        <div className="table-toolbar">
          <div>
            <h2>Transaction History</h2>
            <p>Record of library activities</p>
          </div>
          <History size={23} />
        </div>

        {loading ? (
          <p className="empty-state">Loading transactions...</p>
        ) : transactions.length === 0 ? (
          <p className="empty-state">No transactions recorded yet.</p>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Book</th>
                  <th>Member</th>
                  <th>Type</th>
                  <th>Quantity</th>
                  <th>Date</th>
                  <th>Notes</th>
                </tr>
              </thead>

              <tbody>
                {transactions.map((transaction) => (
                  <tr key={transaction.id}>
                    <td><strong>{transaction.book_title || transaction.title || `Book #${transaction.book_id}`}</strong></td>
                    <td>{transaction.user_name || transaction.name || `User #${transaction.user_id}`}</td>
                    <td>
                      <span className={`status-badge ${
                        transaction.transaction_type === 'BORROW'
                          ? 'low'
                          : 'available'
                      }`}>
                        {getTypeLabel(transaction.transaction_type)}
                      </span>
                    </td>
                    <td>{transaction.quantity}</td>
                    <td>
                      {transaction.transaction_date
                        ? new Date(transaction.transaction_date).toLocaleDateString()
                        : '—'}
                    </td>
                    <td>{transaction.notes || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
