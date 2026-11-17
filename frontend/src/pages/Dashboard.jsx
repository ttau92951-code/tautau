
import { useEffect, useState } from 'react';
import {
  BookOpen,
  BookCheck,
  BookX,
  AlertTriangle,
  RefreshCw,
  Library,
  CheckCircle2,
} from 'lucide-react';
import { apiRequest } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function Dashboard() {
  const { user } = useAuth();
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadBooks = async () => {
    setLoading(true);
    setError('');

    try {
      const data = await apiRequest('/books');
      setBooks(Array.isArray(data) ? data : data.books || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBooks();
  }, []);

  const totalBooks = books.reduce(
    (total, book) => total + Number(book.quantity || 0), 0
  );

  const availableBooks = books.reduce(
    (total, book) => total + Number(book.available_quantity || 0), 0
  );

  const borrowedBooks = totalBooks - availableBooks;

  const lowStockBooks = books.filter(
    (book) => Number(book.available_quantity) < 2
  );

  const recentBooks = [...books].reverse().slice(0, 5);

  const stats = [
    {
      title: 'Total Books',
      value: totalBooks,
      icon: BookOpen,
      color: 'blue',
      description: `${books.length} registered titles`,
    },
    {
      title: 'Available Books',
      value: availableBooks,
      icon: BookCheck,
      color: 'green',
      description: 'Ready for borrowing',
    },
    {
      title: 'Borrowed Books',
      value: borrowedBooks,
      icon: BookX,
      color: 'purple',
      description: 'Currently on loan',
    },
    {
      title: 'Low Stock',
      value: lowStockBooks.length,
      icon: AlertTriangle,
      color: 'orange',
      description: 'Titles needing attention',
    },
  ];

  return (
    <div className="page-content dashboard-page">

      <div className="dashboard-welcome">
        <div>
          <span className="page-eyebrow">LIBRARY OVERVIEW</span>
          <h1>Welcome back, {user?.name || 'User'}.</h1>
          <p>
            Here's what's happening in your library today.
            Keep track of your books, availability and stock levels.
          </p>
        </div>

        <div className="welcome-decoration">
          <Library size={66} strokeWidth={1.2} />
        </div>
      </div>

      <div className="dashboard-toolbar">
        <div>
          <h2>Dashboard Overview</h2>
          <p>Your library statistics at a glance</p>
        </div>

        <button
          className="refresh-button"
          onClick={loadBooks}
          disabled={loading}
        >
          <RefreshCw size={17} className={loading ? 'refresh-spinning' : ''} />
          {loading ? 'Loading...' : 'Refresh'}
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="stats-grid">
        {stats.map((stat) => {
          const Icon = stat.icon;

          return (
            <div className="stat-card" key={stat.title}>
              <div className={`stat-icon ${stat.color}`}>
                <Icon size={23} />
              </div>

              <div className="stat-details">
                <span>{stat.title}</span>
                <h2>{loading ? '...' : stat.value}</h2>
                <small>{stat.description}</small>
              </div>
            </div>
          );
        })}
      </div>

      <div className="dashboard-grid">

        <section className="content-card recent-card">
          <div className="card-heading">
            <div>
              <h2>Recently Added Books</h2>
              <p>Your latest registered books</p>
            </div>
            <span className="dashboard-count">
              {books.length} titles
            </span>
          </div>

          {loading ? (
            <p className="empty-state">Loading books...</p>
          ) : recentBooks.length === 0 ? (
            <div className="dashboard-empty">
              <BookOpen size={30} />
              <strong>No books yet</strong>
              <p>Newly registered books will appear here.</p>
            </div>
          ) : (
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Book Title</th>
                    <th>Author</th>
                    <th>Genre</th>
                    <th>Available</th>
                    <th>Status</th>
                  </tr>
                </thead>

                <tbody>
                  {recentBooks.map((book) => {
                    const available = Number(book.available_quantity || 0);
                    const lowStock = available < 2;

                    return (
                      <tr key={book.id}>
                        <td>
                          <strong>{book.title}</strong>
                        </td>
                        <td>{book.author}</td>
                        <td>{book.genre}</td>
                        <td>
                          <strong>{available}</strong>
                        </td>
                        <td>
                          <span className={
                            lowStock
                              ? 'status-badge low'
                              : 'status-badge available'
                          }>
                            {lowStock ? 'Low Stock' : 'Available'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section className="content-card low-stock-card">
          <div className="card-heading">
            <div>
              <h2>Stock Alerts</h2>
              <p>Books with fewer than 2 available copies</p>
            </div>
            <AlertTriangle size={21} className="alert-icon" />
          </div>

          {loading ? (
            <p className="empty-state">Checking stock levels...</p>
          ) : lowStockBooks.length === 0 ? (
            <div className="dashboard-empty stock-clear">
              <CheckCircle2 size={32} />
              <strong>All clear!</strong>
              <p>All books have sufficient available stock.</p>
            </div>
          ) : (
            <div className="alert-list">
              {lowStockBooks.map((book) => (
                <div className="alert-item" key={book.id}>
                  <div className="alert-book-icon">
                    <BookOpen size={19} />
                  </div>

                  <div className="alert-book-details">
                    <strong>{book.title}</strong>
                    <small>{book.author}</small>
                  </div>

                  <span className="stock-count">
                    {book.available_quantity} left
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>

      </div>
    </div>
  );
}
