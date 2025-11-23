import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { authService } from '../services/authService';

interface RegisterPageProps {
  onRegister: () => void;
}

const RegisterPage: React.FC<RegisterPageProps> = ({ onRegister }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 12) {
      setError('Password must be at least 12 characters long');
      return;
    }

    setIsLoading(true);

    try {
      await authService.register({ email, password });
      onRegister();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1>🔒 ZK Notes</h1>
          <p>Create Your Secure Account</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
              autoComplete="email"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Master Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 12 characters"
              required
              autoComplete="new-password"
              minLength={12}
            />
            <small className="form-hint">
              Minimum 12 characters. Use a strong, unique password.
            </small>
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-enter your password"
              required
              autoComplete="new-password"
            />
          </div>

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          <button 
            type="submit" 
            className="btn btn-primary btn-block"
            disabled={isLoading}
          >
            {isLoading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            Already have an account? <Link to="/login">Login</Link>
          </p>
        </div>

        <div className="security-notice warning">
          <p>⚠️ <strong>Important Security Notice</strong></p>
          <p>Your master password cannot be recovered. Make sure to:</p>
          <ul>
            <li>Use a strong, unique password</li>
            <li>Store it securely (password manager recommended)</li>
            <li>Never share it with anyone</li>
          </ul>
          <p>We cannot reset your password as we never have access to it.</p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
