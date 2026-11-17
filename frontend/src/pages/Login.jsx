
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Library,
  LockKeyhole,
  UserRound,
  ArrowRight,
  BookOpen,
  ShieldCheck
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [membershipId, setMembershipId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(membershipId, password);
      navigate('/');
    } catch (err) {
      setError(err.message || 'Unable to sign in. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">

      {/* LEFT WELCOME PANEL */}
      <section className="login-showcase">
        <div className="login-glow login-glow-one"></div>
        <div className="login-glow login-glow-two"></div>

        <Link to="/login" className="login-brand">
          <span className="login-brand-icon">
            <Library size={29} strokeWidth={1.8} />
          </span>
          <span>Libra<span>Core</span></span>
        </Link>

        <div className="showcase-content">
          <span className="showcase-label">
            YOUR KNOWLEDGE, YOUR LIBRARY
          </span>

          <h1>
            A smarter way
            <br />
            to manage your
            <br />
            <span>library.</span>
          </h1>

          <p>
            Discover books, manage your reading journey and
            stay connected to everything your library offers.
          </p>

          <div className="showcase-features">
            <div className="showcase-feature">
              <span className="feature-icon">
                <BookOpen size={20} />
              </span>
              <div>
                <strong>Explore knowledge</strong>
                <small>Find books and discover new ideas.</small>
              </div>
            </div>

            <div className="showcase-feature">
              <span className="feature-icon">
                <ShieldCheck size={20} />
              </span>
              <div>
                <strong>Your library, organized</strong>
                <small>Keep your borrowing activity in one place.</small>
              </div>
            </div>
          </div>
        </div>

        <div className="showcase-bottom">
          <span>LIBRACORE LIBRARY MANAGEMENT SYSTEM</span>
          <span>LEARN. DISCOVER. GROW.</span>
        </div>

        <div className="showcase-decoration">
          <Library size={220} strokeWidth={0.45} />
        </div>
      </section>

      {/* RIGHT LOGIN PANEL */}
      <section className="login-main">
        <div className="login-top-note">
          <span>NEW TO LIBRACORE?</span>
          <Link to="/register">Create an account <ArrowRight size={15} /></Link>
        </div>

        <div className="login-form-area">
          <div className="login-mobile-brand">
            <span className="login-brand-icon">
              <Library size={25} />
            </span>
            <span>Libra<span>Core</span></span>
          </div>

          <div className="login-heading">
            <span className="login-eyebrow">MEMBER ACCESS</span>
            <h2>Welcome back.</h2>
            <p>Sign in to continue to your library account.</p>
          </div>

          {error && (
            <div className="login-error">
              {error}
            </div>
          )}

          <form className="login-form" onSubmit={handleSubmit}>
            <div className="login-field">
              <label htmlFor="membershipId">Membership ID</label>
              <div className="login-input-wrap">
                <UserRound size={19} />
                <input
                  id="membershipId"
                  type="text"
                  placeholder="Enter your membership ID"
                  value={membershipId}
                  onChange={(e) => setMembershipId(e.target.value)}
                  autoComplete="username"
                  required
                />
              </div>
            </div>

            <div className="login-field">
              <label htmlFor="password">Password</label>
              <div className="login-input-wrap">
                <LockKeyhole size={19} />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="login-submit"
              disabled={loading}
            >
              <span>{loading ? 'Signing you in...' : 'Sign In to LibraCore'}</span>
              {!loading && <ArrowRight size={19} />}
            </button>
          </form>

          <div className="login-divider">
            <span></span>
            <small>YOUR LIBRARY AWAITS</small>
            <span></span>
          </div>

          <p className="login-register">
            Don't have an account?
            <Link to="/register"> Create your account</Link>
          </p>

          <div className="login-security">
            <ShieldCheck size={17} />
            <span>Your account is protected by secure authentication.</span>
          </div>
        </div>

        <div className="login-copyright">
          © 2026 LibraCore. Library Management System.
        </div>
      </section>
    </div>
  );
}
