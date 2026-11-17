
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate
} from 'react-router-dom';

import { AuthProvider, useAuth } from './context/AuthContext';

import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';

import Login from './pages/Login';
import Register from './pages/Register';

import Dashboard from './pages/Dashboard';
import Books from './pages/Books';
import Transactions from './pages/Transactions';
import Users from './pages/Users';

import MemberDashboard from './pages/MemberDashboard';
import BrowseBooks from './pages/BrowseBooks';
import MyBorrowings from './pages/MyBorrowings';
import MyHistory from './pages/MyHistory';

import './App.css';

function MainLayout() {
  const { user } = useAuth();

  if (!user || !localStorage.getItem('library_token')) {
    return <Navigate to="/login" replace />;
  }

  const isMember = user.role === 'member';

  return (
    <div className="app-layout">
      <Navbar />

      <main className="main-content">
        <Routes>
          {/* Dashboard */}
          <Route
            path="/"
            element={
              isMember
                ? <MemberDashboard />
                : <ProtectedRoute allowedRoles={['admin', 'librarian']}>
                    <Dashboard />
                  </ProtectedRoute>
            }
          />

          {/* Staff pages */}
          <Route
            path="/books"
            element={
              <ProtectedRoute allowedRoles={['admin', 'librarian']}>
                <Books />
              </ProtectedRoute>
            }
          />

          <Route
            path="/transactions"
            element={
              <ProtectedRoute allowedRoles={['admin', 'librarian']}>
                <Transactions />
              </ProtectedRoute>
            }
          />

          <Route
            path="/users"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <Users />
              </ProtectedRoute>
            }
          />

          {/* Member pages */}
          <Route
            path="/browse-books"
            element={
              <ProtectedRoute allowedRoles={['member']}>
                <BrowseBooks />
              </ProtectedRoute>
            }
          />

          <Route
            path="/my-borrowings"
            element={
              <ProtectedRoute allowedRoles={['member']}>
                <MyBorrowings />
              </ProtectedRoute>
            }
          />

          <Route
            path="/my-history"
            element={
              <ProtectedRoute allowedRoles={['member']}>
                <MyHistory />
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}

function AppRoutes() {
  const { user } = useAuth();

  return (
    <Routes>
      <Route
        path="/login"
        element={user ? <Navigate to="/" replace /> : <Login />}
      />

      <Route
        path="/register"
        element={user ? <Navigate to="/" replace /> : <Register />}
      />

      <Route path="/*" element={<MainLayout />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
