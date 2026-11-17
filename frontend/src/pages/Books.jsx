
import { useEffect, useState } from 'react';
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  X,
  BookOpen,
  RefreshCw,
} from 'lucide-react';
import { apiRequest } from '../services/api';
import { useAuth } from '../context/AuthContext';

const emptyForm = {
  title: '',
  author: '',
  genre: '',
  isbn: '',
  quantity: 1,
};

export default function Books() {
  const { user } = useAuth();

  const [books, setBooks] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const canManage = ['admin', 'librarian'].includes(user?.role);

  const loadBooks = async () => {
    setLoading(true);
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

  const filteredBooks = books.filter((book) =>
    `${book.title} ${book.author} ${book.genre} ${book.isbn}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
    setShowForm(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSaving(true);

    const payload = {
      ...form,
      quantity: Number(form.quantity),
    };

    try {
      if (editingId) {
        await apiRequest(`/books/${editingId}`, {
          method: 'PUT',
          body: JSON.stringify(payload),
        });
        setSuccess('Book updated successfully.');
      } else {
        await apiRequest('/books', {
          method: 'POST',
          body: JSON.stringify(payload),
        });
        setSuccess('Book added successfully.');
      }

      resetForm();
      await loadBooks();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (book) => {
    setForm({
      title: book.title,
      author: book.author,
      genre: book.genre,
      isbn: book.isbn,
      quantity: book.quantity,
    });
    setEditingId(book.id);
    setShowForm(true);
    setError('');
    setSuccess('');
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm('Are you sure you want to delete this book?');

    if (!confirmed) return;

    setError('');
    setSuccess('');

    try {
      await apiRequest(`/books/${id}`, { method: 'DELETE' });
      setSuccess('Book deleted successfully.');
      await loadBooks();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="page-content">
      <div className="page-header">
        <div>
          <span className="page-eyebrow">LIBRARY COLLECTION</span>
          <h1>Book Management</h1>
          <p>Manage your library collection and monitor book availability.</p>
        </div>

        <div className="header-actions">
          <button className="refresh-button" onClick={loadBooks}>
            <RefreshCw size={17} /> Refresh
          </button>

          {canManage && (
            <button
              className="primary-button"
              onClick={() => {
                resetForm();
                setShowForm(true);
              }}
            >
              <Plus size={18} /> Add New Book
            </button>
          )}
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      {showForm && (
        <section className="content-card form-card">
          <div className="card-heading">
            <div>
              <h2>{editingId ? 'Update Book' : 'Add New Book'}</h2>
              <p>Enter the book information below.</p>
            </div>
            <button className="icon-button" onClick={resetForm}>
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="book-form">
            <div className="form-grid">
              <div className="field-group">
                <label>Book Title</label>
                <input
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  placeholder="Enter book title"
                  required
                />
              </div>

              <div className="field-group">
                <label>Author</label>
                <input
                  name="author"
                  value={form.author}
                  onChange={handleChange}
                  placeholder="Enter author name"
                  required
                />
              </div>

              <div className="field-group">
                <label>Genre</label>
                <input
                  name="genre"
                  value={form.genre}
                  onChange={handleChange}
                  placeholder="e.g. Technology"
                  required
                />
              </div>

              <div className="field-group">
                <label>ISBN</label>
                <input
                  name="isbn"
                  value={form.isbn}
                  onChange={handleChange}
                  placeholder="Enter ISBN"
                  required
                />
              </div>

              <div className="field-group">
                <label>Total Quantity</label>
                <input
                  type="number"
                  name="quantity"
                  min="1"
                  value={form.quantity}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-actions">
              <button type="button" className="secondary-button" onClick={resetForm}>
                Cancel
              </button>

              <button type="submit" className="primary-button" disabled={saving}>
                {saving ? 'Saving...' : editingId ? 'Update Book' : 'Save Book'}
              </button>
            </div>
          </form>
        </section>
      )}

      <section className="content-card">
        <div className="table-toolbar">
          <div>
            <h2>All Books</h2>
            <p>{books.length} registered book titles</p>
          </div>

          <div className="search-box">
            <Search size={18} />
            <input
              type="search"
              placeholder="Search books..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {loading ? (
          <p className="empty-state">Loading books...</p>
        ) : filteredBooks.length === 0 ? (
          <div className="empty-state">
            <BookOpen size={35} />
            <p>No books found.</p>
          </div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Book</th>
                  <th>Author</th>
                  <th>Genre</th>
                  <th>ISBN</th>
                  <th>Total</th>
                  <th>Available</th>
                  <th>Status</th>
                  {canManage && <th>Actions</th>}
                </tr>
              </thead>

              <tbody>
                {filteredBooks.map((book) => (
                  <tr key={book.id}>
                    <td><strong>{book.title}</strong></td>
                    <td>{book.author}</td>
                    <td>{book.genre}</td>
                    <td>{book.isbn}</td>
                    <td>{book.quantity}</td>
                    <td>{book.available_quantity}</td>
                    <td>
                      <span className={
                        Number(book.available_quantity) < 2
                          ? 'status-badge low'
                          : 'status-badge available'
                      }>
                        {Number(book.available_quantity) < 2 ? 'Low Stock' : 'Available'}
                      </span>
                    </td>

                    {canManage && (
                      <td>
                        <div className="action-buttons">
                          <button
                            className="icon-button edit"
                            title="Edit book"
                            onClick={() => handleEdit(book)}
                          >
                            <Pencil size={17} />
                          </button>

                          <button
                            className="icon-button delete"
                            title="Delete book"
                            onClick={() => handleDelete(book.id)}
                          >
                            <Trash2 size={17} />
                          </button>
                        </div>
                      </td>
                    )}
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
