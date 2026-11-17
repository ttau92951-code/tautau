
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Library,
  UserRound,
  LockKeyhole,
  ArrowRight,
  BookOpen,
  ShieldCheck
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [membershipId, setMembershipId] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (password.length < 8) {
      setError('Password must contain at least 8 characters.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);

    try {
      await register(name, membershipId, password);
      setSuccess('Account created successfully! Redirecting to login...');

      setTimeout(() => navigate('/login'), 1500);
    } catch (err) {
      setError(err.message || 'Unable to create your account.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-page">

      {/* LEFT WELCOME PANEL */}
      <section className="register-showcase">
        <div className="register-glow register-glow-one"></div>
        <div className="register-glow register-glow-two"></div>

        <Link to="/register" className="register-brand">
          <span className="register-brand-icon">
            <Library size={29} strokeWidth={1.8} />
          </span>
          <span>Libra<span>Core</span></span>
        </Link>

        <div className="register-showcase-content">
          <span className="register-showcase-label">
            BEGIN YOUR NEXT CHAPTER
          </span>

          <h1>
            Every great
            <br />
            journey begins
            <br />
            <span>with a book.</span>
          </h1>

          <p>
            Become part of a connected library experience.
            Discover books, manage your borrowings and
            make knowledge part of your everyday life.
          </p>

          <div className="register-features">
            <div className="register-feature">
              <span className="register-feature-icon">
                <BookOpen size={20} />
              </span>
              <div>
                <strong>Discover your next read</strong>
                <small>Explore the library collection.</small>
              </div>
            </div>

            <div className="register-feature">
              <span className="register-feature-icon">
                <ShieldCheck size={20} />
              </span>
              <div>
                <strong>Your personal library account</strong>
                <small>Keep track of your borrowing activity.</small>
              </div>
            </div>
          </div>
        </div>

        <div className="register-showcase-bottom">
          <span>LIBRACORE LIBRARY MANAGEMENT SYSTEM</span>
          <span>LEARN. DISCOVER. GROW.</span>
        </div>

        <div className="register-decoration">
          <Library size={220} strokeWidth={0.45} />
        </div>
      </section>

      {/* RIGHT REGISTRATION PANEL */}
      <section className="register-main">
        <div className="register-top-note">
          <span>ALREADY A MEMBER?</span>
          <Link to="/login">Sign in <ArrowRight size={15} /></Link>
        </div>

        <div className="register-form-area">
          <div className="register-mobile-brand">
            <span className="register-brand-icon">
              <Library size={25} />
            </span>
            <span>Libra<span>Core</span></span>
          </div>

          <div className="register-heading">
            <span className="register-eyebrow">CREATE YOUR MEMBERSHIP</span>
            <h2>Join LibraCore.</h2>
            <p>Enter your details to create your library account.</p>
          </div>

          {error && (
            <div className="register-error">
              {error}
            </div>
          )}

          {success && (
            <div className="register-success">
              {success}
            </div>
          )}

          <form className="register-form" onSubmit={handleSubmit}>
            <div className="register-field">
              <label htmlFor="registerName">Full Name</label>
              <div className="register-input-wrap">
                <UserRound size={19} />
                <input
                  id="registerName"
                  type="text"
                  placeholder="Enter your full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  autoComplete="name"
                  required
                />
              </div>
            </div>

            <div className="register-field">
              <label htmlFor="registerMembership">Membership ID</label>
              <div className="register-input-wrap">
                <Library size={19} />
                <input
                  id="registerMembership"
                  type="text"
                  placeholder="Choose a membership ID"
                  value={membershipId}
                  onChange={(e) => setMembershipId(e.target.value)}
                  autoComplete="username"
                  required
                />
              </div>
            </div>

            <div className="register-field">
              <label htmlFor="registerPassword">Password</label>
              <div className="register-input-wrap">
                <LockKeyhole size={19} />
                <input
                  id="registerPassword"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Minimum 8 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="new-password"
                  minLength={8}
                  required
                />
                <button
                  type="button"
                  className="register-password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>

            <div className="register-field">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <div className="register-input-wrap">
                <LockKeyhole size={19} />
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Enter your password again"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  autoComplete="new-password"
                  required
                />
                <button
                  type="button"
                  className="register-password-toggle"
                  onClick={() =>
                    setShowConfirmPassword(!showConfirmPassword)
                  }
                >
                  {showConfirmPassword ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="register-submit"
              disabled={loading || Boolean(success)}
            >
              <span>
                {loading ? 'Creating your account...' : 'Create My Account'}
              </span>
              {!loading && <ArrowRight size={19} />}
            </button>
          </form>

          <div className="register-divider">
            <span></span>
            <small>YOUR NEXT CHAPTER STARTS HERE</small>
            <span></span>
          </div>

          <p className="register-login">
            Already have an account?
            <Link to="/login"> Sign in</Link>
          </p>

          <div className="register-security">
            <ShieldCheck size={17} />
            <span>Your membership is protected by secure authentication.</span>
          </div>
        </div>

        <div className="register-copyright">
          © 2026 LibraCore. Library Management System.
        </div>
      </section>
    </div>
  );
}
