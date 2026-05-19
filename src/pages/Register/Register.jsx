import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import Button from '../../components/Button/Button';
import Input from '../../components/Input/Input';
import './Register.css';

function validateRegister(username, email, password) {
  const errors = {};
  const trimmedUsername = username.trim();
  if (trimmedUsername.length < 3) {
    errors.username = 'Username must be at least 3 characters.';
  } else if (trimmedUsername.length > 20) {
    errors.username = 'Username cannot be longer than 20 characters.';
  }
  if (!email.trim()) {
    errors.email = 'Email is required.';
  } else if (!email.includes('@')) {
    errors.email = 'Enter a valid email address.';
  }
  if (password.length < 6) {
    errors.password = 'Password must be at least 6 characters.';
  } else if (password.length > 100) {
    errors.password = 'Password cannot be longer than 100 characters.';
  }
  return errors;
}

function Register() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const { handleRegister, loading, error, setError } = useAuth();

  async function handleSubmit(e) {
    e.preventDefault();
    const nextErrors = validateRegister(username, email, password);
    setFieldErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    await handleRegister(username, email, password);
  }

  return (
    <div className="register-page">
      <div className="register-card">
        <h1 className="register-logo">CineMatch</h1>
        <h2 className="register-title">Create account</h2>

        <form onSubmit={handleSubmit} className="register-form" noValidate>
          <Input
            id="username"
            type="text"
            label="Username"
            value={username}
            onChange={(e) => {
              setUsername(e.target.value);
              setFieldErrors((currentErrors) => ({ ...currentErrors, username: null }));
              setError(null);
            }}
            error={fieldErrors.username}
            required
            minLength={3}
            maxLength={20}
            disabled={loading}
            autoComplete="username"
          />

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
            minLength={6}
            maxLength={100}
            disabled={loading}
            autoComplete="new-password"
          />

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
