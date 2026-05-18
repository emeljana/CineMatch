import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import Button from '../../components/Button/Button';
import Input from '../../components/Input/Input';
import './Login.css';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { handleLogin, loading, error } = useAuth();

  async function handleSubmit(e) {
    e.preventDefault();
    await handleLogin(email, password);
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <h1 className="login-logo">CineMatch</h1>
        <h2 className="login-title">Log in</h2>

        <form onSubmit={handleSubmit} className="login-form">
          <Input
            id="email"
            type="email"
            label="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={loading}
            autoComplete="email"
          />

          <Input
            id="password"
            type="password"
            label="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={loading}
            autoComplete="current-password"
          />

          {error && <p className="form-error">{error}</p>}

          <Button type="submit" disabled={loading} fullWidth>
            {loading ? 'Logging in...' : 'Log in'}
          </Button>
        </form>

        <div className="login-footer">
          <Link to="/forgot-password">Forgot password?</Link>
          <span className="login-footer-divider" />
          <span>
            No account? <Link to="/register">Register</Link>
          </span>
        </div>
      </div>
    </div>
  );
}

export default Login;
