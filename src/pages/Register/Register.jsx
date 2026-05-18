import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import Button from '../../components/Button/Button';
import './Register.css';

function Register() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { handleRegister, loading, error } = useAuth();

  async function handleSubmit(e) {
    e.preventDefault();
    await handleRegister(username, email, password);
  }

  return (
    <div className="register-page">
      <div className="register-card">
        <h1 className="register-logo">CineMatch</h1>
        <h2 className="register-title">Create account</h2>

        <form onSubmit={handleSubmit} className="register-form">
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              minLength={3}
              maxLength={20}
              disabled={loading}
              autoComplete="username"
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
              autoComplete="email"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              maxLength={100}
              disabled={loading}
              autoComplete="new-password"
            />
          </div>

          {error && <p className="form-error">{error}</p>}

          <Button type="submit" disabled={loading} fullWidth>
            {loading ? 'Creating account...' : 'Create account'}
          </Button>
        </form>

        <div className="register-footer">
          <span>
            Already have an account? <Link to="/login">Log in</Link>
          </span>
        </div>
      </div>
    </div>
  );
}

export default Register;
