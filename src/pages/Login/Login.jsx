import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import Button from '../../components/Button/Button';
import Input from '../../components/Input/Input';

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
    <div className="flex items-center justify-center min-h-screen p-6 bg-bg max-[480px]:items-start max-[480px]:p-4">
      <div className="bg-surface border border-border rounded-lg p-10 w-full max-w-[420px] shadow-lg max-[480px]:p-7 max-[480px]:px-5 max-[480px]:shadow-none">
        <h1 className="text-[28px] font-bold text-accent text-center mb-2">CineMatch</h1>
        <h2 className="text-lg font-medium text-muted text-center mb-8">Log in</h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5 max-[480px]:gap-4" noValidate>
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
            disabled={loading}
            autoComplete="current-password"
          />

          {error && (
            <p className="text-sm text-dislike bg-[rgba(239,68,68,0.1)] border border-[rgba(239,68,68,0.3)] rounded-sm px-3.5 py-2.5">
              {error}
            </p>
          )}

          <Button type="submit" disabled={loading} fullWidth>
            {loading ? 'Logging in...' : 'Log in'}
          </Button>
        </form>

        <div className="flex items-center justify-center gap-3 mt-6 text-sm text-muted flex-wrap max-[480px]:flex-col max-[480px]:gap-2">
          <Link to="/forgot-password">Forgot password?</Link>
          <span className="w-px h-3.5 bg-border max-[480px]:hidden" />
          <span>No account? <Link to="/register">Register</Link></span>
        </div>
      </div>
    </div>
  );
}

export default Login;
