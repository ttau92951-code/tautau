
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  BookOpen,
  ArrowLeftRight,
  Users,
  LogOut,
  Library,
  History,
  BookMarked,
} from 'lucide-react';

import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const role = user?.role;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const adminLinks = [
    { to: '/', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/books', label: 'Book Management', icon: BookOpen },
    { to: '/transactions', label: 'Transactions', icon: ArrowLeftRight },
    { to: '/users', label: 'User Management', icon: Users },
  ];

  const librarianLinks = [
    { to: '/', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/books', label: 'Book Management', icon: BookOpen },
    { to: '/transactions', label: 'Transactions', icon: ArrowLeftRight },
  ];

  const memberLinks = [
    { to: '/', label: 'My Dashboard', icon: LayoutDashboard },
    { to: '/browse-books', label: 'Browse Books', icon: BookOpen },
    { to: '/my-borrowings', label: 'My Borrowings', icon: BookMarked },
    { to: '/my-history', label: 'My History', icon: History },
  ];

  const links =
    role === 'admin'
      ? adminLinks
      : role === 'librarian'
        ? librarianLinks
        : memberLinks;

  return (
    <aside className="sidebar">
      <div className="brand">
        <Library size={30} />
        <span>
          Libra<span className="brand-highlight">Core</span>
        </span>
      </div>

      <p className="nav-heading">
        {role === 'member' ? 'MEMBER PORTAL' : 'LIBRARY MANAGEMENT'}
      </p>

      <nav className="nav-links">
        {links.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              isActive ? 'nav-link active' : 'nav-link'
            }
          >
            <Icon size={19} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-bottom">
        <div className="user-info">
          <div className="user-avatar">
            {user?.name?.charAt(0).toUpperCase() || 'U'}
          </div>

          <div>
            <strong>{user?.name}</strong>
            <small>{role}</small>
          </div>
        </div>

        <button className="logout-button" onClick={handleLogout}>
          <LogOut size={18} />
          Logout
        </button>
      </div>
    </aside>
  );
}
