import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import Button from '../../components/Button/Button';
import Input from '../../components/Input/Input';

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
    <div className="flex items-center justify-center min-h-screen p-6 bg-bg max-[480px]:items-start max-[480px]:p-4">
      <div className="bg-surface border border-border rounded-lg p-10 w-full max-w-[420px] shadow-lg max-[480px]:p-7 max-[480px]:px-5 max-[480px]:shadow-none">
        <h1 className="text-[28px] font-bold text-accent text-center mb-2">CineMatch</h1>
        <h2 className="text-lg font-medium text-muted text-center mb-8">Create account</h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5 max-[480px]:gap-4" noValidate>
          <Input
            id="username"
            type="text"
            label="Username"
            value={username}
            onChange={(e) => {
              setUsername(e.target.value);
              setFieldErrors((current) => ({ ...current, username: null }));
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
              setFieldErrors((current) => ({ ...current, email: null }));
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
              setFieldErrors((current) => ({ ...current, password: null }));
              setError(null);
            }}
            error={fieldErrors.password}
            required
            minLength={6}
            maxLength={100}
            disabled={loading}
            autoComplete="new-password"
          />

          {error && (
            <p className="text-sm text-dislike bg-[rgba(239,68,68,0.1)] border border-[rgba(239,68,68,0.3)] rounded-sm px-3.5 py-2.5">
              {error}
            </p>
          )}

          <Button type="submit" disabled={loading} fullWidth>
            {loading ? 'Creating account...' : 'Create account'}
          </Button>
        </form>

        <div className="text-center mt-6 text-sm text-muted">
          Already have an account? <Link to="/login">Log in</Link>
        </div>
      </div>
    </div>
  );
}

export default Register;
