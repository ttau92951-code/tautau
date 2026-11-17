
import { useEffect, useState } from 'react';
import {
  Users as UsersIcon,
  Plus,
  Pencil,
  Trash2,
  X,
  RefreshCw,
  Search,
} from 'lucide-react';
import { apiRequest } from '../services/api';

const emptyForm = {
  name: '',
  membershipId: '',
  password: '',
  role: 'member',
};

export default function Users() {
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const loadUsers = async () => {
    setLoading(true);
    setError('');

    try {
      const data = await apiRequest('/users');
      setUsers(Array.isArray(data) ? data : data.users || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const filteredUsers = users.filter((user) =>
    `${user.name} ${user.membership_id} ${user.role}`
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

  const handleEdit = (user) => {
    setForm({
      name: user.name,
      membershipId: user.membership_id,
      password: '',
      role: user.role,
    });

    setEditingId(user.id);
    setShowForm(true);
    setError('');
    setSuccess('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSaving(true);

    const payload = { ...form };

    if (editingId && !payload.password) {
      delete payload.password;
    }

    try {
      if (editingId) {
        await apiRequest(`/users/${editingId}`, {
          method: 'PUT',
          body: JSON.stringify(payload),
        });
        setSuccess('User updated successfully.');
      } else {
        await apiRequest('/users', {
          method: 'POST',
          body: JSON.stringify(payload),
        });
        setSuccess('User created successfully.');
      }

      resetForm();
      await loadUsers();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;

    setError('');
    setSuccess('');

    try {
      await apiRequest(`/users/${id}`, { method: 'DELETE' });
      setSuccess('User deleted successfully.');
      await loadUsers();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="page-content">
      <div className="page-header">
        <div>
          <span className="page-eyebrow">ADMINISTRATION</span>
          <h1>User Management</h1>
          <p>Manage library members, librarians and administrator accounts.</p>
        </div>

        <div className="header-actions">
          <button className="refresh-button" onClick={loadUsers}>
            <RefreshCw size={17} /> Refresh
          </button>

          <button
            className="primary-button"
            onClick={() => {
              resetForm();
              setShowForm(true);
            }}
          >
            <Plus size={18} /> Add User
          </button>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      {showForm && (
        <section className="content-card form-card">
          <div className="card-heading">
            <div>
              <h2>{editingId ? 'Update User' : 'Add New User'}</h2>
              <p>Enter the account information.</p>
            </div>

            <button className="icon-button" onClick={resetForm}>
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="book-form">
            <div className="form-grid">
              <div className="field-group">
                <label>Full Name</label>
                <input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Enter full name"
                  required
                />
              </div>

              <div className="field-group">
                <label>Membership ID</label>
                <input
                  name="membershipId"
                  value={form.membershipId}
                  onChange={handleChange}
                  placeholder="Enter membership ID"
                  required
                />
              </div>

              <div className="field-group">
                <label>{editingId ? 'New Password (Optional)' : 'Password'}</label>
                <input
                  type="password"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Minimum 8 characters"
                  required={!editingId}
                  minLength={8}
                />
              </div>

              <div className="field-group">
                <label>Account Role</label>
                <select
                  name="role"
                  value={form.role}
                  onChange={handleChange}
                  required
                >
                  <option value="member">Member</option>
                  <option value="librarian">Librarian</option>
                  <option value="admin">Administrator</option>
                </select>
              </div>
            </div>

            <div className="form-actions">
              <button type="button" className="secondary-button" onClick={resetForm}>
                Cancel
              </button>

              <button type="submit" className="primary-button" disabled={saving}>
                {saving ? 'Saving...' : editingId ? 'Update User' : 'Create User'}
              </button>
            </div>
          </form>
        </section>
      )}

      <section className="content-card">
        <div className="table-toolbar">
          <div>
            <h2>Registered Users</h2>
            <p>{users.length} registered accounts</p>
          </div>

          <div className="search-box">
            <Search size={18} />
            <input
              type="search"
              placeholder="Search users..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {loading ? (
          <p className="empty-state">Loading users...</p>
        ) : filteredUsers.length === 0 ? (
          <div className="empty-state">
            <UsersIcon size={35} />
            <p>No users found.</p>
          </div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Membership ID</th>
                  <th>Role</th>
                  <th>Registered</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user.id}>
                    <td><strong>{user.name}</strong></td>
                    <td>{user.membership_id}</td>
                    <td>
                      <span className="status-badge available">
                        {user.role}
                      </span>
                    </td>
                    <td>
                      {user.created_at
                        ? new Date(user.created_at).toLocaleDateString()
                        : '—'}
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button
                          className="icon-button edit"
                          title="Edit user"
                          onClick={() => handleEdit(user)}
                        >
                          <Pencil size={17} />
                        </button>

                        <button
                          className="icon-button delete"
                          title="Delete user"
                          onClick={() => handleDelete(user.id)}
                        >
                          <Trash2 size={17} />
                        </button>
                      </div>
                    </td>
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
