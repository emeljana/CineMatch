import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import Button from '../../components/Button/Button';
import Input from '../../components/Input/Input';
import './Login.css';

function validateLogin(email, password) {
  const errors = {};
  if (!email.trim()) {
    errors.email = 'Email is required.';
  } else if (!email.includes('@')) {
    errors.email = 'Enter a valid email address.';
  }
  if (!password) {
    errors.password = 'Password is required.';
  }
  return errors;
}

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const { handleLogin, loading, error, setError } = useAuth();

  async function handleSubmit(e) {
    e.preventDefault();
    const nextErrors = validateLogin(email, password);
    setFieldErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    await handleLogin(email, password);
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <h1 className="login-logo">CineMatch</h1>
        <h2 className="login-title">Log in</h2>

        <form onSubmit={handleSubmit} className="login-form" noValidate>
          <Input
            id="email"
            type="email"
            label="Email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setFieldErrors((currentErrors) => ({ ...currentErrors, email: null }));
              setError(null);
            }}
            error={fieldErrors.email}
            required
            disabled={loading}
            autoComplete="email"
          />

          <Input
            id="password"
            type="password"
            label="Password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setFieldErrors((currentErrors) => ({ ...currentErrors, password: null }));
              setError(null);
            }}
            error={fieldErrors.password}
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
